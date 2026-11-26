-- Initial schema for momentum.
-- Principle: store facts, derive everything else (streaks, scores, XP are never stored).
-- Every table is owned by a user and protected by RLS.

-- ─── Enums ──────────────────────────────────────────────────────────────────

create type public.job_status as enum (
  'inbox', 'applied', 'response', 'interview', 'offer', 'rejected', 'ghosted'
);

create type public.job_platform as enum (
  'linkedin', 'indeed', 'naukri', 'wellfound', 'company_site', 'referral', 'other'
);

create type public.job_event_type as enum ('status_change', 'follow_up_sent');

create type public.mood as enum ('great', 'good', 'okay', 'low', 'bad');

-- ─── Helpers ────────────────────────────────────────────────────────────────

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── settings: one row per user ─────────────────────────────────────────────

create table public.settings (
  user_id              uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  timezone             text not null check (char_length(timezone) between 1 and 64),
  challenge_start_date date not null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ─── targets: history of daily targets ──────────────────────────────────────
-- A new row per change, so past days keep being scored against the target they had.

create table public.targets (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  daily_apply_target smallint not null check (daily_apply_target between 1 and 50),
  effective_from     date not null,
  created_at         timestamptz not null default now(),
  unique (user_id, effective_from)
);

-- ─── jobs ───────────────────────────────────────────────────────────────────

create table public.jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text check (char_length(title) between 1 and 200),
  company    text check (char_length(company) between 1 and 200),
  url        text check (url ~* '^https?://' and char_length(url) <= 2048),
  platform   public.job_platform not null default 'other',
  status     public.job_status not null default 'inbox',
  applied_at timestamptz,
  notes      text check (char_length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Lets job_events reference (id, user_id) so an event can't point at someone else's job.
  unique (id, user_id),
  -- An inbox item can be just a link or a title; it needs at least one of them.
  constraint jobs_has_url_or_title check (url is not null or title is not null),
  -- Once out of the inbox, a job must be fully described.
  constraint jobs_applied_is_complete check (
    status = 'inbox' or (title is not null and company is not null and applied_at is not null)
  )
);

-- The same job link can't be saved twice.
create unique index jobs_user_url_key on public.jobs (user_id, url) where url is not null;
create index jobs_user_status_idx on public.jobs (user_id, status);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ─── job_events: append-only log ────────────────────────────────────────────
-- Source of truth for stats, follow-ups and daily progress.

create table public.job_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  job_id      uuid not null,
  type        public.job_event_type not null,
  from_status public.job_status,
  to_status   public.job_status,
  occurred_at timestamptz not null default now(),

  foreign key (job_id, user_id) references public.jobs (id, user_id) on delete cascade,
  constraint job_events_shape check (
    (type = 'status_change' and to_status is not null and from_status is distinct from to_status)
    or (type = 'follow_up_sent' and from_status is null and to_status is null)
  )
);

create index job_events_user_occurred_idx on public.job_events (user_id, occurred_at desc);
create index job_events_job_idx on public.job_events (job_id, occurred_at desc);

-- Status changes are logged by the database, so the log can never miss one.
create function public.log_job_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.status <> 'inbox' then
    insert into public.job_events (user_id, job_id, type, from_status, to_status)
    values (new.user_id, new.id, 'status_change', null, new.status);
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.job_events (user_id, job_id, type, from_status, to_status)
    values (new.user_id, new.id, 'status_change', old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger jobs_log_status_change
  after insert or update of status on public.jobs
  for each row execute function public.log_job_status_change();

-- ─── checkins: one per day ──────────────────────────────────────────────────

create table public.checkins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day        date not null,
  mood       public.mood not null,
  note       text check (char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

create trigger checkins_set_updated_at
  before update on public.checkins
  for each row execute function public.set_updated_at();

-- ─── answers: quick-copy snippets ───────────────────────────────────────────

create table public.answers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label      text not null check (char_length(label) between 1 and 100),
  body       text not null check (char_length(body) between 1 and 5000),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index answers_user_sort_idx on public.answers (user_id, sort_order);

create trigger answers_set_updated_at
  before update on public.answers
  for each row execute function public.set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Only the signed-in owner can read or write a row. `anon` gets nothing.
-- `(select auth.uid())` is evaluated once per query instead of once per row.

alter table public.settings   enable row level security;
alter table public.targets    enable row level security;
alter table public.jobs       enable row level security;
alter table public.job_events enable row level security;
alter table public.checkins   enable row level security;
alter table public.answers    enable row level security;

create policy "Owner full access" on public.settings
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Owner full access" on public.targets
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Owner full access" on public.jobs
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The event log is append-only: owners can read and insert, never edit.
-- Deleting a job still removes its events via the foreign key cascade.
create policy "Owner can read" on public.job_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owner can insert" on public.job_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owner full access" on public.checkins
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Owner full access" on public.answers
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
