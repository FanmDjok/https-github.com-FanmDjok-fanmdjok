import { createHmac, timingSafeEqual } from "node:crypto";

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

// Vérifie et décode le signed_request envoyé par Meta lors d'une demande de
// suppression de données (callback data_deletion_request de l'app Facebook).
// https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
export function parseMetaSignedRequest(signedRequest: string): { user_id: string } | null {
  const [encodedSig, payload] = signedRequest.split(".");
  if (!encodedSig || !payload) return null;

  const secret = process.env.META_APP_SECRET;
  if (!secret) return null;

  const expectedSig = createHmac("sha256", secret).update(payload).digest();
  const providedSig = base64UrlDecode(encodedSig);

  if (
    expectedSig.length !== providedSig.length ||
    !timingSafeEqual(expectedSig, providedSig)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload).toString("utf8"));
    if (typeof data.user_id !== "string") return null;
    return { user_id: data.user_id };
  } catch {
    return null;
  }
}
