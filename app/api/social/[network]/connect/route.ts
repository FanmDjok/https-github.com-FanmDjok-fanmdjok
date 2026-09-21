import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getSocialProvider } from "@/lib/social/registry";
import type { NetworkId } from "@/lib/networks";
import { PLAN_LIMITS } from "@/lib/limits";
import { countConnectedSocialAccounts } from "@/lib/usage";

const OAUTH_STATE_COOKIE = "growthis-oauth-state";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ network: string }> },
) {
  const { network } = await params;
  const origin = new URL(request.url).origin;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const { currentId, orgs } = await getCurrentOrganizationId(supabase, user.id);
  const org = orgs.find((o) => o.id === currentId);
  if (!currentId || !org) {
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  const networkLimit = PLAN_LIMITS[org.plan].connectedNetworks;
  if (networkLimit !== null) {
    const connected = await countConnectedSocialAccounts(supabase, currentId);
    if (connected >= networkLimit) {
      const message = encodeURIComponent(
        `Votre formule est limitée à ${networkLimit} réseau(x) connecté(s). Passez à une formule supérieure pour en connecter d'autres.`,
      );
      return NextResponse.redirect(new URL(`/publier/comptes?error=${message}`, origin));
    }
  }

  const provider = getSocialProvider(network as NetworkId);
  if (!provider) {
    return NextResponse.redirect(new URL("/publier/comptes?error=reseau-inconnu", origin));
  }
  if (!provider.available) {
    return NextResponse.redirect(
      new URL(`/publier/comptes?error=indisponible-${network}`, origin),
    );
  }

  const nonce = randomBytes(16).toString("hex");
  const state = `${currentId}.${nonce}`;
  const redirectUri = `${origin}/api/social/${network}/callback`;

  const response = NextResponse.redirect(provider.getAuthorizationUrl(state, redirectUri));
  response.cookies.set(OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
