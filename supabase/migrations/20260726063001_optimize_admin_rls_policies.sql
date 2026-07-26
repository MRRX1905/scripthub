drop policy if exists "published scripts are public" on public.scripts;
drop policy if exists "admin can read all scripts" on public.scripts;
drop policy if exists "admin can insert scripts" on public.scripts;
drop policy if exists "admin can update scripts" on public.scripts;
drop policy if exists "admin can delete scripts" on public.scripts;
drop policy if exists "admin can insert executors" on public.executors;
drop policy if exists "admin can update executors" on public.executors;
drop policy if exists "admin can delete executors" on public.executors;

create policy "published scripts are public"
on public.scripts
for select
to anon
using (published = true);

create policy "admin can read all scripts"
on public.scripts
for select
to authenticated
using (
  published = true
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "admin can insert scripts"
on public.scripts
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can update scripts"
on public.scripts
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can delete scripts"
on public.scripts
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can insert executors"
on public.executors
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can update executors"
on public.executors
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin can delete executors"
on public.executors
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
