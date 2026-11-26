-- Saved job searches: one-tap links to pre-filtered searches on job sites.

create table public.saved_searches (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label      text not null check (char_length(label) between 1 and 60),
  url        text not null check (url ~* '^https?://' and char_length(url) <= 2048),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, url)
);

create index saved_searches_user_sort_idx on public.saved_searches (user_id, sort_order, created_at);

alter table public.saved_searches enable row level security;

create policy "Owner full access" on public.saved_searches
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
