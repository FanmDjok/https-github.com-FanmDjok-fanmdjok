import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getPositioning } from "@/lib/positioning";
import { getUsage } from "@/lib/usage";
import { PLAN_LIMITS } from "@/lib/limits";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ATTIRER_TABS } from "@/lib/nav";
import { sampleCarousel, samplePostAnalysis } from "@/lib/sample-data";
import { ArrowRight, Target, Lightbulb, Video, Layers, CalendarDays, LineChart } from "lucide-react";

export default async function AttirerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  const plan = org?.plan ?? "gratuit";

  const positioning = currentId ? await getPositioning(supabase, currentId) : null;

  const [{ count: scriptsCount }, { count: carouselsCount }, scriptsUsed] = currentId
    ? await Promise.all([
        supabase.from("scripts").select("id", { count: "exact", head: true }).eq("organization_id", currentId),
        supabase.from("carousels").select("id", { count: "exact", head: true }).eq("organization_id", currentId),
        getUsage(supabase, currentId, "scripts_generated"),
      ])
    : [{ count: 0 }, { count: 0 }, 0];

  const scriptsLimit = PLAN_LIMITS[plan].scriptsPerMonth;

  const cards = [
    {
      href: "/attirer/positionnement",
      icon: Target,
      title: "Positionnement",
      description: positioning
        ? positioning.idealClient
        : "Pas encore renseigné — c'est la première chose à faire.",
    },
    {
      href: "/attirer/idees",
      icon: Lightbulb,
      title: "Idées de la semaine",
      description: "Générées par l'IA à partir de votre positionnement, classées Attirer / Rassurer / Convertir.",
    },
    {
      href: "/attirer/scripts",
      icon: Video,
      title: "Scripts vidéo",
      description: `${scriptsCount ?? 0} script(s) enregistré(s), prompteur plein écran inclus.`,
    },
    {
      href: "/attirer/carrousels",
      icon: Layers,
      title: "Carrousels",
      description:
        carouselsCount && carouselsCount > 0
          ? `${carouselsCount} carrousel(s) enregistré(s).`
          : `Aucun carrousel pour l'instant — exemple : « ${sampleCarousel.title} ».`,
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
      description: `Exemple : « ${samplePostAnalysis.title} » sur ${samplePostAnalysis.network}.`,
    },
  ];

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

      {scriptsLimit !== null ? (
        <Card className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Formule Gratuite</p>
              <p className="text-sm text-ink-secondary">{scriptsLimit} scripts par mois inclus.</p>
            </div>
            <Badge tone="neutral">
              {scriptsUsed} / {scriptsLimit} scripts utilisés ce mois-ci
            </Badge>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
