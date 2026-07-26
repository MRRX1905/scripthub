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
values (
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
)
on conflict (id) do nothing;
