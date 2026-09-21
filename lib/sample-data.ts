// Données d'exemple pour la Phase 1 — remplacées par des requêtes Supabase
// réelles dans les phases suivantes.

export const sampleAccueil = {
  monthLabel: "Septembre",
  leadsThisMonth: 34,
  leadsTrend: "+12 vs. août",
  clientsThisMonth: 5,
  clientsTrend: "+2 vs. août",
  revenueEstimate: 2450,
  priorityOfTheDay: {
    title: "Republiez votre Reel « 3 erreurs qui coûtent des clients »",
    reason: "Il a généré 9 prospects en 30 jours, votre meilleur taux de conversion ce mois-ci.",
    ctaLabel: "Adapter et publier",
    ctaHref: "/attirer/scripts",
  },
  leadsToFollowUp: [
    { id: "l1", name: "Camille Ferrand", source: "Instagram", waitingSince: "3 jours", status: "Nouveau" as const },
    { id: "l2", name: "Karim Belhadj", source: "Page lien en bio", waitingSince: "5 jours", status: "Contacté" as const },
    { id: "l3", name: "Salomé Ricci", source: "TikTok", waitingSince: "1 jour", status: "Nouveau" as const },
  ],
  setupChecklist: [
    { id: "positioning", label: "Définir votre positionnement", done: true },
    { id: "page", label: "Publier votre page lien en bio", done: true },
    { id: "magnet", label: "Créer votre premier aimant à prospects", done: false },
    { id: "social", label: "Connecter votre premier réseau", done: true },
    { id: "post", label: "Publier votre première publication", done: false },
  ],
};

export const samplePositioning = {
  idealClient: "Coachs et thérapeutes indépendants qui démarrent leur activité en ligne",
  problem: "Elles publient sans stratégie et n'attirent pas de clients qualifiés",
  promise: "Structurer une offre claire et un contenu qui convertit, sans y passer ses soirées",
  offer: "Accompagnement individuel de 3 mois + programme de groupe mensuel",
};

export const sampleIdeas = [
  { id: "i1", objective: "Attirer" as const, title: "Les 3 signes que votre offre n'est pas claire", format: "Reel" },
  { id: "i2", objective: "Attirer" as const, title: "Ce que je dirais à mes débuts si je pouvais", format: "Carrousel" },
  { id: "i3", objective: "Rassurer" as const, title: "Une journée dans mon activité", format: "Story" },
  { id: "i4", objective: "Rassurer" as const, title: "Témoignage client : de 0 à 5 clients en 2 mois", format: "Reel" },
  { id: "i5", objective: "Convertir" as const, title: "3 places disponibles ce mois-ci pour l'accompagnement", format: "Post" },
];

export const sampleScripts = [
  {
    id: "s1",
    title: "3 erreurs qui coûtent des clients",
    objective: "Attirer",
    duration: 30 as const,
    status: "Publié" as const,
    hook: "Si vous publiez sans avoir de clients, ce n'est pas votre contenu le problème.",
    body: "Voici les 3 erreurs que je vois le plus souvent chez les indépendants qui débutent : parler à tout le monde au lieu d'un client idéal précis, cacher son offre par peur de \"trop vendre\", et publier sans jamais rappeler comment travailler avec vous.",
    cta: "Le lien de ma page est en bio si vous voulez qu'on en parle.",
  },
  {
    id: "s2",
    title: "Ce que je dirais à mes débuts",
    objective: "Rassurer",
    duration: 60 as const,
    status: "Brouillon" as const,
    hook: "Si je pouvais parler à la version de moi qui démarrait, voici ce que je lui dirais.",
    body: "Vous n'avez pas besoin d'être parfaite pour commencer. Vous avez besoin d'un positionnement clair et de dix personnes qui vous font confiance. Le reste s'apprend en marchant.",
    cta: "Découvrez comment je vous accompagne, lien en bio.",
  },
];

export const sampleCarousel = {
  id: "c1",
  title: "Les 3 signes que votre offre n'est pas claire",
  slidesCount: 8,
  slides: [
    "Les 3 signes que votre offre n'est pas claire",
    "Signe n°1 : vous changez de discours à chaque publication",
    "Signe n°2 : on vous demande souvent \"tu fais quoi exactement ?\"",
    "Signe n°3 : vos prospects disent \"je vais réfléchir\" et ne reviennent jamais",
    "La cause : vous essayez de parler à tout le monde",
    "La solution : un client idéal, un problème, une promesse",
    "Résultat : des prospects qui savent déjà pourquoi ils vous contactent",
    "Envie d'y voir plus clair ? Mon lien est en bio.",
  ],
};

