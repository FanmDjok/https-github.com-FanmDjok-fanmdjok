import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { generateStructured } from "@/lib/ai/generate";
import { PostAnalysisSchema } from "@/lib/ai/schemas";
import { BRAND_VOICE } from "@/lib/ai/prompts";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PostAnalysisSelector, type AnalysisOption } from "@/components/attirer/post-analysis-selector";
import { ATTIRER_TABS } from "@/lib/nav";
import { NETWORKS, type NetworkId } from "@/lib/networks";
import { formatNumber, formatDate } from "@/lib/utils";
import { Sparkles, LineChart } from "lucide-react";

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ postTargetId?: string }>;
}) {
  const { postTargetId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);

  const { data: targets } = currentId
    ? await supabase
        .from("post_targets")
        .select("id, network, published_at, posts(title)")
        .eq("organization_id", currentId)
        .eq("status", "publié")
        .order("published_at", { ascending: false })
        .limit(30)
    : { data: [] };

  if (!targets || targets.length === 0) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title={<>Analyse d&apos;une <em>publication</em></>}
          description="À partir de vos statistiques synchronisées, comparées à vos repères habituels."
        />
        <SectionTabs items={ATTIRER_TABS} />
        <EmptyState
          icon={LineChart}
          title="Aucune publication analysable pour l'instant"
          description="Connectez un réseau et publiez : les statistiques apparaîtront ici après synchronisation."
        />
      </div>
    );
  }

  const ids = targets.map((t) => t.id);
  const [{ data: metrics }, { data: links }] = await Promise.all([
    supabase.from("current_post_metrics").select("*").in("post_target_id", ids),
    supabase.from("tracked_links").select("id, post_target_id, clicks").in("post_target_id", ids),
  ]);

  const linkIds = (links ?? []).map((l) => l.id);
  const { data: leadsByLink } = linkIds.length
    ? await supabase.from("leads").select("tracked_link_id").in("tracked_link_id", linkIds)
    : { data: [] };

  const leadsCountByLink = new Map<string, number>();
  for (const lead of leadsByLink ?? []) {
    if (!lead.tracked_link_id) continue;
    leadsCountByLink.set(lead.tracked_link_id, (leadsCountByLink.get(lead.tracked_link_id) ?? 0) + 1);
  }

  const metricsByTarget = new Map((metrics ?? []).map((m) => [m.post_target_id, m]));
  const linkByTarget = new Map((links ?? []).map((l) => [l.post_target_id, l]));

  const rows = targets.map((t) => {
    const m = metricsByTarget.get(t.id);
    const link = linkByTarget.get(t.id);
    const clicks = link?.clicks ?? 0;
    const leads = link ? (leadsCountByLink.get(link.id) ?? 0) : 0;
    return {
      id: t.id,
      title: (t.posts as unknown as { title: string } | null)?.title ?? "Publication",
      network: t.network as NetworkId,
      publishedAt: t.published_at as string,
      views: m?.views ?? 0,
      likes: m?.likes ?? 0,
      comments: m?.comments ?? 0,
      shares: m?.shares ?? 0,
      saves: m?.saves ?? 0,
      clicks,
      leads,
    };
  });

  const options: AnalysisOption[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    network: r.network,
    publishedAt: r.publishedAt,
  }));

  const selected = rows.find((r) => r.id === postTargetId) ?? rows[0];

  const avg = (key: "views" | "clicks" | "leads") =>
    Math.round(rows.reduce((sum, r) => sum + r[key], 0) / rows.length);
  const benchmark = { views: avg("views"), clicks: avg("clicks"), leads: avg("leads") };

  let priority =
    "Pas encore assez de repères pour une recommandation fiable : publiez régulièrement pour affiner cette analyse.";
  if (rows.length >= 2) {
    try {
      const result = await generateStructured({
        schema: PostAnalysisSchema,
        system: BRAND_VOICE,
        prompt: `Analyse cette publication : « ${selected.title} » sur ${NETWORKS[selected.network].label}.
Ses statistiques : ${selected.views} vues, ${selected.likes} j'aime, ${selected.comments} commentaires,
${selected.shares} partages, ${selected.saves} enregistrements, ${selected.clicks} clics, ${selected.leads} prospects.
Repères habituels de l'utilisateur (moyenne de ses publications) : ${benchmark.views} vues,
${benchmark.clicks} clics, ${benchmark.leads} prospects.

Donne une seule priorité d'amélioration concrète, en 1-2 phrases.`,
      });
      priority = result.priority;
    } catch {
      // Garde le message par défaut si la génération échoue.
    }
  }

  const METRICS: { key: keyof typeof selected; label: string }[] = [
    { key: "views", label: "Vues" },
    { key: "likes", label: "J'aime" },
    { key: "comments", label: "Commentaires" },
    { key: "shares", label: "Partages" },
    { key: "saves", label: "Enregistrements" },
    { key: "clicks", label: "Clics vers votre page" },
    { key: "leads", label: "Prospects générés" },
  ];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Analyse d&apos;une <em>publication</em></>}
        description="À partir de vos statistiques synchronisées, comparées à vos repères habituels."
      />
      <SectionTabs items={ATTIRER_TABS} />

      <div className="mb-4">
        <PostAnalysisSelector options={options} selectedId={selected.id} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{selected.title}</CardTitle>
            <CardDescription>
              {NETWORKS[selected.network].label} · publié le {formatDate(selected.publishedAt)}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.key}>
              <p className="text-xs text-ink-secondary">{m.label}</p>
              <p className="font-mono text-xl text-ink">{formatNumber(selected[m.key] as number)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-line bg-paper p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">
            Comparé à vos repères habituels
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-ink-secondary">Vues</p>
              <p className="text-ink">
                {formatNumber(selected.views)}{" "}
                <span className="text-emerald">vs {formatNumber(benchmark.views)}</span>
              </p>
            </div>
            <div>
              <p className="text-ink-secondary">Clics</p>
              <p className="text-ink">
                {formatNumber(selected.clicks)}{" "}
                <span className="text-emerald">vs {formatNumber(benchmark.clicks)}</span>
              </p>
            </div>
            <div>
              <p className="text-ink-secondary">Prospects</p>
              <p className="text-ink">
                {formatNumber(selected.leads)}{" "}
                <span className="text-emerald">vs {formatNumber(benchmark.leads)}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-4 border-emerald/30 bg-emerald/[0.04]">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald/10">
            <Sparkles className="h-4 w-4 text-emerald" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Priorité d&apos;amélioration</p>
            <p className="mt-1 text-sm text-ink-secondary">{priority}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
