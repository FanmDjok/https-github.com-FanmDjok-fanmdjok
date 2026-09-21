-- Growthis — Phase 3 : page lien en bio, aimants à prospects, capture de prospects.

-- ---------------------------------------------------------------------------
-- link_pages : une page lien en bio par organisation
-- ---------------------------------------------------------------------------
create table if not exists public.link_pages (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  slug text not null unique,
  display_name text not null default '',
  bio text not null default '',
  brand_color text not null default '#0E8A5F',
  buttons jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.link_pages enable row level security;

create policy "link_pages: lecture par les membres"
  on public.link_pages for select
  using (public.is_member_of(organization_id));

create policy "link_pages: écriture par les membres"
  on public.link_pages for insert
  with check (public.is_member_of(organization_id));

create policy "link_pages: mise à jour par les membres"
  on public.link_pages for update
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

-- Lecture publique (visiteur anonyme sur growthis.io/<slug>) sans exposer
-- toute la table organizations : fonction security definer restreinte aux
-- colonnes nécessaires à l'affichage de la page.
create or replace function public.get_public_link_page(p_slug text)
returns table (
  organization_id uuid,
  display_name text,
  bio text,
  brand_color text,
  buttons jsonb,
  plan text
)
language sql
security definer set search_path = public
stable
as $$
  select lp.organization_id, lp.display_name, lp.bio, lp.brand_color, lp.buttons, o.plan
  from public.link_pages lp
  join public.organizations o on o.id = lp.organization_id
  where lp.slug = p_slug;
$$;

grant execute on function public.get_public_link_page(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- lead_magnets : checklist / guide PDF / mini-formation
-- ---------------------------------------------------------------------------
create table if not exists public.lead_magnets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  type text not null check (type in ('Checklist', 'Guide PDF', 'Mini-formation')),
  outline jsonb not null default '[]'::jsonb,
  status text not null default 'brouillon' check (status in ('brouillon', 'publié')),
  storage_path text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.lead_magnets enable row level security;

create policy "lead_magnets: accès par les membres de l'organisation"
  on public.lead_magnets for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists lead_magnets_organization_id_idx on public.lead_magnets (organization_id, created_at desc);

-- Lecture publique d'un aimant publié (page de capture), sans exposer le
-- plan détaillé du contenu ni le chemin de stockage.
create or replace function public.get_public_lead_magnet(p_id uuid)
returns table (
  id uuid,
  organization_id uuid,
  title text,
  type text,
  org_name text,
  brand_color text
)
language sql
security definer set search_path = public
stable
as $$
  select lm.id, lm.organization_id, lm.title, lm.type, o.name, o.brand_color
  from public.lead_magnets lm
  join public.organizations o on o.id = lm.organization_id
  where lm.id = p_id and lm.status = 'publié';
$$;

grant execute on function public.get_public_lead_magnet(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- leads : prospects capturés (page lien en bio, aimants)
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text not null,
  consent boolean not null default false,
  source text not null default '',
  network text,
  lead_magnet_id uuid references public.lead_magnets (id) on delete set null,
  status text not null default 'Nouveau' check (status in ('Nouveau', 'Contacté', 'Client')),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads: lecture par les membres de l'organisation"
  on public.leads for select
  using (public.is_member_of(organization_id));

create policy "leads: mise à jour par les membres de l'organisation"
  on public.leads for update
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create policy "leads: suppression par les membres de l'organisation"
  on public.leads for delete
  using (public.is_member_of(organization_id));

-- Capture publique : consentement RGPD explicite obligatoire.
create policy "leads: capture publique avec consentement"
  on public.leads for insert
  to anon, authenticated
  with check (
    consent = true
    and char_length(email) > 3
    and (
      lead_magnet_id is null
      or exists (
        select 1 from public.lead_magnets lm
        where lm.id = lead_magnet_id
          and lm.status = 'publié'
          and lm.organization_id = leads.organization_id
      )
    )
  );

create index if not exists leads_organization_id_idx on public.leads (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- tracked_links : liens de suivi (boutons de la page lien en bio, aimants,
-- puis publications une fois le module Publier en place)
-- ---------------------------------------------------------------------------
create table if not exists public.tracked_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  code text not null unique,
  label text not null,
  target_url text not null,
  clicks int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.tracked_links enable row level security;

create policy "tracked_links: accès par les membres de l'organisation"
  on public.tracked_links for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists tracked_links_organization_id_idx on public.tracked_links (organization_id, created_at desc);

-- Enregistre un clic et renvoie l'URL cible, pour le service de redirection
-- /l/[code] utilisé par les visiteurs anonymes.
create or replace function public.register_link_click(p_code text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_target text;
begin
  update public.tracked_links
  set clicks = clicks + 1
  where code = p_code
  returning target_url into v_target;

  return v_target;
end;
$$;

grant execute on function public.register_link_click(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage : bucket privé pour les PDF des aimants à prospects
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('lead-magnets', 'lead-magnets', false)
on conflict (id) do nothing;

create policy "lead-magnets storage: lecture par les membres de l'organisation"
  on storage.objects for select
  using (
    bucket_id = 'lead-magnets'
    and public.is_member_of(((storage.foldername(name))[1])::uuid)
  );

create policy "lead-magnets storage: écriture par les membres de l'organisation"
  on storage.objects for insert
  with check (
    bucket_id = 'lead-magnets'
    and public.is_member_of(((storage.foldername(name))[1])::uuid)
  );

create policy "lead-magnets storage: mise à jour par les membres de l'organisation"
  on storage.objects for update
  using (
    bucket_id = 'lead-magnets'
    and public.is_member_of(((storage.foldername(name))[1])::uuid)
  );

create policy "lead-magnets storage: suppression par les membres de l'organisation"
  on storage.objects for delete
  using (
    bucket_id = 'lead-magnets'
    and public.is_member_of(((storage.foldername(name))[1])::uuid)
  );