export const sampleEditorialPlan = Array.from({ length: 30 }).map((_, i) => {
  const cycle = i % 6;
  const type = cycle === 4 ? "Preuve" : cycle === 5 ? "Offre" : "Utile";
  return {
    day: i + 1,
    type: type as "Utile" | "Preuve" | "Offre",
    title:
      type === "Offre"
        ? "Rappel de votre offre du moment"
        : type === "Preuve"
          ? "Témoignage ou résultat client"
          : sampleIdeas[i % sampleIdeas.length].title,
  };
});

export const samplePostAnalysis = {
  title: "3 erreurs qui coûtent des clients",
  network: "Instagram",
  publishedAt: "2026-09-08",
  views: 12400,
  likes: 480,
  comments: 36,
  shares: 52,
  saves: 210,
  clicks: 89,
  leads: 9,
  benchmark: { views: 6000, clicks: 40, leads: 4 },
  priority: "Vos enregistrements sont excellents : proposez un aimant à prospects lié à ce sujet pour transformer plus de vues en emails.",
};

export const sampleLinkPage = {
  slug: "camille-coaching",
  displayName: "Camille Dubois",
  bio: "J'aide les indépendantes à structurer une offre claire et à attirer des clients avec du contenu.",
  brandColor: "#0E8A5F",
  buttons: [
    { id: "b1", label: "Réserver un appel découverte", url: "#" },
    { id: "b2", label: "Recevoir la checklist gratuite", url: "#" },
    { id: "b3", label: "Voir mes accompagnements", url: "#" },
  ],
  plan: "gratuit" as const,
};

export const sampleLeadMagnets = [
  {
    id: "m1",
    title: "Checklist : 10 signes que votre offre est prête à se vendre",
    type: "Checklist" as const,
    status: "Publié" as const,
    leads: 128,
  },
  {
    id: "m2",
    title: "Guide : structurer votre premier appel découverte",
    type: "Guide PDF" as const,
    status: "Brouillon" as const,
    leads: 0,
  },
];

export const sampleLeads = [
  { id: "p1", name: "Camille Ferrand", email: "camille.f@exemple.fr", status: "Nouveau" as const, source: "3 erreurs qui coûtent des clients", network: "Instagram", date: "2026-09-18" },
  { id: "p2", name: "Karim Belhadj", email: "karim.b@exemple.fr", status: "Contacté" as const, source: "Checklist offre claire", network: "Page lien en bio", date: "2026-09-16" },
  { id: "p3", name: "Salomé Ricci", email: "salome.r@exemple.fr", status: "Nouveau" as const, source: "Ce que je dirais à mes débuts", network: "TikTok", date: "2026-09-20" },
  { id: "p4", name: "Yanis Moreau", email: "yanis.m@exemple.fr", status: "Client" as const, source: "Témoignage client", network: "Instagram", date: "2026-09-02" },
  { id: "p5", name: "Inès Petit", email: "ines.p@exemple.fr", status: "Contacté" as const, source: "Checklist offre claire", network: "LinkedIn", date: "2026-09-11" },
];

export const sampleSocialAccounts = [
  { id: "sa1", network: "instagram" as const, label: "@camille.coaching", status: "connecté" as const, expiresInDays: 45 },
  { id: "sa2", network: "facebook" as const, label: "Camille Coaching", status: "connecté" as const, expiresInDays: 45 },
  { id: "sa3", network: "linkedin" as const, label: "Camille Dubois", status: "à reconnecter" as const, expiresInDays: 0 },
  { id: "sa4", network: "tiktok" as const, label: null, status: "non connecté" as const, expiresInDays: null },
  { id: "sa5", network: "youtube" as const, label: null, status: "non connecté" as const, expiresInDays: null },
];

export const sampleMediaLibrary = [
  { id: "med1", type: "vidéo" as const, name: "reel-3-erreurs.mp4", duration: "0:32", addedAt: "2026-09-05" },
  { id: "med2", type: "image" as const, name: "carrousel-offre-claire-1.png", duration: null, addedAt: "2026-09-10" },
  { id: "med3", type: "vidéo" as const, name: "temoignage-yanis.mp4", duration: "0:48", addedAt: "2026-09-12" },
  { id: "med4", type: "image" as const, name: "photo-atelier.jpg", duration: null, addedAt: "2026-09-14" },
];

