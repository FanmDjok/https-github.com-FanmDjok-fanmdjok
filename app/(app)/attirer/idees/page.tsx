import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ATTIRER_TABS } from "@/lib/nav";
import { sampleIdeas } from "@/lib/sample-data";
import { RefreshCw, ArrowRight } from "lucide-react";

const OBJECTIVE_TONE = {
  Attirer: "emerald",
  Rassurer: "neutral",
  Convertir: "warning",
} as const;

export default function IdeesPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos idées de la <em>semaine</em></>}
        description="Classées par objectif, à partir de votre positionnement."
        actions={
          <Button variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4" />
            Nouvelles idées
          </Button>
        }
      />
      <SectionTabs items={ATTIRER_TABS} />

      <div className="flex flex-col gap-3">
        {sampleIdeas.map((idea) => (
          <Card key={idea.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <Badge tone={OBJECTIVE_TONE[idea.objective]}>{idea.objective}</Badge>
                <span className="text-xs text-ink-secondary">{idea.format}</span>
              </div>
              <p className="truncate text-sm font-medium text-ink">{idea.title}</p>
            </div>
            <Button variant="secondary" size="sm">
              Transformer en script
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
