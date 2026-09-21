import "server-only";
import type { SocialProvider, TokenSet, PublishInput, PublishResult } from "@/lib/social/types";

// LinkedIn — publication sur le profil personnel (w_member_social). La
// publication sur une page entreprise exige le LinkedIn Marketing
// Developer Program (voir README) et n'est pas câblée ici.
// Référence : https://learn.microsoft.com/linkedin/ (non revérifiée en
// direct dans cet environnement, réseau sortant restreint).

const SCOPES = ["openid", "profile", "w_member_social"];
const API_BASE = "https://api.linkedin.com/v2";

async function apiRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      ...init?.headers,
    },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.message || `Erreur LinkedIn (${res.status})`);
  return body as T;
}

export const linkedinProvider: SocialProvider = {
  network: "linkedin",
  available: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),

  getAuthorizationUrl(state, redirectUri) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: SCOPES.join(" "),
      state,
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  },

  async exchangeCodeForToken(code, redirectUri): Promise<TokenSet> {
    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });
    const token = await res.json();
    if (!res.ok) throw new Error(token?.error_description || "Échec de la connexion LinkedIn.");

    const profile = await apiRequest<{ sub: string; name: string }>(
      "/userinfo",
      token.access_token,
    );

    return {
      accessToken: token.access_token,
      externalAccountId: profile.sub,
      label: profile.name,
      expiresAt: new Date(Date.now() + token.expires_in * 1000),
    };
  },

  async refreshToken() {
    throw new Error(
      "LinkedIn ne fournit pas de jeton de rafraîchissement standard : reconnexion manuelle nécessaire.",
    );
  },

  async validateToken(tokenSet) {
    try {
      await apiRequest("/userinfo", tokenSet.accessToken);
      return true;
    } catch {
      return false;
    }
  },

  async publish(tokenSet, input: PublishInput): Promise<PublishResult> {
    const author = `urn:li:person:${tokenSet.externalAccountId}`;

    let media: { asset: string; category: "IMAGE" } | null = null;
    if (input.mediaType === "image" && input.mediaUrl) {
      const register = await apiRequest<{
        value: {
          asset: string;
          uploadMechanism: {
            "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest": { uploadUrl: string };
          };
        };
      }>("/assets?action=registerUpload", tokenSet.accessToken, {
        method: "POST",
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: author,
            serviceRelationships: [
              { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
            ],
          },
        }),
      });

      const imageResponse = await fetch(input.mediaUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const uploadUrl =
        register.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]
          .uploadUrl;

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${tokenSet.accessToken}` },
        body: imageBuffer,
      });

      media = { asset: register.value.asset, category: "IMAGE" };
    }

    const post = await apiRequest<{ id: string }>("/ugcPosts", tokenSet.accessToken, {
      method: "POST",
      body: JSON.stringify({
        author,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: input.caption },
            shareMediaCategory: media ? media.category : "NONE",
            ...(media ? { media: [{ status: "READY", media: media.asset }] } : {}),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    return { externalId: post.id };
  },

  validateConstraints(input) {
    const issues: string[] = [];
    if (input.mediaType === "vidéo") {
      issues.push("La publication vidéo LinkedIn n'est pas encore prise en charge par Growthis.");
    }
    if (input.caption.length > 3000) {
      issues.push("Le texte dépasse la limite de 3000 caractères de LinkedIn.");
    }
    return issues;
  },
};
