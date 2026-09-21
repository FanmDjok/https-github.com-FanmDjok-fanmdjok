-- Growthis — schéma initial (Phase 1)
-- Organisations (marques), membres, profils. Toutes les tables ont RLS activé.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles : un profil par utilisateur Supabase Auth
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: lecture de son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: mise à jour de son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Création automatique du profil à l'inscription.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- organizations : une marque / un espace de travail
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'gratuit' check (plan in ('gratuit', 'essentiel', 'business')),
  logo_url text,
  brand_color text default '#0E8A5F',
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- ---------------------------------------------------------------------------
-- members : rattachement utilisateur <-> organisation, avec rôle
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'collaborateur')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

alter table public.members enable row level security;

-- Fonction utilitaire (security definer) pour éviter la récursion RLS entre
-- organizations et members lors des contrôles d'appartenance.
create or replace function public.is_member_of(org_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.members m
    where m.organization_id = org_id and m.user_id = auth.uid()
  );
$$;

create policy "organizations: lecture par les membres"
  on public.organizations for select
  using (public.is_member_of(id));

create policy "organizations: création par un utilisateur connecté"
  on public.organizations for insert
  with check (auth.uid() = created_by);

create policy "organizations: mise à jour par le propriétaire"
  on public.organizations for update
  using (
    exists (
      select 1 from public.members m
      where m.organization_id = id and m.user_id = auth.uid() and m.role = 'owner'
    )
  );

create policy "members: lecture par les membres de l'organisation"
  on public.members for select
  using (public.is_member_of(organization_id));

create policy "members: un utilisateur peut rejoindre l'organisation qu'il crée"
  on public.members for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.created_by = auth.uid()
    )
  );

create policy "members: le propriétaire gère les membres"
  on public.members for all
  using (
    exists (
      select 1 from public.members m
      where m.organization_id = members.organization_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );

create index if not exists members_user_id_idx on public.members (user_id);
create index if not exists members_organization_id_idx on public.members (organization_id);
