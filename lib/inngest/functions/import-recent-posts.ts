import "server-only";
import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { getValidTokenSet } from "@/lib/social/token-helper";
import { graphGet } from "@/lib/social/meta-oauth";
import type { NetworkId } from "@/lib/networks";

const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

type ImportedPost = {
  externalId: string;
  externalUrl: string | null;
  caption: string;
  publishedAt: string;
};

async function fetchRecentInstagram(accessToken: string, externalAccountId: string) {
  const since = Math.floor(Date.now() / 1000) - NINETY_DAYS_SECONDS;
  const result = await graphGet<{
    data: { id: string; caption?: string; permalink?: string; timestamp: string }[];
  }>(`/${externalAccountId}/media`, {
    fields: "id,caption,permalink,timestamp",
    since: String(since),
    access_token: accessToken,
  });
  return result.data.map<ImportedPost>((m) => ({
    externalId: m.id,
    externalUrl: m.permalink ?? null,
    caption: m.caption ?? "",
    publishedAt: m.timestamp,
  }));
}

async function fetchRecentFacebook(accessToken: string, externalAccountId: string) {
  const since = Math.floor(Date.now() / 1000) - NINETY_DAYS_SECONDS;
  const result = await graphGet<{
    data: { id: string; message?: string; permalink_url?: string; created_time: string }[];
  }>(`/${externalAccountId}/posts`, {
    fields: "id,message,permalink_url,created_time",
    since: String(since),
    access_token: accessToken,
  });
  return result.data.map<ImportedPost>((p) => ({
    externalId: p.id,
    externalUrl: p.permalink_url ?? null,
    caption: p.message ?? "",
    publishedAt: p.created_time,
  }));
}

async function fetchRecentYoutube(accessToken: string) {
  const publishedAfter = new Date(Date.now() - NINETY_DAYS_SECONDS * 1000).toISOString();
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id,snippet&forMine=true&type=video&order=date&publishedAfter=${publishedAfter}&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const body = await res.json();
  if (!res.ok || !body.items) return [];
  return body.items.map((item: { id: { videoId: string }; snippet: { title: string; publishedAt: string } }) => ({
    externalId: item.id.videoId,
    externalUrl: `https://youtube.com/shorts/${item.id.videoId}`,
    caption: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
  })) as ImportedPost[];
}

// LinkedIn et TikTok : lister l'historique des publications exige des scopes
// non demandés dans cette version (r_member_social, video.list) — import non
// disponible pour ces deux réseaux pour l'instant.
async function fetchRecentPosts(network: NetworkId, accessToken: string, externalAccountId: string) {
  switch (network) {
    case "instagram":
      return fetchRecentInstagram(accessToken, externalAccountId);
    case "facebook":
      return fetchRecentFacebook(accessToken, externalAccountId);
    case "youtube":
      return fetchRecentYoutube(accessToken);
    default:
      return [];
  }
}

export const importRecentPosts = inngest.createFunction(
  { id: "import-recent-posts", triggers: { event: "social/account.connected" } },
  async ({ event, step }) => {
    const { organizationId, network, createdBy } = event.data as {
      organizationId: string;
      network: NetworkId;
      createdBy: string;
    };

    await step.run("import", async () => {
      const supabase = createServiceClient();
      const resolved = await getValidTokenSet(supabase, organizationId, network);
      if (!resolved) return { imported: 0 };

      let items: ImportedPost[] = [];
      try {
        items = await fetchRecentPosts(network, resolved.tokenSet.accessToken, resolved.tokenSet.externalAccountId);
      } catch {
        return { imported: 0 };
      }

      let imported = 0;
      for (const item of items) {
        const { data: existing } = await supabase
          .from("post_targets")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("network", network)
          .eq("external_id", item.externalId)
          .maybeSingle();
        if (existing) continue;

        const { data: post } = await supabase
          .from("posts")
          .insert({
            organization_id: organizationId,
            title: item.caption.slice(0, 80) || "Publication importée",
            caption: item.caption,
            created_by: createdBy,
          })
          .select("id")
          .single();
        if (!post) continue;

        await supabase.from("post_targets").insert({
          post_id: post.id,
          organization_id: organizationId,
          network,
          status: "publié",
          scheduled_at: item.publishedAt,
          published_at: item.publishedAt,
          external_id: item.externalId,
          external_url: item.externalUrl,
        });
        imported += 1;
      }

      return { imported };
    });
  },
);
