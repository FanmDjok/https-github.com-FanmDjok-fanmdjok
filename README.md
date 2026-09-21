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

- **Phase 1** ✅ : projet, design system « Atelier », authentification,
  organisations/marques, navigation et tous les écrans avec des données
  d'exemple.
- **Phase 2** ✅ : positionnement (persisté), idées de la semaine, scripts
  vidéo (+ prompteur) et carrousels générés par l'API Claude et enregistrés
  en base, conseiller IA avec historique et limite mensuelle en formule
  Gratuite. Le planning éditorial 30 jours et l'analyse de publication
  restent en données d'exemple (ils dépendent de Publier/Mesurer, Phases 4-5).
- **Phase 3** ✅ : page lien en bio publique et persistée (`/[slug]`), liens
  suivis avec compteur de clics (`/l/[code]`), aimants à prospects avec plan
  généré par l'IA, PDF à la charte de la marque (Supabase Storage) et page
  de capture publique conforme RGPD, envoi automatique par email (Resend),
  prospects en base avec export CSV et messages de relance générés par l'IA.
- **Phase 4** ✅ : module Publier — interface `SocialProvider` commune,
  adaptateurs Instagram + Facebook (Graph API) complets, LinkedIn et
  YouTube fonctionnels (scopes limités tant que les validations
  plateforme ne sont pas obtenues), TikTok en place (visibilité forcée en
  privé avant audit) ; médiathèque Supabase Storage, éditeur multi-réseaux
  réel avec légendes adaptées par l'IA, file de tâches Inngest (retries,
  backoff), calendrier, mode sans API avec rappel par email et
  confirmation manuelle, notifications in-app et par email en cas
  d'échec. Voir [Limites connues de Publier](#limites-connues-de-publier).
- **Phase 5** ✅ : synchronisation périodique des statistiques (Inngest,
  toutes les 6h puis quotidienne après 7 jours), import automatique des
  publications des 90 derniers jours à la connexion d'un compte,
  attribution publication → lien suivi → prospect, module Mesurer
  complet (tunnel de conversion, prospects par semaine, contenus qui
  rapportent, prospects par réseau, lecture IA) et Analyse de publication
  (Attirer) sur des données réelles.
