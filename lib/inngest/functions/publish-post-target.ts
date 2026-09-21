import "server-only";
import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { getSocialProvider } from "@/lib/social/registry";
import { getValidTokenSet } from "@/lib/social/token-helper";
import { createNotification } from "@/lib/notifications";
import { getOrgOwnerEmail } from "@/lib/org-contact";
import { sendPublishFailedEmail, sendManualPublishReminderEmail } from "@/lib/email/resend";
import { NETWORKS, type NetworkId } from "@/lib/networks";

const MAX_ATTEMPTS = 3;
const MEDIA_SIGNED_URL_TTL = 60 * 60 * 2; // 2 heures — le temps que le réseau récupère le fichier

async function attemptPublish(postTargetId: string) {
  const supabase = createServiceClient();

  const { data: target } = await supabase
    .from("post_targets")
    .select("id, post_id, organization_id, network, caption_override, status, attempts")
    .eq("id", postTargetId)
    .maybeSingle();

  if (!target || target.status === "publié") return { done: true };

  if (target.attempts >= MAX_ATTEMPTS) {
    await supabase
      .from("post_targets")
      .update({ status: "échec", error: "Nombre maximal de tentatives atteint." })
      .eq("id", postTargetId);
    return { done: true };
  }

  const { data: post } = await supabase
    .from("posts")
    .select("title, caption, media_asset_id")
    .eq("id", target.post_id)
    .maybeSingle();
  if (!post) return { done: true };

  const network = target.network as NetworkId;
  const networkLabel = NETWORKS[network].label;
  const caption = target.caption_override ?? post.caption;

  await supabase
    .from("post_targets")
    .update({ status: "en_cours", attempts: target.attempts + 1 })
    .eq("id", postTargetId);

  const ownerEmail = await getOrgOwnerEmail(supabase, target.organization_id);
  const provider = getSocialProvider(network);

  const { data: accountRow } = await supabase
    .from("social_accounts")
    .select("id, status")
    .eq("organization_id", target.organization_id)
    .eq("network", network)
    .maybeSingle();

  if (!accountRow) {
    // Mode sans API : pas de connexion, on prépare le rappel manuel.
    await supabase
      .from("post_targets")
      .update({ status: "sans_connexion", error: null })
      .eq("id", postTargetId);
    await createNotification(
      supabase,
      target.organization_id,
      "sans_api",
      `${networkLabel} n'est pas connecté : publiez « ${post.title} » manuellement.`,
      "/publier",
    );
    if (ownerEmail) {
      await sendManualPublishReminderEmail({
        to: ownerEmail,
        networkLabel,
        postTitle: post.title,
        caption,
      }).catch(() => {});
    }
    return { done: true };
  }

  const resolved = await getValidTokenSet(supabase, target.organization_id, network);
  if (!resolved) {
    await supabase
      .from("post_targets")
      .update({ status: "échec", error: `Le compte ${networkLabel} doit être reconnecté.` })
      .eq("id", postTargetId);
    await createNotification(
      supabase,
      target.organization_id,
      "reconnexion",
      `Votre compte ${networkLabel} doit être reconnecté.`,
      "/publier/comptes",
    );
    if (ownerEmail) {
      await sendPublishFailedEmail({
        to: ownerEmail,
        networkLabel,
        postTitle: post.title,
        reason: "le compte doit être reconnecté",
      }).catch(() => {});
    }
    return { done: true };
  }
  const { tokenSet } = resolved;

  let mediaUrl: string | null = null;
  let mediaType: "image" | "vidéo" | null = null;
  if (post.media_asset_id) {
    const { data: media } = await supabase
      .from("media_assets")
      .select("storage_path, type")
      .eq("id", post.media_asset_id)
      .maybeSingle();
    if (media) {
      const { data: signed } = await supabase.storage
        .from("media")
        .createSignedUrl(media.storage_path, MEDIA_SIGNED_URL_TTL);
      mediaUrl = signed?.signedUrl ?? null;
      mediaType = media.type;
    }
  }

  const input = { caption, mediaUrl, mediaType, title: post.title };
  const issues = provider.validateConstraints(input);
  if (issues.length > 0) {
    await supabase
      .from("post_targets")
      .update({ status: "échec", error: issues.join(" ") })
      .eq("id", postTargetId);
    if (ownerEmail) {
      await sendPublishFailedEmail({
        to: ownerEmail,
        networkLabel,
        postTitle: post.title,
        reason: issues.join(" "),
      }).catch(() => {});
    }
    return { done: true };
  }

  try {
    const result = await provider.publish(tokenSet, input);
    await supabase
      .from("post_targets")
      .update({
        status: "publié",
        external_id: result.externalId,
        external_url: result.externalUrl ?? null,
        error: null,
        published_at: new Date().toISOString(),
      })
      .eq("id", postTargetId);
    return { done: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    await supabase.from("post_targets").update({ error: message }).eq("id", postTargetId);

    if (target.attempts + 1 >= MAX_ATTEMPTS) {
      await supabase.from("post_targets").update({ status: "échec" }).eq("id", postTargetId);
      await createNotification(
        supabase,
        target.organization_id,
        "echec_publication",
        `Échec de publication sur ${networkLabel} : ${message}`,
        "/publier",
      );
      if (ownerEmail) {
        await sendPublishFailedEmail({
          to: ownerEmail,
          networkLabel,
          postTitle: post.title,
          reason: message,
        }).catch(() => {});
      }
      return { done: true };
    }

    // Échec temporaire : on relance via une erreur, Inngest réessaie cette
    // étape avec un délai croissant (backoff exponentiel).
    throw err;
  }
}

export const publishPostTarget = inngest.createFunction(
  { id: "publish-post-target", retries: 3, triggers: { event: "post/target.publish" } },
  async ({ event, step }) => {
    const { postTargetId, scheduledAt } = event.data as {
      postTargetId: string;
      scheduledAt: string;
    };

    await step.sleepUntil("wait-for-schedule", scheduledAt);
    await step.run("publish", () => attemptPublish(postTargetId));
  },
);
