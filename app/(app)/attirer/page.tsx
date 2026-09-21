import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ATTIRER_TABS } from "@/lib/nav";
import {
  samplePositioning,
  sampleIdeas,
  sampleScripts,
  sampleCarousel,
  samplePostAnalysis,
} from "@/lib/sample-data";
import { ArrowRight, Target, Lightbulb, Video, Layers, CalendarDays, LineChart } from "lucide-react";

const cards = [
  {
    href: "/attirer/positionnement",
    icon: Target,
    title: "Positionnement",
    description: `${samplePositioning.idealClient}`,
  },
  {
    href: "/attirer/idees",
    icon: Lightbulb,
    title: "Idées de la semaine",
    description: `${sampleIdeas.length} idées prêtes, classées Attirer / Rassurer / Convertir.`,
  },
  {
    href: "/attirer/scripts",
    icon: Video,
    title: "Scripts vidéo",
    description: `${sampleScripts.length} scripts, prompteur plein écran inclus.`,
  },
  {
    href: "/attirer/carrousels",
    icon: Layers,
    title: "Carrousels",
    description: `Dernier carrousel : « ${sampleCarousel.title} » (${sampleCarousel.slidesCount} visuels).`,
  },
  {
    href: "/attirer/planning",
    icon: CalendarDays,
    title: "Planning éditorial 30 jours",
    description: "Règle 4-1-1 : 4 contenus utiles, 1 preuve, 1 offre.",
  },
  {
    href: "/attirer/analyse",
    icon: LineChart,
    title: "Analyse d'une publication",
    description: `Dernière analyse : « ${samplePostAnalysis.title} » sur ${samplePostAnalysis.network}.`,
  },
];

export default function AttirerPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Attirer des prospects avec votre <em>contenu</em></>}
        description="Votre positionnement guide chaque idée, chaque script et chaque carrousel généré par l'IA."
      />
      <SectionTabs items={ATTIRER_TABS} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full transition-colors hover:border-emerald/40">
                <CardHeader>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10">
                    <Icon className="h-4 w-4 text-emerald" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-ink-secondary" />
                </CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription className="mt-1">{card.description}</CardDescription>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Formule Gratuite</p>
            <p className="text-sm text-ink-secondary">5 scripts par mois inclus.</p>
          </div>
          <Badge tone="neutral">2 / 5 scripts utilisés ce mois-ci</Badge>
        </div>
      </Card>
    </div>
  );
}