- **Phase 6** ✅ : Stripe — essai Business 14 jours à l'inscription (sans
  carte), Checkout/portail de facturation, pause d'abonnement (1 à 3 mois),
  parrainage (1 mois offert des deux côtés), webhooks synchronisant
  l'abonnement et la formule de l'organisation, limites de formule étendues
  (réseaux connectés, publications/mois, prospects, aimants à prospects).
  Code complet et testé unitairement ; **en attente de clés Stripe dédiées**
  pour une vérification en conditions réelles (voir
  [Configurer Stripe](#configurer-stripe)).
- **Phase 7** ✅ : PWA installable (manifest, icônes, service worker), pages
  légales (mentions légales, confidentialité, CGU, CGV), export RGPD complet
  et suppression d'organisation, callback de suppression de données Meta,
  emails transactionnels supplémentaires (bienvenue, fin d'essai, échec de
  paiement, récompense de parrainage), suite de tests (`npm test`),
  documentation de déploiement Vercel.

Voir la section [Ordre de travail](#ordre-de-travail) plus bas.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Supabase** : authentification (email + Google), Postgres avec RLS sur
  toutes les tables, Storage pour les médias
- **Anthropic (Claude API)** pour tous les contenus texte, réponses JSON
  validées par `zod` (Phase 2)
- **Stripe** : abonnements, essai, portail client, pause, parrainage, webhooks
- **Inngest** pour la file de publication programmée, les synchronisations
  de statistiques et l'expiration des essais (retries automatiques, backoff
  exponentiel)
- **Resend** pour les emails transactionnels
- **Vitest** pour les tests unitaires (`npm test`)
- PWA installable (manifest + service worker)
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
5. Appliquez les migrations SQL du dossier `supabase/migrations/`, **dans
   l'ordre numérique**, via le SQL Editor de Supabase ou `supabase db push`
   avec la CLI Supabase. La migration `0003_capter.sql` crée aussi le bucket
   Storage privé `lead-magnets` (PDF des aimants à prospects) — aucune étape
   manuelle n'est nécessaire dans le tableau de bord Storage.
   `0008_security_lockdown.sql` doit rester la **dernière** migration
   appliquée : Supabase réaccorde automatiquement `EXECUTE` à `anon`/
   `authenticated` sur les fonctions du schéma `public` à chaque nouvelle
   migration (pas seulement à la création), ce qui annule silencieusement les
   `revoke` faits par les migrations précédentes sur les fonctions réservées
   à `service_role`. Si vous ajoutez une migration après celle-ci, ré-exécutez
   `0008` ensuite (elle est idempotente).
6. Créez une clé sur [resend.com](https://resend.com/api-keys) et
   renseignez `RESEND_API_KEY` pour l'envoi automatique des documents
   d'aimants à prospects (`RESEND_FROM_EMAIL` doit être un domaine vérifié
   dans Resend en production).

### Variables d'environnement

Voir `.env.example` pour la liste complète et commentée. Aucun secret ne
doit être exposé côté client (seules les variables préfixées
`NEXT_PUBLIC_` le sont). Les jetons des réseaux sociaux sont chiffrés en
base avec `ENCRYPTION_KEY` avant stockage.

### Configurer l'API Claude

1. Créez une clé sur [console.anthropic.com](https://console.anthropic.com/settings/keys)
   et renseignez-la dans `ANTHROPIC_API_KEY`.
2. `ANTHROPIC_MODEL` contrôle le modèle utilisé pour toutes les générations
   de texte (par défaut `claude-opus-5`) — ajustez-le si besoin sans
   toucher au code.
3. Toutes les réponses IA sont contraintes par un schéma `zod` côté serveur
   (`lib/ai/schemas.ts`) via les sorties structurées de l'API Messages —
   aucune réponse IA n'atteint la base sans validation de forme.
4. Sans clé valide, les pages Idées / Scripts / Carrousels / Conseil
   affichent une erreur de génération au lieu de planter : le reste de
   l'application (auth, navigation, positionnement) fonctionne normalement.

### Configurer Stripe

1. Créez un compte sur [dashboard.stripe.com](https://dashboard.stripe.com)
   (utilisez le **mode test** tant que vous n'êtes pas prêt à facturer
   réellement).
2. Créez deux produits (« Essentiel » et « Business »), chacun avec un prix
   mensuel et un prix annuel récurrents. Copiez les 4 `price_...` obtenus dans
   `STRIPE_PRICE_ESSENTIEL_MONTHLY`, `STRIPE_PRICE_ESSENTIEL_YEARLY`,
   `STRIPE_PRICE_BUSINESS_MONTHLY`, `STRIPE_PRICE_BUSINESS_YEARLY`.
3. Copiez la clé secrète (`sk_test_...` ou `sk_live_...`) dans
   `STRIPE_SECRET_KEY`.
4. Activez le [portail client Stripe](https://dashboard.stripe.com/settings/billing/portal)
   (Billing → Customer portal) pour que le bouton « Gérer la facturation »
   fonctionne.
5. Créez un endpoint de webhook pointant vers
   `<NEXT_PUBLIC_APP_URL>/api/stripe/webhook`, écoutant au minimum
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted` et
   `invoice.payment_failed`. Copiez le secret de signature (`whsec_...`) dans
   `STRIPE_WEBHOOK_SECRET`. En local, `stripe listen --forward-to
   localhost:3000/api/stripe/webhook` fournit un secret temporaire.
6. Le coupon de parrainage (1 mois offert, 100 %, une seule fois) est créé
   automatiquement au premier parrainage utilisé — aucune étape manuelle.

**Important** : le connecteur Stripe éventuellement disponible dans un
environnement de développement partagé peut pointer vers un compte Stripe
sans rapport avec Growthis (une autre activité, en mode production) — ne
créez jamais de produits/prix/webhooks dessus. Utilisez toujours un compte
Stripe dédié à Growthis, de préférence en mode test durant le développement.

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

Vous aurez aussi besoin de :
- `ENCRYPTION_KEY` : `openssl rand -base64 32` (chiffrement des jetons en base).
- `NEXT_PUBLIC_APP_URL` : doit correspondre exactement à l'URL de callback
  déclarée dans chaque application développeur
  (`<NEXT_PUBLIC_APP_URL>/api/social/<reseau>/callback`).
- Un compte [Inngest](https://app.inngest.com) : en local, `npx inngest-cli@latest dev`
  lance le serveur de développement qui découvre automatiquement les
  fonctions exposées sur `/api/inngest`.

### Limites connues de Publier

- **Instagram et Facebook** : implémentation complète (Graph API Content
  Publishing), mais une seule Page gérée par organisation est prise en
  charge pour l'instant — un utilisateur gérant plusieurs Pages devra
  attendre un sélecteur de Page dans une prochaine itération.
- **LinkedIn** : profil personnel uniquement (texte + image). La vidéo et
  la publication sur une page entreprise ne sont pas encore câblées.
- **YouTube** : envoi en un seul appel (pas d'upload par blocs), adapté aux
  formats Shorts mais à revoir pour des fichiers volumineux.
- **TikTok** : la visibilité est forcée à « Moi uniquement » par la
  plateforme tant que l'audit de la Content Posting API n'est pas passé —
  Growthis respecte cette contrainte plutôt que de la contourner.
- **Reprogrammation** : un « Réessayer » est disponible sur les échecs,
  mais changer la date d'une publication déjà en file d'attente n'est pas
  encore câblé (cela demande l'annulation de la tâche Inngest en cours,
  pas seulement une mise à jour en base) — évitez de reprogrammer une
  publication déjà « En attente » pour l'instant.
- **Statistiques** (`fetchInsights`) : implémentées pour les 5 réseaux
  (Phase 5), en best-effort — un échec renvoie des zéros plutôt que de
  bloquer la synchronisation des autres publications.
- Aucun de ces adaptateurs n'a pu être testé avec de vrais comptes dans cet
  environnement de développement (pas d'accès réseau sortant vers les API
  concernées) : à valider dès que vos accès développeur seront actifs.

### Limites connues de Mesurer

- Les « vues » et « clics » du parcours de conversion ne comptent que les
  publications synchronisées et leurs liens suivis générés automatiquement
  — un prospect capturé directement sur la page lien en bio (sans passer
  par un lien de publication) compte dans « Prospects » mais pas dans
  « Clics ». C'est une approximation assumée tant que l'attribution n'est
  pas généralisée à tous les boutons.
- Les compteurs de clics sont cumulatifs (pas d'horodatage par clic) : le
  filtrage par période (7/30/90 jours) se fait sur la date de publication
  du contenu, pas sur la date du clic.
- LinkedIn, TikTok et YouTube n'ont pas de statistiques de vues fiables
  tant que les permissions/audits correspondants ne sont pas obtenus (voir
  les limites de Publier ci-dessus).

## Ordre de travail

1. **Phase 1** ✅ — projet, design system Atelier, auth,
   organisations/marques, navigation, tous les écrans avec données d'exemple.
2. **Phase 2** ✅ — positionnement, idées, scripts + prompteur, carrousels,
   conseiller (API Claude).
3. **Phase 3** ✅ — page lien en bio, aimants (PDF), capture de prospects,
   liens suivis.
4. **Phase 4** ✅ — Publier : `SocialProvider`, médiathèque, éditeur
   multi-réseaux, file de tâches, calendrier. Instagram + Facebook d'abord,
   puis LinkedIn, puis TikTok et YouTube. Mode sans API dès le départ.
5. **Phase 5** ✅ — synchronisation des statistiques, module Mesurer complet.
6. **Phase 6** ✅ — Stripe (formules, essai, limites, pause, parrainage).
7. **Phase 7** ✅ — PWA, conformité RGPD, emails, tests unitaires,
   documentation de déploiement.

Première version complète : toutes les phases du cahier des charges sont
codées et testées unitairement. Reste à valider en conditions réelles ce qui
dépend de services externes non accessibles depuis l'environnement de
développement (clés Stripe dédiées, comptes développeurs réseaux sociaux
validés, déploiement effectif) — voir les sections « Limites connues »
ci-dessus et [Déploiement](#déploiement-vercel).

## Structure du projet

```
app/
  (auth)/           connexion, inscription
  (legal)/           mentions légales, confidentialité, CGU, CGV (public)
  (app)/             application protégée (sidebar + bottom nav)
    attirer/         positionnement, idées, scripts, carrousels, planning, analyse
    capter/          page lien en bio, aimants, prospects
    publier/         calendrier, éditeur multi-réseaux, comptes, médiathèque, liens
    mesurer/         parcours de conversion, statistiques
    conseil/         conseiller IA, fiches conseil
    formules/        tarifs, abonnement, actions Stripe (checkout/portail/pause)
    parametres/      export et suppression RGPD
  api/
    stripe/          checkout webhook
    rgpd/            export JSON
    social/          OAuth + connect/callback + data-deletion (Meta)
  onboarding/        création d'une marque (essai Business 14 jours)
  auth/              callback OAuth, server actions
components/
  ui/                design system (Button, Card, Badge, Input, Tabs, …)
  nav/               sidebar, barre du bas, sélecteur de marque
  attirer/ capter/ publier/ mesurer/ conseil/ formules/ parametres/  composants par module
lib/
  supabase/          clients navigateur/serveur, session (proxy.ts)
  stripe/            client Stripe, mapping des prix, synchronisation d'abonnement
  inngest/functions/ file de publication, sync statistiques, expiration des essais
  sample-data.ts     données d'exemple (Phase 1)
supabase/
  migrations/        schéma SQL, RLS
test/
  fake-supabase.ts   faux client PostgREST pour les tests unitaires
```

## Tests

```bash
npm test
```

Suite Vitest (36 tests, aucun accès réseau ni projet Supabase requis — un
faux client PostgREST minimal dans `test/fake-supabase.ts` simule les
requêtes) couvrant :

- la file de publication (succès, mode sans API, échec temporaire avec
  relance, échec définitif, jeton à reconnecter, contraintes réseau) ;
- le rafraîchissement de jeton (jeton valide, rafraîchissement + rechiffrement,
  échec de rafraîchissement) ;
- les limites de formule (cohérence des paliers, compteurs, blocage au seuil) ;
- les webhooks Stripe (signature invalide, synchronisation d'abonnement,
  résolution via `checkout.session.completed`) ;
- la synchronisation des statuts Stripe vers la formule de l'organisation ;
- l'attribution publication → lien suivi → prospect.

## PWA

L'application est installable (manifest + service worker minimal qui met en
cache le shell applicatif, jamais les routes `/api`). Pour régénérer les
icônes après une modification de la charte : `node scripts/generate-icons.mjs`
(nécessite `sharp`, déjà en dépendance).

## RGPD

- **Export** : chaque organisation peut télécharger l'intégralité de ses
  données (`/parametres`, ou directement `GET /api/rgpd/export`) — exclut
  systématiquement les jetons sociaux chiffrés et les fichiers binaires.
- **Suppression** : suppression d'organisation avec confirmation par saisie
  du slug (`/parametres`) — annule l'abonnement Stripe, vide les buckets
  Storage, puis supprime la ligne `organizations` (cascade SQL pour le reste).
- **Callback Meta** : `/api/social/data-deletion` vérifie le `signed_request`
  (HMAC SHA-256) envoyé par Meta et répond au format attendu par l'App
  Review. Limite connue : les comptes sociaux stockent l'identifiant de la
  Page/du compte Instagram Business, pas celui de la personne ayant autorisé
  l'app, donc la correspondance exacte avec une organisation n'est pas
  garantie — la demande est journalisée dans tous les cas.
- Pages légales publiques : `/mentions-legales`, `/confidentialite`, `/cgu`,
  `/cgv` — **les mentions légales contiennent des champs entre crochets à
  compléter avec les informations réelles de l'entreprise avant mise en
  production**.

## Déploiement (Vercel)

1. Importez le dépôt sur [vercel.com](https://vercel.com/new).
2. Renseignez toutes les variables de `.env.example` dans les paramètres du
   projet Vercel (Production **et** Preview si vous testez sur des branches).
3. `NEXT_PUBLIC_APP_URL` doit être l'URL de production exacte (utilisée pour
   les redirections OAuth, Stripe et les liens dans les emails).
4. Mettez à jour, dans chaque application développeur (Meta, TikTok,
   LinkedIn, Google) et dans Stripe, les URLs de callback/webhook avec le
   domaine de production.
5. Le endpoint `/api/inngest` est découvert automatiquement par Inngest en
   production une fois `INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY` renseignées
   (créez une app sur [app.inngest.com](https://app.inngest.com) et
   synchronisez l'URL `https://<votre-domaine>/api/inngest`) — sans ça, la
   file de publication programmée et les jobs planifiés (statistiques,
   expiration des essais) ne s'exécutent pas.
6. Vérifiez `npm run build` et `npm test` en local avant de déployer.
