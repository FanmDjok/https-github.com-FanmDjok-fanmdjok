import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PUBLIER_TABS } from "@/lib/nav";
import { formatNumber } from "@/lib/utils";
import { Link2 } from "lucide-react";

export default async function LiensPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  const { data: links } = currentId
    ? await supabase
        .from("tracked_links")
        .select("id, label, target_url, clicks")
        .eq("organization_id", currentId)
        .order("clicks", { ascending: false })
    : { data: [] };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Liens <em>suivis</em></>}
        description="Chaque bouton de votre page lien en bio est un lien suivi. Les liens de publication (UTM, attribution prospect) arrivent avec le module Mesurer."
      />
      <SectionTabs items={PUBLIER_TABS} />

      {links && links.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-secondary">
                <th className="px-4 py-3 font-medium">Libellé</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Clics</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{link.label}</td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-ink-secondary">
                    {link.target_url}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald">{formatNumber(link.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState
          icon={Link2}
          title="Aucun lien suivi pour l'instant"
          description="Ajoutez des boutons à votre page lien en bio pour créer vos premiers liens suivis."
        />
      )}
    </div>
  );
}
