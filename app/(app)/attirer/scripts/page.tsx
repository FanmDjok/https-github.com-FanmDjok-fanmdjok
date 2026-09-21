import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NewScriptForm } from "@/components/attirer/new-script-form";
import { ATTIRER_TABS } from "@/lib/nav";
import { Presentation, Video } from "lucide-react";

const STATUS_TONE = {
  publié: "emerald",
  brouillon: "neutral",
} as const;

export default async function ScriptsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: scripts } = currentId
    ? await supabase
        .from("scripts")
        .select("id, title, objective, duration, status")
        .eq("organization_id", currentId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos scripts <em>vidéo</em></>}
        description="Accroche, développement, appel à l'action relié à votre page. 30, 60 ou 90 secondes."
        actions={<NewScriptForm />}
      />
      <SectionTabs items={ATTIRER_TABS} />

      {scripts && scripts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {scripts.map((script) => (
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
      ) : (
        <EmptyState
          icon={Video}
          title="Aucun script pour l'instant"
          description="Créez votre premier script à partir d'un sujet, ou transformez une idée de la semaine."
        />
      )}
    </div>
  );
}
