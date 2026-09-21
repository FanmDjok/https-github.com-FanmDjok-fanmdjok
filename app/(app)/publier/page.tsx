import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/nav/section-tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PUBLIER_TABS } from "@/lib/nav";
import { CalendarMonth, NetworkLegend } from "@/components/publier/calendar-month";
import { NetworkStatusRow } from "@/components/publier/network-badges";
import { samplePosts } from "@/lib/sample-data";
import { formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function PublierPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Publier sur tous vos <em>réseaux</em></>}
        description="Un seul éditeur, une publication synchronisée. Glissez une publication pour la reprogrammer."
        actions={
          <ButtonLink href="/publier/editeur" size="sm">
            <Plus className="h-4 w-4" />
            Nouvelle publication
          </ButtonLink>
        }
      />
      <SectionTabs items={PUBLIER_TABS} />

      <div className="mb-4">
        <NetworkLegend />
      </div>

      <CalendarMonth />

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Publications à venir</CardTitle>
            <CardDescription>Suivi en temps réel, réseau par réseau.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-col divide-y divide-line">
          {samplePosts.map((post) => (
            <div key={post.id} className="py-4 first:pt-0 last:pb-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-ink">{post.title}</p>
                <p className="text-xs text-ink-secondary">{formatDateTime(post.scheduledAt)}</p>
              </div>
              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                {post.targets.map((target) => (
                  <NetworkStatusRow
                    key={target.network}
                    network={target.network}
                    status={target.status}
                    error={"error" in target ? target.error : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
