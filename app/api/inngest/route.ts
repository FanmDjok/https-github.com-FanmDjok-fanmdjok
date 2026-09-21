import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { publishPostTarget } from "@/lib/inngest/functions/publish-post-target";
import { syncPostMetrics } from "@/lib/inngest/functions/sync-metrics";
import { importRecentPosts } from "@/lib/inngest/functions/import-recent-posts";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishPostTarget, syncPostMetrics, importRecentPosts],
});
