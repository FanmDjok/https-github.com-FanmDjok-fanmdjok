import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSocialProvider } from "@/lib/social/registry";
import { encryptToken } from "@/lib/crypto";
import type { NetworkId } from "@/lib/networks";

const OAUTH_STATE_COOKIE = "growthis-oauth-state";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ network: string }> },
) {
  const { network } = await params;
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  if (!code || !state) {
    return NextResponse.redirect(new URL("/publier/comptes?error=connexion-annulee", origin));
  }

  const [organizationId, nonce] = state.split(".");
  const cookieNonce = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!organizationId || !nonce || nonce !== cookieNonce) {
    return NextResponse.redirect(new URL("/publier/comptes?error=etat-invalide", origin));
  }

  const provider = getSocialProvider(network as NetworkId);
  if (!provider) {
    return NextResponse.redirect(new URL("/publier/comptes?error=reseau-inconnu", origin));
  }

  const redirectUri = `${origin}/api/social/${network}/callback`;

  try {
    const tokenSet = await provider.exchangeCodeForToken(code, redirectUri);

    const { error } = await supabase.from("social_accounts").upsert(
      {
        organization_id: organizationId,
        network: network as NetworkId,
        external_account_id: tokenSet.externalAccountId,
        label: tokenSet.label ?? null,
        access_token_encrypted: encryptToken(tokenSet.accessToken),
        refresh_token_encrypted: tokenSet.refreshToken ? encryptToken(tokenSet.refreshToken) : null,
        expires_at: tokenSet.expiresAt?.toISOString() ?? null,
        status: "connecté",
        meta: tokenSet.meta ?? {},
        created_by: user.id,
      },
      { onConflict: "organization_id,network" },
    );

    if (error) throw error;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.redirect(
      new URL(`/publier/comptes?error=${encodeURIComponent(message)}`, origin),
    );
  }

  const response = NextResponse.redirect(new URL(`/publier/comptes?connected=${network}`, origin));
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
