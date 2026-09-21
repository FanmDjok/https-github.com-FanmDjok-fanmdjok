import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CAPTER_TABS } from "@/lib/nav";
import { sampleLinkPage, sampleLeadMagnets, sampleLeads } from "@/lib/sample-data";
import { ArrowRight, Link2, Gift, Users } from "lucide-react";

export default function CapterPage() {
  const newLeads = sampleLeads.filter((l) => l.status === "Nouveau").length;

  const cards = [
    {
      href: "/capter/page-lien",
      icon: Link2,
      title: "Page lien en bio",
      description: `growthis.io/${sampleLinkPage.slug} — ${sampleLinkPage.buttons.length} boutons actifs.`,
    },
    {
      href: "/capter/aimants",
      icon: Gift,
      title: "Aimants à prospects",
      description: `${sampleLeadMagnets.filter((m) => m.status === "Publié").length} aimant publié, ${sampleLeadMagnets.reduce((s, m) => s + m.leads, 0)} prospects capturés.`,
    },
    {
      href: "/capter/prospects",
      icon: Users,
      title: "Prospects",
      description: `${sampleLeads.length} prospects au total, dont ${newLeads} nouveaux.`,
    },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Capter vos <em>prospects</em></>}
        description="Votre page, vos aimants et votre liste de prospects, au même endroit."
      />
      <SectionTabs items={CAPTER_TABS} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
    </div>
  );
}
