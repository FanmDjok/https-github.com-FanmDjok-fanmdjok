import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { publishPostTarget } from "@/lib/inngest/functions/publish-post-target";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [publishPostTarget],
});
