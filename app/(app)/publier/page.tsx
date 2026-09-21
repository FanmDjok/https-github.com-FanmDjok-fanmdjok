import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarMonth, NetworkLegend } from "@/components/publier/calendar-month";
import { NetworkStatusRow } from "@/components/publier/network-badges";
import { formatDateTime } from "@/lib/utils";
import type { NetworkId } from "@/lib/networks";
import type { PostTargetStatus } from "@/components/publier/network-badges";
import { Plus, CalendarClock } from "lucide-react";

type PostWithTargets = {
  id: string;
  title: string;
  created_at: string;
  post_targets: {
    id: string;
    network: NetworkId;
    status: PostTargetStatus;
    scheduled_at: string;
    error: string | null;
    external_url: string | null;
  }[];
};

export default async function PublierPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);

  const { data: posts } = currentId
    ? await supabase
        .from("posts")
        .select(
          "id, title, created_at, post_targets(id, network, status, scheduled_at, error, external_url)",
        )
        .eq("organization_id", currentId)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<PostWithTargets[]>()
    : { data: [] as PostWithTargets[] };

  const calendarPosts = (posts ?? [])
    .filter((p) => p.post_targets.length > 0)
    .map((p) => ({ id: p.id, title: p.title, scheduledAt: p.post_targets[0].scheduled_at }));

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={<>Publier sur tous vos <em>réseaux</em></>}
        description="Un seul éditeur, une publication synchronisée."
        actions={
          <ButtonLink href="/publier/editeur" size="sm">
            <Plus className="h-4 w-4" />
            Nouvelle publication
          </ButtonLink>
        }
      />

      <div className="mb-4">
        <NetworkLegend />
      </div>

      <CalendarMonth posts={calendarPosts} />

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>Publications récentes</CardTitle>
            <CardDescription>Suivi en temps réel, réseau par réseau.</CardDescription>
          </div>
        </CardHeader>
        {posts && posts.length > 0 ? (
          <div className="flex flex-col divide-y divide-line">
            {posts.map((post) => (
              <div key={post.id} className="py-4 first:pt-0 last:pb-0">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{post.title}</p>
                  {post.post_targets[0] ? (
                    <p className="text-xs text-ink-secondary">
                      {formatDateTime(post.post_targets[0].scheduled_at)}
                    </p>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                  {post.post_targets.map((target) => (
                    <NetworkStatusRow
                      key={target.id}
                      targetId={target.id}
                      network={target.network as NetworkId}
                      status={target.status}
                      error={target.error}
                      externalUrl={target.external_url}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            title="Aucune publication pour l'instant"
            description="Créez votre première publication depuis l'éditeur."
          />
        )}
      </Card>
    </div>
  );
}
