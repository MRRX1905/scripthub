update public.scripts
set
  executors = array['Fluxus', 'Delta', 'Hydrogen'],
  updated_at = '2026-07-22T08:25:00+07:00'
where id = 'nimbus'
  and executors = array['fluxus', 'delta', 'hydrogen'];
