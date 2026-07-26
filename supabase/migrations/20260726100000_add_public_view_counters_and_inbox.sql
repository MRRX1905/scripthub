create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.increment_public_script_views()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if new.script_id is not null then
    update public.scripts
    set views = views + 1
    where id = new.script_id
      and published = true;
  end if;

  return new;
end
$$;

revoke all
on function private.increment_public_script_views()
from public, anon, authenticated;

drop trigger if exists increment_public_script_views
on public.analytics_events;

create trigger increment_public_script_views
after insert on public.analytics_events
for each row
when (new.script_id is not null)
execute function private.increment_public_script_views();

update public.scripts as scripts
set views = (
  select count(*)
  from public.analytics_events as events
  where events.script_id = scripts.id
);

create table if not exists public.script_submissions (
  id bigint generated always as identity primary key,
  sender_name text not null,
  script_content text not null,
  status text not null default 'new'
    check (status in ('new', 'reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint script_submissions_sender_name_length
    check (char_length(sender_name) between 2 and 80),
  constraint script_submissions_sender_name_trimmed
    check (sender_name = btrim(sender_name)),
  constraint script_submissions_content_length
    check (char_length(script_content) between 10 and 20000),
  constraint script_submissions_content_trimmed
    check (script_content = btrim(script_content))
);

create index if not exists script_submissions_status_created_at_idx
on public.script_submissions (status, created_at desc);

alter table public.script_submissions enable row level security;

revoke all on table public.script_submissions from anon, authenticated;

grant insert (sender_name, script_content)
on table public.script_submissions
to anon, authenticated;

grant select, delete
on table public.script_submissions
to authenticated;

grant update (status, updated_at)
on table public.script_submissions
to authenticated;

grant usage, select
on sequence public.script_submissions_id_seq
to anon, authenticated;

create policy "visitors can submit scripts"
on public.script_submissions
for insert
to anon, authenticated
with check (
  status = 'new'
  and char_length(sender_name) between 2 and 80
  and sender_name = btrim(sender_name)
  and char_length(script_content) between 10 and 20000
  and script_content = btrim(script_content)
);

create policy "admin can read script submissions"
on public.script_submissions
for select
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
);

create policy "admin can update script submissions"
on public.script_submissions
for update
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
)
with check (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
);

create policy "admin can delete script submissions"
on public.script_submissions
for delete
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'script_submissions'
  ) then
    alter publication supabase_realtime
    add table public.script_submissions;
  end if;
end
$$;
