import "server-only";
import { Resend } from "resend";

function getClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "Growthis <bonjour@growthis.io>";

export async function sendLeadMagnetEmail({
  to,
  firstName,
  orgName,
  magnetTitle,
  downloadUrl,
}: {
  to: string;
  firstName: string;
  orgName: string;
  magnetTitle: string;
  downloadUrl: string;
}) {
  const resend = getClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Voici « ${magnetTitle} »`,
    html: `
      <p>Bonjour ${escapeHtml(firstName)},</p>
      <p>Merci pour votre intérêt. Voici le document que vous avez demandé de la part de ${escapeHtml(orgName)} :</p>
      <p><a href="${downloadUrl}">Télécharger « ${escapeHtml(magnetTitle)} »</a></p>
      <p>Ce lien est valable 7 jours.</p>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
