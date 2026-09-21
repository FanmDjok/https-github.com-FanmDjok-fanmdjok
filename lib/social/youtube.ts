import "server-only";
import type { SocialProvider, TokenSet, PublishInput, PublishResult } from "@/lib/social/types";

// YouTube Shorts — YouTube Data API v3. Tant que l'écran de consentement
// OAuth n'est pas vérifié par Google, seuls les comptes de test ajoutés au
// projet Google Cloud peuvent se connecter (voir README).
// Référence : https://developers.google.com/youtube/v3 (non revérifiée en
// direct dans cet environnement, réseau sortant restreint).

const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

export const youtubeProvider: SocialProvider = {
  network: "youtube",
  available: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),

  getAuthorizationUrl(state, redirectUri) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri): Promise<TokenSet> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    });
    const token = await res.json();
    if (!res.ok) throw new Error(token?.error_description || "Échec de la connexion YouTube.");

    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${token.access_token}` } },
    );
    const channel = await channelRes.json();
    const item = channel?.items?.[0];

    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      externalAccountId: item?.id ?? "",
      label: item?.snippet?.title,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    };
  },

  async refreshToken(tokenSet) {
    if (!tokenSet.refreshToken) {
      throw new Error("Aucun jeton de rafraîchissement YouTube disponible, reconnexion nécessaire.");
    }
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokenSet.refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    });
    const token = await res.json();
    if (!res.ok) throw new Error(token?.error_description || "Impossible de rafraîchir le jeton YouTube.");

    return {
      ...tokenSet,
      accessToken: token.access_token,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    };
  },

  async validateToken(tokenSet) {
    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=id&mine=true", {
      headers: { Authorization: `Bearer ${tokenSet.accessToken}` },
    });
    return res.ok;
  },

  async publish(tokenSet, input: PublishInput): Promise<PublishResult> {
    if (input.mediaType !== "vidéo" || !input.mediaUrl) {
      throw new Error("YouTube exige une vidéo.");
    }

    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenSet.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            title: input.title || input.caption.slice(0, 90) || "Short Growthis",
            description: input.caption,
            tags: ["Shorts"],
          },
          status: { privacyStatus: "public" },
        }),
      },
    );

    const uploadUrl = initRes.headers.get("location");
    if (!initRes.ok || !uploadUrl) {
      const error = await initRes.json().catch(() => null);
      throw new Error(error?.error?.message || "Impossible d'initier l'envoi vers YouTube.");
    }

    const videoResponse = await fetch(input.mediaUrl);
    const videoBuffer = await videoResponse.arrayBuffer();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "video/*" },
      body: videoBuffer,
    });
    const uploaded = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploaded?.error?.message || "Échec de l'envoi de la vidéo vers YouTube.");
    }

    return { externalId: uploaded.id, externalUrl: `https://youtube.com/shorts/${uploaded.id}` };
  },

  validateConstraints(input) {
    const issues: string[] = [];
    if (input.mediaType !== "vidéo") issues.push("YouTube exige une vidéo (format Shorts).");
    if (input.caption.length > 5000) issues.push("La description dépasse la limite de YouTube.");
    return issues;
  },
};
