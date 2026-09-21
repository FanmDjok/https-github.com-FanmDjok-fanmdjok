import "server-only";
import type {
  SocialProvider,
  TokenSet,
  PublishInput,
  PublishResult,
  InsightsSnapshot,
} from "@/lib/social/types";
import { EMPTY_INSIGHTS } from "@/lib/social/types";

// TikTok Content Posting API (Direct Post, PULL_FROM_URL). Tant que
// l'application n'a pas passé l'audit TikTok, les publications sont
// forcées en visibilité "SELF_ONLY" par la plateforme elle-même — Growthis
// respecte cette contrainte par défaut plutôt que de la contourner.
// Référence : https://developers.tiktok.com/doc/content-posting-api-get-started
// (non revérifiée en direct dans cet environnement, réseau sortant restreint).

const SCOPES = ["video.publish", "video.upload"];
const API_BASE = "https://open.tiktokapis.com/v2";

export const tiktokProvider: SocialProvider = {
  network: "tiktok",
  available: Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),

  getAuthorizationUrl(state, redirectUri) {
    const params = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      scope: SCOPES.join(","),
      response_type: "code",
      redirect_uri: redirectUri,
      state,
    });
    return `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri): Promise<TokenSet> {
    const res = await fetch(`${API_BASE}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const token = await res.json();
    if (!res.ok || token.error) {
      throw new Error(token?.error_description || "Échec de la connexion TikTok.");
    }

    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      externalAccountId: token.open_id,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    };
  },

  async refreshToken(tokenSet) {
    if (!tokenSet.refreshToken) {
      throw new Error("Aucun jeton de rafraîchissement TikTok disponible, reconnexion nécessaire.");
    }
    const res = await fetch(`${API_BASE}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: tokenSet.refreshToken,
      }),
    });
    const token = await res.json();
    if (!res.ok || token.error) throw new Error("Impossible de rafraîchir le jeton TikTok.");

    return {
      ...tokenSet,
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? tokenSet.refreshToken,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    };
  },

  async validateToken(tokenSet) {
    const res = await fetch(`${API_BASE}/user/info/?fields=open_id`, {
      headers: { Authorization: `Bearer ${tokenSet.accessToken}` },
    });
    return res.ok;
  },

  async publish(tokenSet, input: PublishInput): Promise<PublishResult> {
    if (input.mediaType !== "vidéo" || !input.mediaUrl) {
      throw new Error("TikTok exige une vidéo.");
    }

    const res = await fetch(`${API_BASE}/post/publish/video/init/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenSet.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: {
          title: input.caption,
          // Visibilité forcée par TikTok tant que l'application n'a pas
          // passé son audit de la Content Posting API.
          privacy_level: "SELF_ONLY",
        },
        source_info: { source: "PULL_FROM_URL", video_url: input.mediaUrl },
      }),
    });
    const body = await res.json();
    if (!res.ok || body?.error?.code !== "ok") {
      throw new Error(body?.error?.message || "Échec de l'envoi vers TikTok.");
    }

    return { externalId: body.data.publish_id };
  },

  validateConstraints(input) {
    const issues: string[] = [];
    if (input.mediaType !== "vidéo") issues.push("TikTok exige une vidéo.");
    if (input.caption.length > 150) {
      issues.push(`La légende dépasse 150 caractères (${input.caption.length}/150).`);
    }
    return issues;
  },

  async fetchInsights(tokenSet, externalId): Promise<InsightsSnapshot> {
    try {
      const res = await fetch(`${API_BASE}/video/query/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenSet.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: { video_ids: [externalId] },
        }),
      });
      const body = await res.json();
      const video = body?.data?.videos?.[0];
      if (!res.ok || !video) return EMPTY_INSIGHTS;

      return {
        views: video.view_count ?? 0,
        likes: video.like_count ?? 0,
        comments: video.comment_count ?? 0,
        shares: video.share_count ?? 0,
        saves: 0,
        clicks: 0,
      };
    } catch {
      // Les vidéos publiées avant l'audit TikTok sont privées : les
      // statistiques peuvent être inaccessibles tant que l'audit n'est pas
      // passé.
      return EMPTY_INSIGHTS;
    }
  },
};
