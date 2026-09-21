import "server-only";
import type { createServiceClient } from "@/lib/supabase/service";
import { getSocialProvider } from "@/lib/social/registry";
import { decryptToken, encryptToken } from "@/lib/crypto";
import type { NetworkId } from "@/lib/networks";
import type { TokenSet } from "@/lib/social/types";

type ServiceClient = ReturnType<typeof createServiceClient>;

// Récupère un jeton valide pour (organisation, réseau), en le rafraîchissant
// si besoin. Renvoie null si aucun compte n'est connecté ou si le
// rafraîchissement échoue (le compte est alors marqué "à reconnecter").
export async function getValidTokenSet(
  supabase: ServiceClient,
  organizationId: string,
  network: NetworkId,
): Promise<{ tokenSet: TokenSet; accountId: string } | null> {
  const { data: account } = await supabase
    .from("social_accounts")
    .select("id, access_token_encrypted, refresh_token_encrypted, expires_at, external_account_id, meta")
    .eq("organization_id", organizationId)
    .eq("network", network)
    .eq("status", "connecté")
    .maybeSingle();

  if (!account) return null;

  const provider = getSocialProvider(network);
  let tokenSet: TokenSet = {
    accessToken: decryptToken(account.access_token_encrypted),
    refreshToken: account.refresh_token_encrypted
      ? decryptToken(account.refresh_token_encrypted)
      : undefined,
    externalAccountId: account.external_account_id,
    expiresAt: account.expires_at ? new Date(account.expires_at) : undefined,
    meta: account.meta as Record<string, unknown>,
  };

  const valid = await provider.validateToken(tokenSet).catch(() => false);
  if (!valid) {
    try {
      tokenSet = await provider.refreshToken(tokenSet);
      await supabase
        .from("social_accounts")
        .update({
          access_token_encrypted: encryptToken(tokenSet.accessToken),
          refresh_token_encrypted: tokenSet.refreshToken
            ? encryptToken(tokenSet.refreshToken)
            : account.refresh_token_encrypted,
          expires_at: tokenSet.expiresAt?.toISOString() ?? null,
        })
        .eq("id", account.id);
    } catch {
      await supabase.from("social_accounts").update({ status: "à reconnecter" }).eq("id", account.id);
      return null;
    }
  }

  return { tokenSet, accountId: account.id };
}
