-- Remembers which celebrations were shown, so the big one plays once across all devices.
-- Keyed by the window's start date: if the challenge start date changes, windows are new.

create table public.celebrations_seen (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  window_start  date not null,
  window_number smallint not null check (window_number >= 1),
  seen_at       timestamptz not null default now(),
  unique (user_id, window_start)
);

alter table public.celebrations_seen enable row level security;

create policy "Owner full access" on public.celebrations_seen
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
