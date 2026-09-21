import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LeadMagnetCreator } from "@/components/capter/lead-magnet-creator";
import { CAPTER_TABS } from "@/lib/nav";
import { FileText, Gift } from "lucide-react";

const STATUS_TONE = {
  publié: "emerald",
  brouillon: "neutral",
} as const;

export default async function AimantsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: magnets } = currentId
    ? await supabase
        .from("lead_magnets")
        .select("id, title, type, status, leads(count)")
        .eq("organization_id", currentId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos aimants à <em>prospects</em></>}
        description="Checklist, guide PDF ou mini-formation. L'IA propose un plan, vous ajustez, Growthis génère le PDF à votre charte."
        actions={<LeadMagnetCreator />}
      />
      <SectionTabs items={CAPTER_TABS} />

      {magnets && magnets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {magnets.map((magnet) => (
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
                <span className="font-mono text-ink">
                  {(magnet.leads as unknown as { count: number }[])[0]?.count ?? 0}
                </span>{" "}
                prospects capturés
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Gift}
          title="Aucun aimant pour l'instant"
          description="Créez votre premier aimant à partir d'un sujet : l'IA propose un plan, vous l'ajustez."
        />
      )}
    </div>
  );
}
