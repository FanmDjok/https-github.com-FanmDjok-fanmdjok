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

export interface SocialProvider {
  network: NetworkId;
  available: boolean;
  getAuthorizationUrl(state: string, redirectUri: string): string;
  exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenSet>;
  refreshToken(tokenSet: TokenSet): Promise<TokenSet>;
  validateToken(tokenSet: TokenSet): Promise<boolean>;
  publish(tokenSet: TokenSet, input: PublishInput): Promise<PublishResult>;
  validateConstraints(input: PublishInput): string[];
}
