import "server-only";
import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { getSocialProvider } from "@/lib/social/registry";
import { getValidTokenSet } from "@/lib/social/token-helper";
import type { NetworkId } from "@/lib/networks";

// Synchronise les statistiques des publications déjà envoyées : toutes les
// 6h pendant les 7 premiers jours, puis une fois par jour (voir la fonction
// SQL post_targets_due_for_sync). Chaque publication est indépendante :
// l'échec d'une API ne bloque pas les autres.
export const syncPostMetrics = inngest.createFunction(
  { id: "sync-post-metrics", triggers: { cron: "0 */6 * * *" } },
  async ({ step }) => {
    const supabase = createServiceClient();

    const { data: due } = await supabase.rpc("post_targets_due_for_sync");
    if (!due || due.length === 0) return { synced: 0 };

    let synced = 0;
    for (const target of due) {
      await step.run(`sync-${target.id}`, async () => {
        if (!target.external_id) return;

        const network = target.network as NetworkId;
        const resolved = await getValidTokenSet(supabase, target.organization_id, network);
        if (!resolved) return;

        const provider = getSocialProvider(network);
        const insights = await provider.fetchInsights(resolved.tokenSet, target.external_id!);

        await supabase.from("post_metrics").insert({
          post_target_id: target.id,
          organization_id: target.organization_id,
          ...insights,
        });

        await supabase
          .from("post_targets")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", target.id);
      });
      synced += 1;
    }

    return { synced };
  },
);
