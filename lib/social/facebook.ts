import "server-only";
import type { SocialProvider, TokenSet, PublishInput, PublishResult } from "@/lib/social/types";
import {
  metaAuthorizationUrl,
  exchangeMetaCode,
  fetchFirstManagedPage,
  graphGet,
  graphPost,
} from "@/lib/social/meta-oauth";

const SCOPES = ["pages_manage_posts", "pages_read_engagement", "pages_show_list"];

export const facebookProvider: SocialProvider = {
  network: "facebook",
  available: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),

  getAuthorizationUrl(state, redirectUri) {
    return metaAuthorizationUrl(SCOPES, state, redirectUri);
  },

  async exchangeCodeForToken(code, redirectUri): Promise<TokenSet> {
    const longLived = await exchangeMetaCode(code, redirectUri);
    const page = await fetchFirstManagedPage(longLived.access_token);

    if (!page) {
      throw new Error("Aucune Page Facebook n'est gérée par ce compte.");
    }

    return {
      accessToken: page.access_token,
      externalAccountId: page.id,
      label: page.name,
      expiresAt: new Date(Date.now() + longLived.expires_in * 1000),
    };
  },

  async refreshToken(tokenSet) {
    const valid = await this.validateToken(tokenSet);
    if (!valid) throw new Error("Le jeton Facebook n'est plus valide, reconnexion nécessaire.");
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
    let response: { id: string; post_id?: string };

    if (input.mediaType === "vidéo" && input.mediaUrl) {
      response = await graphPost(`/${tokenSet.externalAccountId}/videos`, {
        file_url: input.mediaUrl,
        description: input.caption,
        access_token: tokenSet.accessToken,
      });
    } else if (input.mediaType === "image" && input.mediaUrl) {
      response = await graphPost(`/${tokenSet.externalAccountId}/photos`, {
        url: input.mediaUrl,
        caption: input.caption,
        access_token: tokenSet.accessToken,
      });
    } else {
      response = await graphPost(`/${tokenSet.externalAccountId}/feed`, {
        message: input.caption,
        access_token: tokenSet.accessToken,
      });
    }

    const id = response.post_id ?? response.id;
    return { externalId: id, externalUrl: `https://www.facebook.com/${id}` };
  },

  validateConstraints(input) {
    const issues: string[] = [];
    if (input.caption.length > 63206) {
      issues.push("Le texte dépasse la limite de caractères de Facebook.");
    }
    return issues;
  },
};
