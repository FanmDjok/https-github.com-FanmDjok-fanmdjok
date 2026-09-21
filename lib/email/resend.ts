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

export async function sendPublishFailedEmail({
  to,
  networkLabel,
  postTitle,
  reason,
}: {
  to: string;
  networkLabel: string;
  postTitle: string;
  reason: string;
}) {
  const resend = getClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Échec de publication sur ${networkLabel}`,
    html: `
      <p>Bonjour,</p>
      <p>La publication « ${escapeHtml(postTitle)} » n'a pas pu être envoyée sur ${escapeHtml(networkLabel)}.</p>
      <p>Raison : ${escapeHtml(reason)}</p>
      <p>Vous pouvez réessayer depuis votre calendrier de publication dans Growthis.</p>
    `,
  });
}

export async function sendManualPublishReminderEmail({
  to,
  networkLabel,
  postTitle,
  caption,
}: {
  to: string;
  networkLabel: string;
  postTitle: string;
  caption: string;
}) {
  const resend = getClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `À publier manuellement sur ${networkLabel} : « ${postTitle} »`,
    html: `
      <p>Bonjour,</p>
      <p>${escapeHtml(networkLabel)} n'est pas connecté à Growthis : c'est l'heure de publier « ${escapeHtml(postTitle)} » vous-même.</p>
      <p>Légende à copier :</p>
      <blockquote>${escapeHtml(caption)}</blockquote>
      <p>Récupérez le média depuis votre médiathèque Growthis, publiez-le, puis confirmez dans l'application.</p>
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
