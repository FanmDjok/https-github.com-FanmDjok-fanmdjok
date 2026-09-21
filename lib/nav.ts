import {
  Home,
  Sparkles,
  Magnet,
  Send,
  BarChart3,
  MessageCircle,
  Gem,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/attirer", label: "Attirer", icon: Sparkles },
  { href: "/capter", label: "Capter", icon: Magnet },
  { href: "/publier", label: "Publier", icon: Send },
  { href: "/mesurer", label: "Mesurer", icon: BarChart3 },
  { href: "/conseil", label: "Conseil", icon: MessageCircle },
  { href: "/formules", label: "Formules", icon: Gem },
];

// La barre du bas (mobile) ne montre que les modules du quotidien.
export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((i) =>
  ["/", "/attirer", "/capter", "/publier", "/mesurer"].includes(i.href),
);

export const ATTIRER_TABS = [
  { href: "/attirer", label: "Vue d'ensemble" },
  { href: "/attirer/positionnement", label: "Positionnement" },
  { href: "/attirer/idees", label: "Idées" },
  { href: "/attirer/scripts", label: "Scripts" },
  { href: "/attirer/carrousels", label: "Carrousels" },
  { href: "/attirer/planning", label: "Planning 30 jours" },
  { href: "/attirer/analyse", label: "Analyse" },
];

export const CAPTER_TABS = [
  { href: "/capter", label: "Vue d'ensemble" },
  { href: "/capter/page-lien", label: "Page lien en bio" },
  { href: "/capter/aimants", label: "Aimants à prospects" },
  { href: "/capter/prospects", label: "Prospects" },
];

export const PUBLIER_TABS = [
  { href: "/publier", label: "Calendrier" },
  { href: "/publier/editeur", label: "Nouvelle publication" },
  { href: "/publier/medias", label: "Médiathèque" },
  { href: "/publier/comptes", label: "Comptes connectés" },
  { href: "/publier/liens", label: "Liens suivis" },
];
