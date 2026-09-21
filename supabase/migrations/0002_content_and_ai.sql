-- Growthis — Phase 2 : positionnement, scripts, carrousels, conseiller, limites d'usage.

-- ---------------------------------------------------------------------------
-- positioning : un positionnement par organisation
-- ---------------------------------------------------------------------------
create table if not exists public.positioning (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  ideal_client text not null default '',
  problem text not null default '',
  promise text not null default '',
  offer text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.positioning enable row level security;

create policy "positioning: lecture par les membres"
  on public.positioning for select
  using (public.is_member_of(organization_id));

create policy "positioning: écriture par les membres"
  on public.positioning for insert
  with check (public.is_member_of(organization_id));

create policy "positioning: mise à jour par les membres"
  on public.positioning for update
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

-- ---------------------------------------------------------------------------
-- scripts : scripts vidéo générés (ou écrits) par l'utilisateur
-- ---------------------------------------------------------------------------
create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  objective text not null check (objective in ('Attirer', 'Rassurer', 'Convertir')),
  duration int not null check (duration in (30, 60, 90)),
  hook text not null,
  body text not null,
  cta text not null,
  status text not null default 'brouillon' check (status in ('brouillon', 'publié')),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.scripts enable row level security;

create policy "scripts: accès par les membres de l'organisation"
  on public.scripts for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists scripts_organization_id_idx on public.scripts (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- carousels : carrousels générés (8 visuels + légende)
-- ---------------------------------------------------------------------------
create table if not exists public.carousels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  caption text not null default '',
  slides jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.carousels enable row level security;

create policy "carousels: accès par les membres de l'organisation"
  on public.carousels for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists carousels_organization_id_idx on public.carousels (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- coach_messages : historique de conversation avec le conseiller IA
-- ---------------------------------------------------------------------------
create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.coach_messages enable row level security;

create policy "coach_messages: accès par les membres de l'organisation"
  on public.coach_messages for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists coach_messages_organization_id_idx on public.coach_messages (organization_id, created_at);

-- ---------------------------------------------------------------------------
-- usage_counters : compteurs mensuels pour les limites de formule
-- ---------------------------------------------------------------------------
create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  metric text not null,
  period text not null,
  count int not null default 0,
  unique (organization_id, metric, period)
);

alter table public.usage_counters enable row level security;

create policy "usage_counters: lecture par les membres de l'organisation"
  on public.usage_counters for select
  using (public.is_member_of(organization_id));

-- Aucune policy d'écriture directe : les compteurs ne sont modifiés que par
-- la fonction try_increment_usage (security definer) ci-dessous.

-- Vérifie puis incrémente un compteur d'usage mensuel de façon atomique.
-- p_limit = null signifie "illimité" (formules Essentiel / Business).
-- Retourne true si l'action est autorisée (et alors comptabilisée).
create or replace function public.try_increment_usage(
  p_organization_id uuid,
  p_metric text,
  p_limit int
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_period text := to_char(now(), 'YYYY-MM');
  v_count int;
begin
  if not public.is_member_of(p_organization_id) then
    raise exception 'not a member of this organization';
  end if;

  insert into public.usage_counters (organization_id, metric, period, count)
  values (p_organization_id, p_metric, v_period, 0)
  on conflict (organization_id, metric, period) do nothing;

  select count into v_count
  from public.usage_counters
  where organization_id = p_organization_id and metric = p_metric and period = v_period
  for update;

  if p_limit is not null and v_count >= p_limit then
    return false;
  end if;

  update public.usage_counters
  set count = count + 1
  where organization_id = p_organization_id and metric = p_metric and period = v_period;

  return true;
end;
$$;

grant execute on function public.try_increment_usage(uuid, text, int) to authenticated;

-- Nombre d'utilisations déjà comptabilisées ce mois-ci pour un indicateur.
create or replace function public.current_usage(
  p_organization_id uuid,
  p_metric text
)
returns int
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (
      select count
      from public.usage_counters
      where organization_id = p_organization_id
        and metric = p_metric
        and period = to_char(now(), 'YYYY-MM')
        and public.is_member_of(p_organization_id)
    ),
    0
  );
$$;

grant execute on function public.current_usage(uuid, text) to authenticated;
