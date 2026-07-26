alter table public.scripts
add column if not exists key_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'scripts_key_url_is_http'
      and conrelid = 'public.scripts'::regclass
  ) then
    alter table public.scripts
    add constraint scripts_key_url_is_http
    check (key_url is null or key_url ~* '^https?://');
  end if;
end
$$;

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  updated_at timestamptz not null default now()
);

insert into public.categories (id, name)
select
  trim(both '-' from regexp_replace(lower(category), '[^a-z0-9]+', '-', 'g')),
  category
from (
  select distinct category
  from public.scripts
) as existing_categories
on conflict do nothing;

insert into public.categories (id, name)
values
  ('esp', 'ESP'),
  ('teleport', 'Teleport'),
  ('lainnya', 'Lainnya')
on conflict do nothing;

alter table public.categories enable row level security;

revoke all on table public.categories from anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant insert, update, delete on table public.categories to authenticated;

create policy "categories are public"
on public.categories
for select
to anon, authenticated
using (true);

create policy "admin can insert categories"
on public.categories
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can update categories"
on public.categories
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can delete categories"
on public.categories
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.admin_save_executor(
  p_id text,
  p_name text,
  p_status text,
  p_platforms text[],
  p_compatible_scripts integer,
  p_description text
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  previous_name text;
  normalized_name text := trim(p_name);
begin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Akses administrator diperlukan.';
  end if;

  if trim(p_id) = '' or normalized_name = '' then
    raise exception 'ID dan nama eksekutor wajib diisi.';
  end if;

  select name
  into previous_name
  from public.executors
  where id = p_id
  for update;

  if exists (
    select 1
    from public.executors
    where name = normalized_name
      and id <> p_id
  ) then
    raise exception 'Nama eksekutor sudah digunakan.';
  end if;

  if previous_name is not null and previous_name <> normalized_name then
    update public.scripts
    set
      executors = array_replace(executors, previous_name, normalized_name),
      updated_at = now()
    where previous_name = any(executors);
  end if;

  insert into public.executors (
    id,
    name,
    status,
    platforms,
    compatible_scripts,
    description,
    updated_at
  )
  values (
    p_id,
    normalized_name,
    p_status,
    coalesce(p_platforms, '{}'),
    greatest(coalesce(p_compatible_scripts, 0), 0),
    trim(p_description),
    now()
  )
  on conflict (id) do update
  set
    name = excluded.name,
    status = excluded.status,
    platforms = excluded.platforms,
    compatible_scripts = excluded.compatible_scripts,
    description = excluded.description,
    updated_at = excluded.updated_at;
end
$$;

create or replace function public.admin_delete_executor(p_id text)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  previous_name text;
begin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Akses administrator diperlukan.';
  end if;

  select name
  into previous_name
  from public.executors
  where id = p_id
  for update;

  if previous_name is null then
    return;
  end if;

  update public.scripts
  set
    executors = array_remove(executors, previous_name),
    updated_at = now()
  where previous_name = any(executors);

  delete from public.executors
  where id = p_id;
end
$$;

create or replace function public.admin_save_category(
  p_id text,
  p_name text
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  previous_name text;
  normalized_name text := trim(p_name);
begin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Akses administrator diperlukan.';
  end if;

  if trim(p_id) = '' or normalized_name = '' then
    raise exception 'ID dan nama kategori wajib diisi.';
  end if;

  select name
  into previous_name
  from public.categories
  where id = p_id
  for update;

  if exists (
    select 1
    from public.categories
    where name = normalized_name
      and id <> p_id
  ) then
    raise exception 'Nama kategori sudah digunakan.';
  end if;

  if previous_name is not null and previous_name <> normalized_name then
    update public.scripts
    set
      category = normalized_name,
      updated_at = now()
    where category = previous_name;
  end if;

  insert into public.categories (id, name, updated_at)
  values (p_id, normalized_name, now())
  on conflict (id) do update
  set
    name = excluded.name,
    updated_at = excluded.updated_at;
end
$$;

create or replace function public.admin_delete_category(p_id text)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  category_name text;
begin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Akses administrator diperlukan.';
  end if;

  select name
  into category_name
  from public.categories
  where id = p_id
  for update;

  if category_name is null then
    return;
  end if;

  if exists (
    select 1
    from public.scripts
    where category = category_name
  ) then
    raise exception 'Kategori masih digunakan oleh skrip. Pindahkan skrip ke kategori lain terlebih dahulu.';
  end if;

  delete from public.categories
  where id = p_id;
end
$$;

revoke all on function public.admin_save_executor(text, text, text, text[], integer, text)
from public, anon;
revoke all on function public.admin_delete_executor(text)
from public, anon;
revoke all on function public.admin_save_category(text, text)
from public, anon;
revoke all on function public.admin_delete_category(text)
from public, anon;

grant execute on function public.admin_save_executor(text, text, text, text[], integer, text)
to authenticated;
grant execute on function public.admin_delete_executor(text)
to authenticated;
grant execute on function public.admin_save_category(text, text)
to authenticated;
grant execute on function public.admin_delete_category(text)
to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'categories'
  ) then
    alter publication supabase_realtime add table public.categories;
  end if;
end
$$;
