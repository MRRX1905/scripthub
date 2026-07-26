create table if not exists public.scripts (
  id text primary key,
  slug text not null unique,
  title text not null,
  game text not null,
  category text not null,
  summary text not null,
  description text not null,
  features text[] not null default '{}',
  key_system text not null check (key_system in ('no-key', 'key-required')),
  executors text[] not null default '{}',
  thumbnail text not null,
  script_code text not null,
  verified_by_admin boolean not null default false,
  published boolean not null default false,
  views bigint not null default 0 check (views >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.executors (
  id text primary key,
  name text not null unique,
  status text not null check (status in ('online', 'updated', 'maintenance')),
  platforms text[] not null default '{}',
  compatible_scripts integer not null default 0 check (compatible_scripts >= 0),
  description text not null,
  updated_at timestamptz not null default now()
);

alter table public.scripts enable row level security;
alter table public.executors enable row level security;

revoke all on table public.scripts from anon, authenticated;
revoke all on table public.executors from anon, authenticated;

grant select on table public.scripts to anon, authenticated;
grant insert, update, delete on table public.scripts to authenticated;
grant select on table public.executors to anon, authenticated;
grant insert, update, delete on table public.executors to authenticated;

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

create policy "executors are public"
on public.executors
for select
to anon, authenticated
using (true);

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

insert into public.scripts (
  id,
  slug,
  title,
  game,
  category,
  summary,
  description,
  features,
  key_system,
  executors,
  thumbnail,
  script_code,
  verified_by_admin,
  published,
  views,
  updated_at
)
values
  (
    'hoho-hub-v4',
    'hoho-hub-v4',
    'Hoho Hub v4',
    'Blox Fruits',
    'Auto Farm',
    'Auto Farm, ESP, Teleport, dan Raid dalam satu hub yang ringan.',
    'Hoho Hub v4 adalah antarmuka skrip untuk Blox Fruits yang memusatkan automasi progres, navigasi, dan utilitas permainan. Metadata dan kompatibilitasnya ditinjau oleh admin sebelum dipublikasikan.',
    array['Auto farm level, boss, dan material', 'ESP pemain, item, dan NPC', 'Teleport lokasi penting', 'Automasi raid dan dungeon'],
    'no-key',
    array['Fluxus', 'Delta', 'Hydrogen'],
    'assets/hoho-hub.jpg',
    $script$loadstring(game:HttpGet('https://raw.githubusercontent.com/acsu123/HOHO_H/main/Loading_UI'))()$script$,
    true,
    true,
    125400,
    '2026-07-26T09:30:00+07:00'
  ),
  (
    'zap-hub',
    'zap-hub',
    'Zap Hub',
    'Pet Simulator 99',
    'Auto Farm',
    'Auto hatch, farm coins, webhook, dan koleksi hadiah otomatis.',
    'Zap Hub merangkum alur farming Pet Simulator 99 dengan kontrol sederhana. Gunakan hanya pada lingkungan dan akun yang Anda pahami risikonya.',
    array['Auto hatch dan auto farm coins', 'Webhook progres', 'Koleksi hadiah otomatis', 'Pengaturan performa perangkat'],
    'key-required',
    array['Fluxus', 'Delta'],
    'assets/zap-hub.jpg',
    '-- Tempel kode Zap Hub yang sudah Anda tinjau di panel admin.',
    true,
    true,
    98100,
    '2026-07-25T18:15:00+07:00'
  ),
  (
    'vanta-doors',
    'vanta-doors',
    'Vanta',
    'Doors',
    'Utility',
    'Auto skip, monster ESP, dan utilitas navigasi untuk Doors.',
    'Vanta menyediakan lapisan utilitas yang ringkas untuk Doors, lengkap dengan opsi visual dan navigasi yang dapat diaktifkan sesuai kebutuhan.',
    array['Monster dan item ESP', 'Auto skip untuk segmen tertentu', 'Peringatan entitas', 'Pengaturan visual ringan'],
    'no-key',
    array['Fluxus', 'Delta', 'Hydrogen'],
    'assets/vanta.jpg',
    '-- Tempel kode Vanta yang sudah Anda tinjau di panel admin.',
    true,
    true,
    56700,
    '2026-07-24T21:45:00+07:00'
  ),
  (
    'dragon-x',
    'dragon-x',
    'Dragon X',
    'Blox Fruits',
    'Combat',
    'Preset combat, sea event, dan distribusi stats yang fleksibel.',
    'Dragon X berfokus pada utilitas combat dan event laut. Setiap perubahan versi dicatat oleh admin agar pengunjung dapat memeriksa kompatibilitas terbaru.',
    array['Preset combat', 'Automasi sea event', 'Distribusi stats', 'Teleport area'],
    'key-required',
    array['Fluxus', 'Hydrogen'],
    'assets/dragon-x.jpg',
    '-- Tempel kode Dragon X yang sudah Anda tinjau di panel admin.',
    true,
    true,
    42300,
    '2026-07-23T13:10:00+07:00'
  ),
  (
    'nimbus',
    'nimbus',
    'Nimbus',
    'Anime Adventures',
    'Auto Farm',
    'Auto farm, infinite mode, dan ESP untuk alur progres yang konsisten.',
    'Nimbus adalah paket automasi untuk Anime Adventures dengan penekanan pada kontrol fitur yang jelas dan kompatibilitas lintas eksekutor.',
    array['Auto farm stage', 'Infinite mode helper', 'Unit dan map ESP', 'Preset performa'],
    'no-key',
    array['Fluxus', 'Delta', 'Hydrogen'],
    'assets/nimbus.jpg',
    '-- Tempel kode Nimbus yang sudah Anda tinjau di panel admin.',
    true,
    true,
    31200,
    '2026-07-22T08:25:00+07:00'
  ),
  (
    'aether-utility',
    'aether-utility',
    'Aether Utility',
    'Universal',
    'Utility',
    'Draft paket utilitas universal untuk pengujian internal admin.',
    'Konten ini masih berupa draft dan tidak tampil pada halaman publik.',
    array['FPS preset', 'UI utilities'],
    'no-key',
    array['Fluxus'],
    'assets/aether.jpg',
    '-- Draft internal',
    false,
    false,
    0,
    '2026-07-26T07:00:00+07:00'
  )
on conflict (id) do nothing;

insert into public.executors (
  id,
  name,
  status,
  platforms,
  compatible_scripts,
  description,
  updated_at
)
values
  (
    'fluxus',
    'Fluxus',
    'online',
    array['Android', 'Windows'],
    1248,
    'Eksekutor ringan dengan kompatibilitas luas dan pembaruan yang konsisten.',
    '2026-07-26T09:15:00+07:00'
  ),
  (
    'delta',
    'Delta',
    'updated',
    array['Android'],
    1197,
    'Eksekutor Android dengan alur instalasi ringkas dan dukungan skrip populer.',
    '2026-07-26T08:40:00+07:00'
  ),
  (
    'hydrogen',
    'Hydrogen',
    'maintenance',
    array['macOS', 'Android'],
    932,
    'Eksekutor lintas perangkat yang sedang menjalani pemeliharaan kompatibilitas.',
    '2026-07-26T06:20:00+07:00'
  )
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'scripts'
  ) then
    alter publication supabase_realtime add table public.scripts;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'executors'
  ) then
    alter publication supabase_realtime add table public.executors;
  end if;
end
$$;
