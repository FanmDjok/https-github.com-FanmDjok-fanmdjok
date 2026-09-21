-- Growthis — Phase 4 : Publier (SocialProvider, médiathèque, file de tâches).

-- ---------------------------------------------------------------------------
-- social_accounts : un compte connecté par réseau et par organisation
-- ---------------------------------------------------------------------------
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  network text not null check (network in ('instagram', 'facebook', 'tiktok', 'linkedin', 'youtube')),
  external_account_id text not null,
  label text,
  -- Jetons chiffrés (AES-256-GCM, lib/crypto.ts) : jamais journalisés en clair,
  -- jamais sélectionnés depuis un composant client.
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  expires_at timestamptz,
  status text not null default 'connecté' check (status in ('connecté', 'à reconnecter', 'non connecté')),
  meta jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (organization_id, network)
);

alter table public.social_accounts enable row level security;

create policy "social_accounts: accès par les membres de l'organisation"
  on public.social_accounts for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

-- ---------------------------------------------------------------------------
-- media_assets : bibliothèque de médias (Supabase Storage, bucket "media")
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  storage_path text not null,
  type text not null check (type in ('image', 'vidéo')),
  duration_seconds numeric,
  width int,
  height int,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;

create policy "media_assets: accès par les membres de l'organisation"
  on public.media_assets for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists media_assets_organization_id_idx on public.media_assets (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- posts : contenu de base d'une publication (texte + média)
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null default '',
  caption text not null default '',
  media_asset_id uuid references public.media_assets (id) on delete set null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts: accès par les membres de l'organisation"
  on public.posts for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

-- ---------------------------------------------------------------------------
-- post_targets : une tâche de publication indépendante par réseau
-- ---------------------------------------------------------------------------
create table if not exists public.post_targets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  network text not null check (network in ('instagram', 'facebook', 'tiktok', 'linkedin', 'youtube')),
  caption_override text,
  status text not null default 'en_attente'
    check (status in ('en_attente', 'en_cours', 'publié', 'échec', 'sans_connexion')),
  scheduled_at timestamptz not null default now(),
  external_id text,
  external_url text,
  error text,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.post_targets enable row level security;

create policy "post_targets: accès par les membres de l'organisation"
  on public.post_targets for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists post_targets_post_id_idx on public.post_targets (post_id);
create index if not exists post_targets_organization_id_idx on public.post_targets (organization_id, scheduled_at);

-- ---------------------------------------------------------------------------
-- post_metrics : instantanés de statistiques par tâche de publication
-- ---------------------------------------------------------------------------
create table if not exists public.post_metrics (
  id uuid primary key default gen_random_uuid(),
  post_target_id uuid not null references public.post_targets (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  captured_at timestamptz not null default now(),
  views int not null default 0,
  likes int not null default 0,
  comments int not null default 0,
  shares int not null default 0,
  saves int not null default 0,
  clicks int not null default 0
);

alter table public.post_metrics enable row level security;

create policy "post_metrics: accès par les membres de l'organisation"
  on public.post_metrics for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists post_metrics_post_target_id_idx on public.post_metrics (post_target_id, captured_at desc);

-- ---------------------------------------------------------------------------
-- notifications : alertes in-app (échec de publication, reconnexion requise…)
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  type text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: accès par les membres de l'organisation"
  on public.notifications for all
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));

create index if not exists notifications_organization_id_idx on public.notifications (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Storage : bucket privé pour les médias (images/vidéos des publications)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

create policy "media storage: lecture par les membres de l'organisation"
  on storage.objects for select
  using (
    bucket_id = 'media'
    and public.is_member_of(((storage.foldername(name))[1])::uuid)
  );

create policy "media storage: écriture par les membres de l'organisation"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and public.is_member_of(((storage.foldername(name))[1])::uuid)
  );

create policy "media storage: suppression par les membres de l'organisation"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and public.is_member_of(((storage.foldername(name))[1])::uuid)
  );
