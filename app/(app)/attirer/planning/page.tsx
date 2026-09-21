import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ATTIRER_TABS } from "@/lib/nav";
import { sampleEditorialPlan } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

const TYPE_TONE = {
  Utile: "neutral",
  Preuve: "warning",
  Offre: "emerald",
} as const;

export default function PlanningPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Planning éditorial <em>30 jours</em></>}
        description="La règle 4-1-1 : 4 contenus utiles, 1 preuve, 1 offre. Relié à votre calendrier de publication."
      />
      <SectionTabs items={ATTIRER_TABS} />

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink/30" /> Utile
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning" /> Preuve
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald" /> Offre
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sampleEditorialPlan.map((item) => (
          <Card key={item.day} className={cn("flex items-start gap-3 p-4")}>
            <span className="font-mono text-xs text-ink-secondary">
              J{String(item.day).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Badge tone={TYPE_TONE[item.type]} className="mb-1.5">
                {item.type}
              </Badge>
              <p className="truncate text-sm text-ink">{item.title}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
