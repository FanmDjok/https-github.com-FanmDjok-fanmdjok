import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getUsage } from "@/lib/usage";
import { PLAN_LIMITS } from "@/lib/limits";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoachChat } from "@/components/conseil/coach-chat";
import { sampleAdviceSheets } from "@/lib/sample-data";
import { CalendarCheck, FileText } from "lucide-react";

export default async function ConseilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  const plan = org?.plan ?? "gratuit";

  const [{ data: history }, used] = currentId
    ? await Promise.all([
        supabase
          .from("coach_messages")
          .select("id, role, content")
          .eq("organization_id", currentId)
          .order("created_at", { ascending: true }),
        getUsage(supabase, currentId, "coach_questions"),
      ])
    : [{ data: [] }, 0];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Votre <em>conseiller</em></>}
        description="Il connaît votre positionnement, vos contenus, vos statistiques et vos prospects. Concret, sans détour."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <CoachChat initialMessages={history ?? []} limit={PLAN_LIMITS[plan].coachQuestionsPerMonth} used={used} />

        <div className="flex flex-col gap-4">
          <Card className="flex items-start gap-3 border-line bg-paper">
            <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
            <div>
              <p className="text-sm font-medium text-ink">Bilan du lundi</p>
              <p className="mt-1 text-xs text-ink-secondary">
                Un résumé automatique (email et in-app) chaque lundi matin. Disponible en
                formule <Badge tone="neutral">Business</Badge>.
              </p>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-3">Fiches conseil</CardTitle>
            <div className="flex flex-col gap-1">
              {sampleAdviceSheets.map((sheet) => (
                <button
                  key={sheet.id}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-ink/5"
                >
                  <FileText className="h-4 w-4 shrink-0 text-ink-secondary" />
                  {sheet.title}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
