import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ATTIRER_TABS } from "@/lib/nav";
import { samplePostAnalysis } from "@/lib/sample-data";
import { formatNumber, formatDate } from "@/lib/utils";
import { Sparkles } from "lucide-react";

const METRICS: { key: keyof typeof samplePostAnalysis; label: string }[] = [
  { key: "views", label: "Vues" },
  { key: "likes", label: "J'aime" },
  { key: "comments", label: "Commentaires" },
  { key: "shares", label: "Partages" },
  { key: "saves", label: "Enregistrements" },
  { key: "clicks", label: "Clics vers votre page" },
  { key: "leads", label: "Prospects générés" },
];

export default function AnalysePage() {
  const data = samplePostAnalysis;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Analyse d&apos;une <em>publication</em></>}
        description="À partir de vos statistiques synchronisées ou saisies à la main, comparées à des repères."
      />
      <SectionTabs items={ATTIRER_TABS} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{data.title}</CardTitle>
            <CardDescription>
              {data.network} · publié le {formatDate(data.publishedAt)}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.key}>
              <p className="text-xs text-ink-secondary">{m.label}</p>
              <p className="font-mono text-xl text-ink">
                {formatNumber(data[m.key] as number)}
              </p>
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
                {formatNumber(data.views)} <span className="text-emerald">vs {formatNumber(data.benchmark.views)}</span>
              </p>
            </div>
            <div>
              <p className="text-ink-secondary">Clics</p>
              <p className="text-ink">
                {formatNumber(data.clicks)} <span className="text-emerald">vs {formatNumber(data.benchmark.clicks)}</span>
              </p>
            </div>
            <div>
              <p className="text-ink-secondary">Prospects</p>
              <p className="text-ink">
                {formatNumber(data.leads)} <span className="text-emerald">vs {formatNumber(data.benchmark.leads)}</span>
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
            <p className="mt-1 text-sm text-ink-secondary">{data.priority}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
