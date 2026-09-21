import "server-only";
import type { NetworkId } from "@/lib/networks";
import type { SocialProvider } from "@/lib/social/types";
import { instagramProvider } from "@/lib/social/instagram";
import { facebookProvider } from "@/lib/social/facebook";
import { linkedinProvider } from "@/lib/social/linkedin";
import { tiktokProvider } from "@/lib/social/tiktok";
import { youtubeProvider } from "@/lib/social/youtube";

export const socialProviders: Record<NetworkId, SocialProvider> = {
  instagram: instagramProvider,
  facebook: facebookProvider,
  linkedin: linkedinProvider,
  tiktok: tiktokProvider,
  youtube: youtubeProvider,
};

export function getSocialProvider(network: NetworkId): SocialProvider {
  return socialProviders[network];
}
