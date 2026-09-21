import "server-only";
import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { sendTrialEndingSoonEmail } from "@/lib/email/resend";

// Deux passages quotidiens : repasse en Gratuit les essais Business expirés
// sans abonnement payant, et prévient par email les organisations dont
// l'essai se termine dans 3 jours.
export const expireTrials = inngest.createFunction(
  { id: "expire-trials", triggers: { cron: "0 8,20 * * *" } },
  async ({ step }) => {
    const supabase = createServiceClient();

    const downgraded = await step.run("downgrade-expired", async () => {
      const { data: expired } = await supabase.rpc("organizations_with_expired_trial");
      if (!expired || expired.length === 0) return 0;

      for (const org of expired) {
        await supabase
          .from("organizations")
          .update({ plan: "gratuit", trial_ends_at: null })
          .eq("id", org.id);
      }
      return expired.length;
    });

    const warned = await step.run("warn-ending-soon", async () => {
      const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const windowStart = new Date(in3Days.getTime() - 12 * 60 * 60 * 1000).toISOString();
      const windowEnd = new Date(in3Days.getTime() + 12 * 60 * 60 * 1000).toISOString();

      const { data: endingSoon } = await supabase
        .from("organizations")
        .select("id, name, created_by, trial_ends_at")
        .not("trial_ends_at", "is", null)
        .gte("trial_ends_at", windowStart)
        .lte("trial_ends_at", windowEnd);

      if (!endingSoon || endingSoon.length === 0) return 0;

      for (const org of endingSoon) {
        const { data: authUser } = await supabase.auth.admin.getUserById(org.created_by);
        if (authUser.user?.email) {
          await sendTrialEndingSoonEmail({ to: authUser.user.email, orgName: org.name, daysLeft: 3 });
        }
      }
      return endingSoon.length;
    });

    return { downgraded, warned };
  },
);
