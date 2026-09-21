import type { NetworkId } from "@/lib/networks";

export type TokenSet = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  externalAccountId: string;
  label?: string;
  meta?: Record<string, unknown>;
};

export type PublishInput = {
  caption: string;
  mediaUrl: string | null;
  mediaType: "image" | "vidéo" | null;
  title?: string;
};

export type PublishResult = {
  externalId: string;
  externalUrl?: string;
};

export type InsightsSnapshot = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
};

export interface SocialProvider {
  network: NetworkId;
  available: boolean;
  getAuthorizationUrl(state: string, redirectUri: string): string;
  exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenSet>;
  refreshToken(tokenSet: TokenSet): Promise<TokenSet>;
  validateToken(tokenSet: TokenSet): Promise<boolean>;
  publish(tokenSet: TokenSet, input: PublishInput): Promise<PublishResult>;
  validateConstraints(input: PublishInput): string[];
  // Best-effort : renvoie des zéros plutôt que de lever une erreur si la
  // plateforme refuse (contenu privé pré-audit, permission manquante…),
  // pour ne jamais interrompre la synchronisation des autres publications.
  fetchInsights(tokenSet: TokenSet, externalId: string): Promise<InsightsSnapshot>;
}

export const EMPTY_INSIGHTS: InsightsSnapshot = {
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  clicks: 0,
};
