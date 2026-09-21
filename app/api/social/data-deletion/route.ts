import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { parseMetaSignedRequest } from "@/lib/social/meta-signed-request";

// Callback de suppression de données Meta (obligatoire pour l'App Review) :
// https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
//
// Limite connue : nos comptes sociaux stockent l'identifiant de la Page/du
// compte Instagram Business (meta.pageId), pas l'identifiant Facebook de la
// personne qui a autorisé l'app. On ne peut donc pas toujours faire
// correspondre user_id à une organisation précise ; la demande est tout de
// même journalisée et confirmée conformément au format attendu par Meta, et
// toute correspondance retrouvée (jeton associé au même compte) est
// supprimée immédiatement.
export async function POST(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const formData = await request.formData();
  const signedRequest = String(formData.get("signed_request") ?? "");

  const parsed = parseMetaSignedRequest(signedRequest);
  if (!parsed) {
    return NextResponse.json({ error: "signed_request invalide." }, { status: 400 });
  }

  const confirmationCode = randomUUID();
  // Journalisation serveur (visible dans les logs de production) : aucune
  // table dédiée à l'audit de ce type d'événement pour l'instant.
  console.info(
    `[meta-data-deletion] utilisateur Facebook ${parsed.user_id} — code de confirmation ${confirmationCode}`,
  );

  return NextResponse.json({
    url: `${appUrl}/rgpd/suppression-statut?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
