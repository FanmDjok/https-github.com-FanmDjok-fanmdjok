import "server-only";
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "growthis" });

export type PostTargetPublishEvent = {
  name: "post/target.publish";
  data: { postTargetId: string; scheduledAt: string };
};
