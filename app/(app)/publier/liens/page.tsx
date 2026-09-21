import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card } from "@/components/ui/card";
import { PUBLIER_TABS } from "@/lib/nav";
import { sampleTrackedLinks } from "@/lib/sample-data";
import { formatNumber } from "@/lib/utils";

export default function LiensPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Liens <em>suivis</em></>}
        description="Chaque publication reçoit un lien avec paramètres UTM et identifiant. Vous savez toujours d'où vient un prospect."
      />
      <SectionTabs items={PUBLIER_TABS} />

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-secondary">
              <th className="px-4 py-3 font-medium">Publication</th>
              <th className="px-4 py-3 font-medium">Réseau</th>
              <th className="px-4 py-3 font-medium">Clics</th>
              <th className="px-4 py-3 font-medium">Prospects</th>
            </tr>
          </thead>
          <tbody>
            {sampleTrackedLinks.map((link) => (
              <tr key={link.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink">{link.label}</td>
                <td className="px-4 py-3 text-ink-secondary">{link.network}</td>
                <td className="px-4 py-3 font-mono text-ink">{formatNumber(link.clicks)}</td>
                <td className="px-4 py-3 font-mono text-emerald">{formatNumber(link.leads)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
