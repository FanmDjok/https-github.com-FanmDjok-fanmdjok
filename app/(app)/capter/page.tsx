import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CAPTER_TABS } from "@/lib/nav";
import { ArrowRight, Link2, Gift, Users } from "lucide-react";

export default async function CapterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);

  const [{ data: linkPage }, { data: magnets }, { count: leadsCount }, { count: newLeadsCount }] =
    currentId
      ? await Promise.all([
          supabase.from("link_pages").select("slug, buttons").eq("organization_id", currentId).maybeSingle(),
          supabase
            .from("lead_magnets")
            .select("id, status, leads(count)")
            .eq("organization_id", currentId),
          supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", currentId),
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", currentId)
            .eq("status", "Nouveau"),
        ])
      : [{ data: null }, { data: [] }, { count: 0 }, { count: 0 }];

  const publishedMagnets = (magnets ?? []).filter((m) => m.status === "publié").length;
  const capturedFromMagnets = (magnets ?? []).reduce(
    (sum, m) => sum + ((m.leads as unknown as { count: number }[])[0]?.count ?? 0),
    0,
  );

  const cards = [
    {
      href: "/capter/page-lien",
      icon: Link2,
      title: "Page lien en bio",
      description: linkPage
        ? `growthis.io/${linkPage.slug} — ${linkPage.buttons.length} bouton(s) actif(s).`
        : "Pas encore publiée — c'est la première chose à faire.",
    },
    {
      href: "/capter/aimants",
      icon: Gift,
      title: "Aimants à prospects",
      description: `${publishedMagnets} aimant(s) publié(s), ${capturedFromMagnets} prospect(s) capturé(s).`,
    },
    {
      href: "/capter/prospects",
      icon: Users,
      title: "Prospects",
      description: `${leadsCount ?? 0} prospects au total, dont ${newLeadsCount ?? 0} nouveaux.`,
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
