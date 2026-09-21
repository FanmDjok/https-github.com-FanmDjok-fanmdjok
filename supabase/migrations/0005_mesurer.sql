-- Growthis — Phase 5 : synchronisation des statistiques, module Mesurer,
-- attribution publication → lien suivi → prospect.

-- ---------------------------------------------------------------------------
-- Attribution : un lien suivi peut être rattaché à une tâche de publication,
-- et un prospect peut être rattaché au lien suivi qui l'a amené.
-- ---------------------------------------------------------------------------
alter table public.tracked_links
  add column if not exists post_target_id uuid references public.post_targets (id) on delete set null;

alter table public.leads
  add column if not exists tracked_link_id uuid references public.tracked_links (id) on delete set null;

create index if not exists tracked_links_post_target_id_idx on public.tracked_links (post_target_id);
create index if not exists leads_tracked_link_id_idx on public.leads (tracked_link_id);

-- ---------------------------------------------------------------------------
-- post_targets : dernière synchronisation des statistiques (pour le
-- planificateur : toutes les 6h, puis quotidien après 7 jours)
-- ---------------------------------------------------------------------------
alter table public.post_targets
  add column if not exists last_synced_at timestamptz,
  add column if not exists published_at timestamptz;

-- ---------------------------------------------------------------------------
-- current_post_metrics : dernier instantané de chaque tâche de publication
-- ---------------------------------------------------------------------------
create or replace view public.current_post_metrics as
select distinct on (post_target_id)
  post_target_id,
  organization_id,
  captured_at,
  views,
  likes,
  comments,
  shares,
  saves,
  clicks
from public.post_metrics
order by post_target_id, captured_at desc;

-- ---------------------------------------------------------------------------
-- Fonction utilitaire : liste des tâches de publication publiées à
-- resynchroniser (toutes les 6h pendant 7 jours, puis 1 fois par jour).
-- ---------------------------------------------------------------------------
create or replace function public.post_targets_due_for_sync()
returns setof public.post_targets
language sql
security definer set search_path = public
stable
as $$
  select *
  from public.post_targets
  where status = 'publié'
    and (
      last_synced_at is null
      or (
        published_at is not null
        and published_at > now() - interval '7 days'
        and last_synced_at < now() - interval '6 hours'
      )
      or (
        published_at is not null
        and published_at <= now() - interval '7 days'
        and last_synced_at < now() - interval '1 day'
      )
    );
$$;

grant execute on function public.post_targets_due_for_sync() to service_role;

-- ---------------------------------------------------------------------------
-- Agrégations pour le module Mesurer. Toutes vérifient l'appartenance de
-- l'appelant à l'organisation avant de renvoyer quoi que ce soit.
-- ---------------------------------------------------------------------------
create or replace function public.conversion_funnel(p_organization_id uuid, p_since timestamptz)
returns table (views bigint, clicks bigint, leads bigint, clients bigint)
language sql
security definer set search_path = public
stable
as $$
  select
    (
      select coalesce(sum(cm.views), 0)
      from public.current_post_metrics cm
      join public.post_targets pt on pt.id = cm.post_target_id
      where pt.organization_id = p_organization_id and pt.published_at >= p_since
    ) as views,
    (
      select coalesce(sum(tl.clicks), 0)
      from public.tracked_links tl
      join public.post_targets pt on pt.id = tl.post_target_id
      where tl.organization_id = p_organization_id and pt.published_at >= p_since
    ) as clicks,
    (
      select count(*) from public.leads
      where organization_id = p_organization_id and created_at >= p_since
    ) as leads,
    (
      select count(*) from public.leads
      where organization_id = p_organization_id and status = 'Client' and created_at >= p_since
    ) as clients
  where public.is_member_of(p_organization_id);
$$;

grant execute on function public.conversion_funnel(uuid, timestamptz) to authenticated;

create or replace function public.content_performance(p_organization_id uuid, p_since timestamptz)
returns table (
  post_id uuid,
  title text,
  views bigint,
  clicks bigint,
  leads bigint,
  clients bigint
)
language sql
security definer set search_path = public
stable
as $$
  select
    p.id as post_id,
    p.title,
    coalesce(sum(cm.views), 0) as views,
    coalesce(sum(tl.clicks), 0) as clicks,
    count(distinct l.id) as leads,
    count(distinct l.id) filter (where l.status = 'Client') as clients
  from public.posts p
  join public.post_targets pt on pt.post_id = p.id and pt.status = 'publié'
  left join public.current_post_metrics cm on cm.post_target_id = pt.id
  left join public.tracked_links tl on tl.post_target_id = pt.id
  left join public.leads l on l.tracked_link_id = tl.id
  where p.organization_id = p_organization_id
    and pt.published_at >= p_since
    and public.is_member_of(p_organization_id)
  group by p.id, p.title
  order by leads desc, views desc
  limit 20;
$$;

grant execute on function public.content_performance(uuid, timestamptz) to authenticated;

create or replace function public.leads_by_network(p_organization_id uuid, p_since timestamptz)
returns table (network text, leads bigint)
language sql
security definer set search_path = public
stable
as $$
  select coalesce(network, 'Autre') as network, count(*) as leads
  from public.leads
  where organization_id = p_organization_id
    and created_at >= p_since
    and public.is_member_of(p_organization_id)
  group by coalesce(network, 'Autre')
  order by leads desc;
$$;

grant execute on function public.leads_by_network(uuid, timestamptz) to authenticated;
