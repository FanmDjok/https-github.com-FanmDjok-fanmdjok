import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { generateStructured } from "@/lib/ai/generate";
import { MesurerInsightSchema } from "@/lib/ai/schemas";
import { BRAND_VOICE } from "@/lib/ai/prompts";
import { PageHeader } from "@/components/layout/page-header";
import { PeriodTabs } from "@/components/mesurer/period-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Funnel } from "@/components/mesurer/funnel";
import { LeadsChart } from "@/components/mesurer/leads-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber, isoDaysAgo } from "@/lib/utils";
import { Sparkles, LineChart as LineChartIcon } from "lucide-react";

function startOfIsoWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function MesurerPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const days = Number(period) === 7 || Number(period) === 90 ? Number(period) : 30;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const since = isoDaysAgo(days);

  const [{ data: funnelRows }, { data: contentRows }, { data: networkRows }, { data: leadDates }] =
    currentId
      ? await Promise.all([
          supabase.rpc("conversion_funnel", { p_organization_id: currentId, p_since: since }),
          supabase.rpc("content_performance", { p_organization_id: currentId, p_since: since }),
          supabase.rpc("leads_by_network", { p_organization_id: currentId, p_since: since }),
          supabase
            .from("leads")
            .select("created_at")
            .eq("organization_id", currentId)
            .gte("created_at", since),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const funnel = funnelRows?.[0];
  const stages = [
    { stage: "Vues", value: funnel?.views ?? 0 },
    { stage: "Clics", value: funnel?.clicks ?? 0 },
    { stage: "Prospects", value: funnel?.leads ?? 0 },
    { stage: "Clients", value: funnel?.clients ?? 0 },
  ];

  const weekBuckets = new Map<string, number>();
  for (const lead of leadDates ?? []) {
    const weekStart = startOfIsoWeek(new Date(lead.created_at)).toISOString().slice(0, 10);
    weekBuckets.set(weekStart, (weekBuckets.get(weekStart) ?? 0) + 1);
  }
  const leadsPerWeek = Array.from(weekBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, leads], i) => ({ week: `S${i + 1}`, leads }));

  const maxNetworkLeads = Math.max(1, ...(networkRows ?? []).map((n) => n.leads));

  let insight =
    "Pas encore assez de données pour une lecture fiable : connectez vos réseaux et publiez régulièrement.";
  if (funnel && (funnel.leads > 0 || funnel.views > 0)) {
    try {
      const result = await generateStructured({
        schema: MesurerInsightSchema,
        system: BRAND_VOICE,
        prompt: `Voici les statistiques des ${days} derniers jours de l'utilisateur :
- Vues : ${funnel.views}
- Clics vers sa page : ${funnel.clicks}
- Prospects : ${funnel.leads}
- Clients : ${funnel.clients}
- Contenus les plus performants : ${(contentRows ?? [])
          .slice(0, 3)
          .map((c) => `« ${c.title} » (${c.views} vues, ${c.leads} prospects)`)
          .join(", ") || "aucun contenu synchronisé pour l'instant"}

Donne une lecture concrète en 2-3 phrases avec une seule recommandation
actionnable pour la semaine prochaine.`,
      });
      insight = result.insight;
    } catch {
      // Garde le message par défaut si la génération échoue.
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Mesurer ce qui <em>rapporte</em></>}
        description="Le parcours complet, du contenu jusqu'au client."
        actions={<PeriodTabs />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parcours de conversion</CardTitle>
          </CardHeader>
          <Funnel stages={stages} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prospects par semaine</CardTitle>
          </CardHeader>
          {leadsPerWeek.length > 0 ? (
            <LeadsChart data={leadsPerWeek} />
          ) : (
            <EmptyState icon={LineChartIcon} title="Pas encore de prospects sur cette période" />
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Contenus qui rapportent</CardTitle>
            <CardDescription>Classés par prospects générés.</CardDescription>
          </div>
        </CardHeader>
        {contentRows && contentRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-secondary">
                  <th className="py-2 pr-4 font-medium">Contenu</th>
                  <th className="py-2 pr-4 font-medium">Vues</th>
                  <th className="py-2 pr-4 font-medium">Clics</th>
                  <th className="py-2 pr-4 font-medium">Prospects</th>
                  <th className="py-2 pr-4 font-medium">Taux clic → prospect</th>
                  <th className="py-2 font-medium">Clients</th>
                </tr>
              </thead>
              <tbody>
                {contentRows.map((c) => (
                  <tr key={c.post_id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 text-ink">{c.title}</td>
                    <td className="py-3 pr-4 font-mono text-ink-secondary">{formatNumber(c.views)}</td>
                    <td className="py-3 pr-4 font-mono text-ink-secondary">{formatNumber(c.clicks)}</td>
                    <td className="py-3 pr-4 font-mono text-emerald">{formatNumber(c.leads)}</td>
                    <td className="py-3 pr-4 font-mono text-ink-secondary">
                      {c.clicks > 0 ? `${((c.leads / c.clicks) * 100).toFixed(1)} %` : "—"}
                    </td>
                    <td className="py-3 font-mono text-ink-secondary">{formatNumber(c.clients)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={LineChartIcon}
            title="Aucun contenu publié sur cette période"
            description="Publiez et connectez vos réseaux pour voir vos contenus les plus rentables."
          />
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prospects par réseau</CardTitle>
          </CardHeader>
          {networkRows && networkRows.length > 0 ? (
            <div className="flex flex-col gap-3">
              {networkRows.map((n) => (
                <div key={n.network}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-ink">{n.network}</span>
                    <span className="font-mono text-ink-secondary">{n.leads}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink/5">
                    <div
                      className="h-full rounded-full bg-emerald"
                      style={{ width: `${(n.leads / maxNetworkLeads) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-secondary">Aucun prospect sur cette période.</p>
          )}
        </Card>

        <Card className="border-emerald/30 bg-emerald/[0.04]">
          <CardHeader>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10">
              <Sparkles className="h-4 w-4 text-emerald" />
            </div>
          </CardHeader>
          <CardTitle>La lecture de votre conseiller</CardTitle>
          <CardDescription className="mt-2 text-sm text-ink">{insight}</CardDescription>
        </Card>
      </div>
    </div>
  );
}
