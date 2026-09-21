"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { inngest } from "@/lib/inngest/client";
import { generateStructured } from "@/lib/ai/generate";
import { CaptionAdaptationSchema } from "@/lib/ai/schemas";
import { BRAND_VOICE } from "@/lib/ai/prompts";
import { NETWORKS, type NetworkId } from "@/lib/networks";
import { generateLinkCode } from "@/lib/tracked-links";
import { PLAN_LIMITS } from "@/lib/limits";
import { countPostsThisMonth } from "@/lib/usage";

const NETWORK_TONE: Record<NetworkId, string> = {
  instagram: "Ton chaleureux, quelques hashtags pertinents, légende de longueur moyenne.",
  facebook: "Ton direct et accessible, phrases courtes.",
  tiktok: "Très court (moins de 150 caractères), punchy, sans hashtags superflus.",
  linkedin: "Ton professionnel, structuré, sans emoji, orienté valeur pour l'activité.",
  youtube: "Titre-description clair, orienté recherche, quelques mots-clés.",
};

export async function adaptCaption(
  baseCaption: string,
  network: NetworkId,
): Promise<{ caption?: string; error?: string }> {
  if (!baseCaption.trim()) return { error: "Écrivez d'abord un texte de base." };

  try {
    const result = await generateStructured({
      schema: CaptionAdaptationSchema,
      system: BRAND_VOICE,
      prompt: `Adapte cette légende pour ${NETWORKS[network].label} : "${baseCaption}"

Consigne pour ce réseau : ${NETWORK_TONE[network]}`,
    });
    return { caption: result.caption };
  } catch {
    return { error: "L'adaptation a échoué. Merci de réessayer." };
  }
}

export type CreatePostState = { error?: string } | undefined;

export async function createPost(
  _prev: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Vous devez être connecté." };

  const { currentId, orgs } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) return { error: "Aucune marque sélectionnée." };

  const caption = String(formData.get("caption") ?? "").trim();
  const mediaAssetId = String(formData.get("mediaAssetId") ?? "") || null;
  const scheduleMode = String(formData.get("scheduleMode") ?? "now");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  let networks: { network: NetworkId; caption: string | null }[];
  try {
    networks = JSON.parse(String(formData.get("networks") ?? "[]"));
  } catch {
    return { error: "Les réseaux sélectionnés sont invalides." };
  }

  if (!caption && !mediaAssetId) return { error: "Ajoutez un texte ou un média." };
  if (networks.length === 0) return { error: "Sélectionnez au moins un réseau." };

  const postsLimit = PLAN_LIMITS[org.plan].postsPerMonth;
  if (postsLimit !== null) {
    const alreadyThisMonth = await countPostsThisMonth(supabase, currentId);
    if (alreadyThisMonth + networks.length > postsLimit) {
      return {
        error: `Votre formule est limitée à ${postsLimit} publications programmées par mois. Passez à une formule supérieure pour publier sans limite.`,
      };
    }
  }

  const scheduledAt =
    scheduleMode === "later" && date && time
      ? new Date(`${date}T${time}`).toISOString()
      : new Date().toISOString();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      organization_id: currentId,
      title: caption.slice(0, 80) || "Publication",
      caption,
      media_asset_id: mediaAssetId,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (postError || !post) return { error: "Impossible d'enregistrer la publication." };

  const { data: targets, error: targetsError } = await supabase
    .from("post_targets")
    .insert(
      networks.map((n) => ({
        post_id: post.id,
        organization_id: currentId,
        network: n.network,
        caption_override: n.caption,
        scheduled_at: scheduledAt,
      })),
    )
    .select("id, network");

  if (targetsError || !targets) return { error: "Impossible de programmer les publications." };

  // Chaque publication reçoit un lien de suivi vers la page lien en bio
  // (paramètres UTM + identifiant de publication), pour savoir plus tard
  // de quelle publication vient un prospect.
  const { data: linkPage } = await supabase
    .from("link_pages")
    .select("slug")
    .eq("organization_id", currentId)
    .maybeSingle();

  if (linkPage) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await supabase.from("tracked_links").insert(
      targets.map((t) => ({
        organization_id: currentId,
        code: generateLinkCode(),
        label: `${NETWORKS[t.network as NetworkId].label} — ${post.id.slice(0, 8)}`,
        target_url: `${appUrl}/${linkPage.slug}?utm_source=${t.network}&utm_medium=social&utm_campaign=post-${post.id}`,
        post_target_id: t.id,
      })),
    );
  }

  await Promise.all(
    targets.map((t) =>
      inngest.send({
        name: "post/target.publish",
        data: { postTargetId: t.id, scheduledAt },
      }),
    ),
  );

  redirect("/publier");
}