export const samplePosts = [
  {
    id: "post1",
    title: "3 erreurs qui coûtent des clients",
    scheduledAt: "2026-09-24T09:00:00",
    targets: [
      { network: "instagram" as const, status: "planifié" as const },
      { network: "facebook" as const, status: "planifié" as const },
      { network: "tiktok" as const, status: "sans connexion" as const },
    ],
  },
  {
    id: "post2",
    title: "Témoignage client : Yanis",
    scheduledAt: "2026-09-22T18:30:00",
    targets: [
      { network: "instagram" as const, status: "publié" as const, url: "#" },
      { network: "linkedin" as const, status: "échec" as const, error: "Le compte doit être reconnecté." },
    ],
  },
  {
    id: "post3",
    title: "Carrousel : offre claire",
    scheduledAt: "2026-09-21T12:00:00",
    targets: [
      { network: "instagram" as const, status: "en cours" as const },
    ],
  },
];

export const sampleTrackedLinks = [
  { id: "tl1", label: "3 erreurs qui coûtent des clients", network: "Instagram", clicks: 312, leads: 9 },
  { id: "tl2", label: "Témoignage client : Yanis", network: "Instagram", clicks: 145, leads: 4 },
  { id: "tl3", label: "Checklist offre claire", network: "Page lien en bio", clicks: 208, leads: 12 },
];

export const sampleFunnel = [
  { stage: "Vues", value: 48200 },
  { stage: "Clics", value: 1860 },
  { stage: "Prospects", value: 214 },
  { stage: "Clients", value: 18 },
];

export const sampleLeadsPerWeek = [
  { week: "S1", leads: 18 },
  { week: "S2", leads: 24 },
  { week: "S3", leads: 21 },
  { week: "S4", leads: 34 },
];

export const sampleTopContent = [
  { id: "tc1", title: "3 erreurs qui coûtent des clients", views: 12400, clicks: 89, leads: 9, rate: "10,1 %", clients: 2 },
  { id: "tc2", title: "Checklist offre claire", views: 8100, clicks: 208, leads: 12, rate: "5,8 %", clients: 3 },
  { id: "tc3", title: "Témoignage client : Yanis", views: 6600, clicks: 145, leads: 4, rate: "2,8 %", clients: 1 },
];

export const sampleLeadsByNetwork = [
  { network: "Instagram", leads: 19 },
  { network: "Page lien en bio", leads: 9 },
  { network: "TikTok", leads: 4 },
  { network: "LinkedIn", leads: 2 },
];

export const sampleCoachReading =
  "Vos contenus \"Rassurer\" génèrent peu de clics mais beaucoup d'enregistrements : c'est un signal de confiance, pas de conversion. Ajoutez un appel à l'action plus direct vers votre page dans vos 2 prochaines publications de preuve.";

export const sampleCoachMessages = [
  { id: "cm1", role: "assistant" as const, content: "Bonjour Camille. J'ai regardé vos statistiques de la semaine : votre Reel sur les 3 erreurs continue de générer des prospects. Voulez-vous que je vous propose une déclinaison ?" },
  { id: "cm2", role: "user" as const, content: "Oui, avec un angle différent." },
  { id: "cm3", role: "assistant" as const, content: "Je vous propose : \"Pourquoi vos prospects disent oui puis disparaissent\". Cela reprend le même problème sous un autre angle, utile pour vos abonnés qui n'ont pas vu la première version." },
];

export const sampleAdviceSheets = [
  { id: "as1", title: "La règle 4-1-1 expliquée simplement" },
  { id: "as2", title: "Construire un aimant à prospects qui convertit" },
  { id: "as3", title: "Des accroches qui qualifient vos prospects" },
  { id: "as4", title: "Relancer sans donner l'impression d'insister" },
];

export const PLANS = [
  {
    id: "gratuit" as const,
    name: "Gratuit",
    price: { monthly: 0, yearly: 0 },
    tagline: "Pour démarrer votre atelier",
    features: [
      "Positionnement",
      "5 scripts par mois",
      "Conseiller limité (5 questions/mois)",
      "Page lien en bio (mention Growthis)",
      "25 prospects",
      "2 réseaux connectés",
      "10 publications programmées/mois",
    ],
  },
  {
    id: "essentiel" as const,
    name: "Essentiel",
    price: { monthly: 19, yearly: 190 },
    tagline: "Pour publier sans y penser",
    features: [
      "IA illimitée",
      "Planning éditorial 30 jours",
      "Page à votre nom",
      "1 aimant à prospects",
      "500 prospects",
      "4 réseaux connectés",
      "Publications illimitées",
      "Tableau de bord complet",
    ],
  },
  {
    id: "business" as const,
    name: "Business",
    price: { monthly: 39, yearly: 390 },
    tagline: "Pour piloter plusieurs marques",
    features: [
      "Tout Essentiel",
      "Aimants illimités",
      "5 000 prospects",
      "Tous les réseaux",
      "3 marques",
      "Domaine personnalisé",
      "Bilan du lundi",
      "Rôle collaborateur",
    ],
  },
];
