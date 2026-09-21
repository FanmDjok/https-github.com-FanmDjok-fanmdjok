import { PageHeader } from "@/components/layout/page-header";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Funnel } from "@/components/mesurer/funnel";
import { LeadsChart } from "@/components/mesurer/leads-chart";
import {
  sampleTopContent,
  sampleLeadsByNetwork,
  sampleCoachReading,
} from "@/lib/sample-data";
import { formatNumber } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export default function MesurerPage() {
  const maxNetworkLeads = Math.max(...sampleLeadsByNetwork.map((n) => n.leads));

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Mesurer ce qui <em>rapporte</em></>}
        description="Le parcours complet, du contenu jusqu'au client."
        actions={<Tabs tabs={[{ value: "7", label: "7 j" }, { value: "30", label: "30 j" }, { value: "90", label: "90 j" }]} defaultTab="30" />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parcours de conversion</CardTitle>
          </CardHeader>
          <Funnel />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prospects par semaine</CardTitle>
          </CardHeader>
          <LeadsChart />
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Contenus qui rapportent</CardTitle>
            <CardDescription>Classés par prospects générés.</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-secondary">
                <th className="py-2 pr-4 font-medium">Contenu</th>
                <th className="py-2 pr-4 font-medium">Vues</th>
                <th className="py-2 pr-4 font-medium">Clics</th>
                <th className="py-2 pr-4 font-medium">Prospects</th>
                <th className="py-2 pr-4 font-medium">Taux clic → prospect</th>
                <th className="py-2 font-medium">Clients</th>
              </tr>
            </thead>
            <tbody>
              {sampleTopContent.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="py-3 pr-4 text-ink">{c.title}</td>
                  <td className="py-3 pr-4 font-mono text-ink-secondary">{formatNumber(c.views)}</td>
                  <td className="py-3 pr-4 font-mono text-ink-secondary">{formatNumber(c.clicks)}</td>
                  <td className="py-3 pr-4 font-mono text-emerald">{formatNumber(c.leads)}</td>
                  <td className="py-3 pr-4 font-mono text-ink-secondary">{c.rate}</td>
                  <td className="py-3 font-mono text-ink-secondary">{c.clients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prospects par réseau</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            {sampleLeadsByNetwork.map((n) => (
              <div key={n.network}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink">{n.network}</span>
                  <span className="font-mono text-ink-secondary">{n.leads}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink/5">
                  <div
                    className="h-full rounded-full bg-emerald"
                    style={{ width: `${(n.leads / maxNetworkLeads) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-emerald/30 bg-emerald/[0.04]">
          <CardHeader>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald/10">
              <Sparkles className="h-4 w-4 text-emerald" />
            </div>
          </CardHeader>
          <CardTitle>La lecture de votre conseiller</CardTitle>
          <CardDescription className="mt-2 text-sm text-ink">{sampleCoachReading}</CardDescription>
        </Card>
      </div>
    </div>
  );
}
