# growthis.io

« L'atelier qui transforme votre contenu en clients. » Application web
(responsive, installable en PWA) pour les entrepreneurs francophones :
indépendants, micro-entrepreneurs, petites marques.

Growthis aide à attirer des prospects grâce au contenu, à les capter, à
publier sur tous les réseaux depuis un seul endroit et à mesurer ce qui
rapporte vraiment. **Aucune vidéo n'est générée par IA** : l'IA sert
uniquement au texte (positionnement, idées, scripts, carrousels, légendes,
analyses, conseils).

## État du projet

Phase 1 en cours : projet, design system « Atelier », authentification,
organisations/marques, navigation et tous les écrans avec des données
d'exemple. Voir la section [Ordre de travail](#ordre-de-travail) plus bas.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Supabase** : authentification (email + Google), Postgres avec RLS sur
  toutes les tables, Storage pour les médias
- **Anthropic (Claude API)** pour tous les contenus texte, réponses JSON
  validées par `zod` (Phase 2)
- **Stripe** : abonnements, essai, portail client, webhooks (Phase 6)
- **Trigger.dev / Inngest** pour la file de publication programmée et les
  synchronisations de statistiques (Phase 4-5)
- **Resend** pour les emails transactionnels
- Déploiement sur **Vercel**

> Next.js 16 introduit des changements importants par rapport aux versions
> précédentes (APIs de requête asynchrones, `middleware.ts` renommé en
> `proxy.ts`, Turbopack par défaut). Consultez
> `node_modules/next/dist/docs/` avant de modifier le routage ou la
> configuration.

## Lancer le projet en local

```bash
npm install
cp .env.example .env.local
# renseignez .env.local (voir ci-dessous)
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

### Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (région
   Europe pour la conformité RGPD).
2. Copiez `Project URL` et `anon public key` dans `NEXT_PUBLIC_SUPABASE_URL`
   et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Copiez la `service_role key` dans `SUPABASE_SERVICE_ROLE_KEY` (jamais
   exposée au client, réservée aux tâches serveur).
4. Activez le fournisseur **Google** dans Authentication → Providers, et
   renseignez l'URL de callback `https://<votre-projet>.supabase.co/auth/v1/callback`.
5. Appliquez les migrations SQL du dossier `supabase/migrations/` (via le
   SQL Editor de Supabase, ou `supabase db push` avec la CLI Supabase).

### Variables d'environnement

Voir `.env.example` pour la liste complète et commentée. Aucun secret ne
doit être exposé côté client (seules les variables préfixées
`NEXT_PUBLIC_` le sont). Les jetons des réseaux sociaux sont chiffrés en
base avec `ENCRYPTION_KEY` avant stockage.

## Configurer chaque réseau (Publier — Phase 4)

Chaque réseau nécessite une application développeur et, pour la plupart,
une validation qui peut prendre plusieurs semaines. **À démarrer dès que
possible**, indépendamment de l'avancement du développement :

| Réseau | Ce qu'il faut créer | Validation nécessaire |
| --- | --- | --- |
| **Instagram** (Business/Créateur) + **Facebook** (Pages) | Une app sur [developers.facebook.com](https://developers.facebook.com), via l'API Instagram Graph (Content Publishing) | **Meta App Review** pour les permissions `instagram_content_publish`, `pages_manage_posts`, etc. Délai : plusieurs semaines. |
| **TikTok** | Une app sur [developers.tiktok.com](https://developers.tiktok.com), Content Posting API (Direct Post) | Audit TikTok obligatoire — sans lui, les publications restent privées (visibles de l'auteur uniquement). |
| **LinkedIn** | Une app sur [linkedin.com/developers](https://www.linkedin.com/developers/apps) | Le **LinkedIn Marketing Developer Program** est requis pour publier sur les pages entreprise (pas nécessaire pour le profil personnel). |
| **YouTube Shorts** | Un projet sur [Google Cloud Console](https://console.cloud.google.com), YouTube Data API v3 | **Vérification OAuth Google** pour la permission d'envoi de vidéos (`youtube.upload`). Délai : plusieurs semaines. |

Configurez les identifiants obtenus dans `.env.local`
(`META_APP_ID`/`META_APP_SECRET`, `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET`,
`LINKEDIN_CLIENT_ID`/`LINKEDIN_CLIENT_SECRET`,
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`).

Avant de coder chaque adaptateur (`SocialProvider`), la documentation
officielle à jour de chaque API sera vérifiée (formats acceptés, limites,
quotas, permissions exigées) — tout écart avec le cahier des charges sera
signalé.

## Ordre de travail

1. **Phase 1** *(en cours)* — projet, design system Atelier, auth,
   organisations/marques, navigation, tous les écrans avec données d'exemple.
2. **Phase 2** — positionnement, idées, scripts + prompteur, carrousels,
   conseiller (API Claude).
3. **Phase 3** — page lien en bio, aimants (PDF), capture de prospects,
   liens suivis.
4. **Phase 4** — Publier : `SocialProvider`, médiathèque, éditeur
   multi-réseaux, file de tâches, calendrier. Instagram + Facebook d'abord,
   puis LinkedIn, puis TikTok et YouTube. Mode sans API dès le départ.
5. **Phase 5** — synchronisation des statistiques, module Mesurer complet.
6. **Phase 6** — Stripe (formules, essai, limites, pause, parrainage).
7. **Phase 7** — PWA, conformité RGPD, emails, tests de bout en bout,
   déploiement.

À la fin de chaque phase, l'avancement est présenté avant de passer à la
suivante.

## Structure du projet

```
app/
  (auth)/           connexion, inscription
  (app)/             application protégée (sidebar + bottom nav)
    attirer/         positionnement, idées, scripts, carrousels, planning, analyse
    capter/          page lien en bio, aimants, prospects
    publier/         calendrier, éditeur multi-réseaux, comptes, médiathèque, liens
    mesurer/         parcours de conversion, statistiques
    conseil/         conseiller IA, fiches conseil
    formules/        tarifs, abonnement
  onboarding/        création d'une marque
  auth/              callback OAuth, server actions
components/
  ui/                design system (Button, Card, Badge, Input, Tabs, …)
  nav/               sidebar, barre du bas, sélecteur de marque
  attirer/ capter/ publier/ mesurer/ conseil/ formules/  composants par module
lib/
  supabase/          clients navigateur/serveur, session (proxy.ts)
  sample-data.ts     données d'exemple (Phase 1)
supabase/
  migrations/        schéma SQL, RLS
```

## Tests

À écrire au fil des phases pour : la file de publication (succès, échec
partiel, tentatives), le rafraîchissement des jetons, les limites des
formules, les webhooks Stripe et l'attribution publication → prospect.
