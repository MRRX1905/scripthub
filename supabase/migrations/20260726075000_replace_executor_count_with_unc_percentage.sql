update public.executors
set
  compatible_scripts = least(compatible_scripts, 100),
  updated_at = now()
where compatible_scripts > 100;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'executors'
      and column_name = 'compatible_scripts'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'executors'
      and column_name = 'unc_percentage'
  ) then
    alter table public.executors
    rename column compatible_scripts to unc_percentage;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'executors_unc_percentage_range'
      and conrelid = 'public.executors'::regclass
  ) then
    alter table public.executors
    add constraint executors_unc_percentage_range
    check (unc_percentage between 0 and 100);
  end if;
end
$$;

drop function if exists public.admin_save_executor(
  text,
  text,
  text,
  text[],
  integer,
  text
);

create function public.admin_save_executor(
  p_id text,
  p_name text,
  p_status text,
  p_platforms text[],
  p_unc_percentage integer,
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

  if p_unc_percentage is null or p_unc_percentage not between 0 and 100 then
    raise exception 'UNC wajib berada di antara 0 dan 100 persen.';
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
    unc_percentage,
    description,
    updated_at
  )
  values (
    p_id,
    normalized_name,
    p_status,
    coalesce(p_platforms, '{}'),
    p_unc_percentage,
    trim(p_description),
    now()
  )
  on conflict (id) do update
  set
    name = excluded.name,
    status = excluded.status,
    platforms = excluded.platforms,
    unc_percentage = excluded.unc_percentage,
    description = excluded.description,
    updated_at = excluded.updated_at;
end
$$;

revoke all on function public.admin_save_executor(
  text,
  text,
  text,
  text[],
  integer,
  text
)
from public, anon;

grant execute on function public.admin_save_executor(
  text,
  text,
  text,
  text[],
  integer,
  text
)
to authenticated;
