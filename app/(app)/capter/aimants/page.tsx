import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAPTER_TABS } from "@/lib/nav";
import { sampleLeadMagnets } from "@/lib/sample-data";
import { Plus, FileText } from "lucide-react";

const STATUS_TONE = {
  Publié: "emerald",
  Brouillon: "neutral",
} as const;

export default function AimantsPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos aimants à <em>prospects</em></>}
        description="Checklist, guide PDF ou mini-formation. L'IA propose un plan, vous ajustez, Growthis génère le PDF à votre charte."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nouvel aimant
          </Button>
        }
      />
      <SectionTabs items={CAPTER_TABS} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sampleLeadMagnets.map((magnet) => (
          <Card key={magnet.id}>
            <CardHeader>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10">
                <FileText className="h-4 w-4 text-emerald" />
              </div>
              <Badge tone={STATUS_TONE[magnet.status]}>{magnet.status}</Badge>
            </CardHeader>
            <CardTitle>{magnet.title}</CardTitle>
            <CardDescription className="mt-1">{magnet.type}</CardDescription>
            <p className="mt-4 text-sm text-ink-secondary">
              <span className="font-mono text-ink">{magnet.leads}</span> prospects capturés
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
