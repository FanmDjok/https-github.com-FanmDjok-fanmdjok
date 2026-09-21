import "server-only";
import type {
  SocialProvider,
  TokenSet,
  PublishInput,
  PublishResult,
  InsightsSnapshot,
} from "@/lib/social/types";
import { EMPTY_INSIGHTS } from "@/lib/social/types";
import {
  metaAuthorizationUrl,
  exchangeMetaCode,
  fetchFirstManagedPage,
  graphGet,
  graphPost,
} from "@/lib/social/meta-oauth";

const SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
];

const CAPTION_LIMIT = 2200;

async function waitForContainerReady(creationId: string, accessToken: string) {
  // Les vidéos/reels nécessitent un traitement asynchrone côté Meta avant
  // publication. On patiente jusqu'à 60s en interrogeant le statut.
  for (let attempt = 0; attempt < 12; attempt++) {
    const status = await graphGet<{ status_code: string }>(`/${creationId}`, {
      fields: "status_code",
      access_token: accessToken,
    });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") {
      throw new Error("Le traitement du média a échoué côté Instagram.");
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("Le traitement du média a expiré (délai dépassé).");
}

export const instagramProvider: SocialProvider = {
  network: "instagram",
  available: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),

  getAuthorizationUrl(state, redirectUri) {
    return metaAuthorizationUrl(SCOPES, state, redirectUri);
  },

  async exchangeCodeForToken(code, redirectUri): Promise<TokenSet> {
    const longLived = await exchangeMetaCode(code, redirectUri);
    const page = await fetchFirstManagedPage(longLived.access_token);

    if (!page?.instagram_business_account) {
      throw new Error(
        "Aucun compte Instagram professionnel n'est lié à vos pages Facebook. " +
          "Connectez d'abord votre compte Instagram à une Page Facebook.",
      );
    }

    return {
      accessToken: page.access_token,
      externalAccountId: page.instagram_business_account.id,
      label: page.name,
      expiresAt: new Date(Date.now() + longLived.expires_in * 1000),
      meta: { pageId: page.id },
    };
  },

  async refreshToken(tokenSet) {
    // Les jetons de Page dérivés d'un jeton utilisateur longue durée
    // n'expirent en pratique pas ; on revalide simplement leur validité.
    const valid = await this.validateToken(tokenSet);
    if (!valid) throw new Error("Le jeton Instagram n'est plus valide, reconnexion nécessaire.");
    return tokenSet;
  },

  async validateToken(tokenSet) {
    try {
      await graphGet(`/${tokenSet.externalAccountId}`, {
        fields: "id",
        access_token: tokenSet.accessToken,
      });
      return true;
    } catch {
      return false;
    }
  },

  async publish(tokenSet, input: PublishInput): Promise<PublishResult> {
    if (!input.mediaUrl || !input.mediaType) {
      throw new Error("Instagram exige un média (image ou vidéo).");
    }

    const containerParams: Record<string, string> = {
      caption: input.caption,
      access_token: tokenSet.accessToken,
    };
    if (input.mediaType === "vidéo") {
      containerParams.media_type = "REELS";
      containerParams.video_url = input.mediaUrl;
    } else {
      containerParams.image_url = input.mediaUrl;
    }

    const container = await graphPost<{ id: string }>(
      `/${tokenSet.externalAccountId}/media`,
      containerParams,
    );

    if (input.mediaType === "vidéo") {
      await waitForContainerReady(container.id, tokenSet.accessToken);
    }

    const published = await graphPost<{ id: string }>(
      `/${tokenSet.externalAccountId}/media_publish`,
      { creation_id: container.id, access_token: tokenSet.accessToken },
    );

    const permalink = await graphGet<{ permalink?: string }>(`/${published.id}`, {
      fields: "permalink",
      access_token: tokenSet.accessToken,
    }).catch(() => ({ permalink: undefined }));

    return { externalId: published.id, externalUrl: permalink.permalink };
  },

  validateConstraints(input) {
    const issues: string[] = [];
    if (!input.mediaUrl) issues.push("Instagram exige au moins une image ou une vidéo.");
    if (input.caption.length > CAPTION_LIMIT) {
      issues.push(
        `La légende dépasse ${CAPTION_LIMIT} caractères (${input.caption.length}/${CAPTION_LIMIT}).`,
      );
    }
    return issues;
  },

  async fetchInsights(tokenSet, externalId): Promise<InsightsSnapshot> {
    try {
      const result = await graphGet<{ data: { name: string; values: { value: number }[] }[] }>(
        `/${externalId}/insights`,
        { metric: "reach,likes,comments,shares,saved,plays", access_token: tokenSet.accessToken },
      );
      const byName = Object.fromEntries(
        result.data.map((m) => [m.name, m.values[0]?.value ?? 0]),
      );
      return {
        views: byName.plays ?? byName.reach ?? 0,
        likes: byName.likes ?? 0,
        comments: byName.comments ?? 0,
        shares: byName.shares ?? 0,
        saves: byName.saved ?? 0,
        clicks: 0,
      };
    } catch {
      // Les métriques disponibles varient selon le type de média (Reel,
      // image, carrousel) : un échec ne doit pas bloquer la synchronisation
      // des autres publications.
      return EMPTY_INSIGHTS;
    }
  },
};
