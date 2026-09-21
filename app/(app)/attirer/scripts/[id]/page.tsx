import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScriptDetail } from "@/components/attirer/script-detail";
import { ArrowLeft } from "lucide-react";

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: script } = await supabase
    .from("scripts")
    .select("id, title, objective, duration, hook, body, cta")
    .eq("id", id)
    .maybeSingle();

  if (!script) notFound();

  return (
    <div className="animate-fade-up">
      <Link
        href="/attirer/scripts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tous les scripts
      </Link>

      <PageHeader
        title={script.title}
        description={`Objectif ${script.objective.toLowerCase()} · ${script.duration} secondes`}
        actions={<ScriptDetail hook={script.hook} body={script.body} cta={script.cta} />}
      />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <Badge tone="emerald">Accroche</Badge>
          </CardHeader>
          <CardDescription className="text-base text-ink">{script.hook}</CardDescription>
        </Card>
        <Card>
          <CardHeader>
            <Badge tone="neutral">Développement</Badge>
          </CardHeader>
          <CardDescription className="text-base text-ink">{script.body}</CardDescription>
        </Card>
        <Card>
          <CardHeader>
            <Badge tone="warning">Appel à l&apos;action</Badge>
          </CardHeader>
          <CardTitle className="text-base font-normal text-ink">{script.cta}</CardTitle>
        </Card>
      </div>
    </div>
  );
}
