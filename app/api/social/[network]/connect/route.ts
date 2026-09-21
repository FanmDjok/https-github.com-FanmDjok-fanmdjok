import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { getSocialProvider } from "@/lib/social/registry";
import type { NetworkId } from "@/lib/networks";

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

  const { currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (!currentId) {
    return NextResponse.redirect(new URL("/onboarding", origin));
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
