import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { DeleteOrganization } from "@/components/parametres/delete-organization";
import { Download, ShieldAlert } from "lucide-react";

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId, orgs } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) redirect("/onboarding");

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Vos <em>données</em></>}
        description="Exportez ou supprimez les données de votre organisation, conformément au RGPD."
      />

      <Card>
        <div className="flex items-start gap-3">
          <Download className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
          <div>
            <CardTitle>Exporter mes données</CardTitle>
            <CardDescription className="mt-1">
              Un fichier JSON contenant l&apos;intégralité du contenu, des prospects et des
              paramètres de « {org.name} ».
            </CardDescription>
          </div>
        </div>
        <ButtonLink href="/api/rgpd/export" variant="secondary" className="mt-4">
          Télécharger l&apos;export
        </ButtonLink>
      </Card>

      {org.role === "owner" ? (
        <Card className="mt-4 border-danger/30">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div>
              <CardTitle>Supprimer l&apos;organisation</CardTitle>
              <CardDescription className="mt-1">
                Supprime définitivement « {org.name} » : contenu, prospects, comptes connectés et
                abonnement associé.
              </CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <DeleteOrganization slug={org.slug} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
