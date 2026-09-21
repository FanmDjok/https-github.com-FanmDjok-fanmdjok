import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ATTRIBUTION_COOKIE = "gr_attr";
const ATTRIBUTION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 jours, fenêtre d'attribution standard

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: targetUrl } = await supabase.rpc("register_link_click", { p_code: code });

  if (!targetUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.redirect(targetUrl);
  // Permet d'attribuer un prospect capturé plus tard sur la page lien en
  // bio (ou un aimant) à la publication qui a généré ce clic.
  response.cookies.set(ATTRIBUTION_COOKIE, code, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ATTRIBUTION_TTL_SECONDS,
    path: "/",
  });
  return response;
}
