-- Once a job leaves the inbox it stays in the pipeline. Enforced here so no client can break it.

create function public.prevent_return_to_inbox()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status <> 'inbox' and new.status = 'inbox' then
    raise exception 'A job cannot move back to the inbox once applied'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger jobs_prevent_return_to_inbox
  before update of status on public.jobs
  for each row execute function public.prevent_return_to_inbox();
