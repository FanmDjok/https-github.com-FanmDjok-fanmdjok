import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { PositioningForm } from "@/components/attirer/positioning-form";
import { ATTIRER_TABS } from "@/lib/nav";
import { Sparkles } from "lucide-react";

export default async function PositionnementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: positioning } = currentId
    ? await supabase
        .from("positioning")
        .select("ideal_client, problem, promise, offer")
        .eq("organization_id", currentId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Votre <em>positionnement</em></>}
        description="Toute l'intelligence artificielle de Growthis s'appuie sur ces quatre réponses : idées, scripts, carrousels et conseils en découlent."
      />
      <SectionTabs items={ATTIRER_TABS} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <PositioningForm initial={positioning} />
        </Card>

        <Card className="h-fit border-emerald/30 bg-emerald/[0.04]">
          <CardHeader>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10">
              <Sparkles className="h-4 w-4 text-emerald" />
            </div>
          </CardHeader>
          <p className="text-base font-medium text-ink">Pourquoi c&apos;est important</p>
          <CardDescription className="mt-2">
            Un positionnement clair permet à l&apos;IA de proposer des idées,
            des scripts et des carrousels qui parlent directement à votre
            client idéal, sans rester générique. Vous pouvez l&apos;ajuster
            à tout moment : les futurs contenus s&apos;adaptent
            automatiquement.
          </CardDescription>
        </Card>
      </div>
    </div>
  );
}
