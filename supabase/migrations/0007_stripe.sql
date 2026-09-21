-- Growthis — Phase 6 : Stripe (essai, abonnements, pause, parrainage).

-- ---------------------------------------------------------------------------
-- organizations : essai 14 jours Business à la création, identifiant client
-- Stripe, code de parrainage unique.
-- ---------------------------------------------------------------------------
alter table public.organizations
  add column if not exists trial_ends_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists referral_code text unique;

create index if not exists organizations_stripe_customer_id_idx
  on public.organizations (stripe_customer_id);

-- Génère un code de parrainage court et lisible à partir du slug.
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substring(md5(new.id::text) from 1 for 6));
  end if;
  return new;
end;
$$;

drop trigger if exists set_referral_code on public.organizations;
create trigger set_referral_code
  before insert on public.organizations
  for each row execute procedure public.generate_referral_code();

-- Renseigne le code de parrainage des organisations déjà existantes.
update public.organizations
set referral_code = upper(substring(md5(id::text) from 1 for 6))
where referral_code is null;

-- ---------------------------------------------------------------------------
-- subscriptions : un abonnement Stripe par organisation
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'aucun'
    check (status in ('aucun', 'essai', 'actif', 'impayé', 'annulé', 'en_pause')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  paused_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions: lecture par les membres de l'organisation"
  on public.subscriptions for select
  using (public.is_member_of(organization_id));

-- Aucune écriture directe : uniquement via le webhook Stripe (service_role).

-- ---------------------------------------------------------------------------
-- referral_redemptions : suivi des parrainages utilisés
-- ---------------------------------------------------------------------------
create table if not exists public.referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  referrer_organization_id uuid not null references public.organizations (id) on delete cascade,
  referred_organization_id uuid not null unique references public.organizations (id) on delete cascade,
  rewarded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.referral_redemptions enable row level security;

create policy "referral_redemptions: lecture par le parrain"
  on public.referral_redemptions for select
  using (public.is_member_of(referrer_organization_id));

create policy "referral_redemptions: lecture par le filleul"
  on public.referral_redemptions for select
  using (public.is_member_of(referred_organization_id));

create index if not exists referral_redemptions_referrer_idx
  on public.referral_redemptions (referrer_organization_id);

-- ---------------------------------------------------------------------------
-- Organisations dont l'essai est expiré sans abonnement payant actif
-- (utilisé par le job planifié qui repasse ces organisations en Gratuit).
-- ---------------------------------------------------------------------------
create or replace function public.organizations_with_expired_trial()
returns setof public.organizations
language sql
security definer set search_path = public
stable
as $$
  select o.*
  from public.organizations o
  left join public.subscriptions s on s.organization_id = o.id
  where o.plan != 'gratuit'
    and o.trial_ends_at is not null
    and o.trial_ends_at < now()
    and (s.status is null or s.status not in ('actif', 'essai', 'en_pause'));
$$;

revoke execute on function public.organizations_with_expired_trial() from public;
grant execute on function public.organizations_with_expired_trial() to service_role;
