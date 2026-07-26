create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  path text not null,
  script_id text references public.scripts(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint analytics_events_path_length
    check (char_length(path) between 1 and 255),
  constraint analytics_events_path_format
    check (path ~ '^/[A-Za-z0-9/_?&=.%~-]*$')
);

create index if not exists analytics_events_created_at_idx
on public.analytics_events (created_at desc);

create index if not exists analytics_events_script_created_at_idx
on public.analytics_events (script_id, created_at desc)
where script_id is not null;

alter table public.analytics_events enable row level security;

revoke all on table public.analytics_events from anon, authenticated;
grant insert on table public.analytics_events to anon, authenticated;
grant select on table public.analytics_events to authenticated;

grant usage, select
on sequence public.analytics_events_id_seq
to anon, authenticated;

create policy "visitors can record page views"
on public.analytics_events
for insert
to anon, authenticated
with check (
  char_length(path) between 1 and 255
  and path ~ '^/[A-Za-z0-9/_?&=.%~-]*$'
);

create policy "admin can read analytics"
on public.analytics_events
for select
to authenticated
using (
  coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
);

create or replace function public.admin_analytics_dashboard(
  p_days integer default 7,
  p_trending_limit integer default 5
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare
  bounded_days integer := greatest(1, least(coalesce(p_days, 7), 30));
  bounded_limit integer := greatest(1, least(coalesce(p_trending_limit, 5), 20));
  local_today date := (now() at time zone 'Asia/Jakarta')::date;
  today_start timestamptz;
  seven_day_start timestamptz;
  total_views bigint;
  unique_visitors bigint;
  views_today bigint;
  visitors_today bigint;
  active_visitors bigint;
  daily_json jsonb;
  trending_json jsonb;
begin
  if coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Akses administrator diperlukan.';
  end if;

  today_start := local_today::timestamp at time zone 'Asia/Jakarta';
  seven_day_start :=
    (local_today - (bounded_days - 1))::timestamp at time zone 'Asia/Jakarta';

  select
    count(*),
    count(distinct visitor_id),
    count(*) filter (where created_at >= today_start),
    count(distinct visitor_id) filter (where created_at >= today_start),
    count(distinct visitor_id) filter (
      where created_at >= now() - interval '5 minutes'
    )
  into
    total_views,
    unique_visitors,
    views_today,
    visitors_today,
    active_visitors
  from public.analytics_events;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date', daily.day::text,
        'views', daily.views,
        'visitors', daily.visitors
      )
      order by daily.day
    ),
    '[]'::jsonb
  )
  into daily_json
  from (
    select
      day_series.day::date as day,
      count(events.id) as views,
      count(distinct events.visitor_id) as visitors
    from generate_series(
      local_today - (bounded_days - 1),
      local_today,
      interval '1 day'
    ) as day_series(day)
    left join public.analytics_events as events
      on events.created_at >=
        day_series.day::timestamp at time zone 'Asia/Jakarta'
      and events.created_at <
        (day_series.day + interval '1 day')::timestamp at time zone 'Asia/Jakarta'
    group by day_series.day
  ) as daily;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ranked.id,
        'slug', ranked.slug,
        'title', ranked.title,
        'game', ranked.game,
        'thumbnail', ranked.thumbnail,
        'views7d', ranked.views_7d,
        'visitors7d', ranked.visitors_7d,
        'viewsTotal', ranked.views_total
      )
      order by ranked.views_7d desc, ranked.views_total desc, ranked.title
    ),
    '[]'::jsonb
  )
  into trending_json
  from (
    select
      scripts.id,
      scripts.slug,
      scripts.title,
      scripts.game,
      scripts.thumbnail,
      count(events.id) filter (
        where events.created_at >= seven_day_start
      ) as views_7d,
      count(distinct events.visitor_id) filter (
        where events.created_at >= seven_day_start
      ) as visitors_7d,
      count(events.id) as views_total
    from public.scripts
    join public.analytics_events as events
      on events.script_id = scripts.id
    where scripts.published = true
    group by
      scripts.id,
      scripts.slug,
      scripts.title,
      scripts.game,
      scripts.thumbnail
    order by views_7d desc, views_total desc, scripts.title
    limit bounded_limit
  ) as ranked;

  return jsonb_build_object(
    'totalViews', total_views,
    'uniqueVisitors', unique_visitors,
    'viewsToday', views_today,
    'visitorsToday', visitors_today,
    'activeVisitors', active_visitors,
    'daily', daily_json,
    'trending', trending_json,
    'updatedAt', now()
  );
end
$$;

revoke all
on function public.admin_analytics_dashboard(integer, integer)
from public, anon;

grant execute
on function public.admin_analytics_dashboard(integer, integer)
to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'analytics_events'
  ) then
    alter publication supabase_realtime
    add table public.analytics_events;
  end if;
end
$$;
