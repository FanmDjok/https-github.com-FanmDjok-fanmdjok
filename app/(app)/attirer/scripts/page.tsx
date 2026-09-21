import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ATTIRER_TABS } from "@/lib/nav";
import { sampleScripts } from "@/lib/sample-data";
import { Plus, Presentation } from "lucide-react";

const STATUS_TONE = {
  Publié: "emerald",
  Brouillon: "neutral",
} as const;

export default function ScriptsPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos scripts <em>vidéo</em></>}
        description="Accroche, développement, appel à l'action relié à votre page. 30, 60 ou 90 secondes."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nouveau script
          </Button>
        }
      />
      <SectionTabs items={ATTIRER_TABS} />

      <div className="flex flex-col gap-3">
        {sampleScripts.map((script) => (
          <Link key={script.id} href={`/attirer/scripts/${script.id}`}>
            <Card className="flex items-center justify-between gap-4 transition-colors hover:border-emerald/40">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <Badge tone={STATUS_TONE[script.status]}>{script.status}</Badge>
                  <span className="text-xs text-ink-secondary">
                    {script.objective} · {script.duration}s
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-ink">{script.title}</p>
              </div>
              <Presentation className="h-4 w-4 shrink-0 text-ink-secondary" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
