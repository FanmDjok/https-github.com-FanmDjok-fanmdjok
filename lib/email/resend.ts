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

export async function sendWelcomeEmail({ to, fullName }: { to: string; fullName: string }) {
  const resend = getClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bienvenue dans votre atelier Growthis",
    html: `
      <p>Bonjour ${escapeHtml(fullName)},</p>
      <p>Votre atelier Growthis est prêt. Vous démarrez avec 14 jours d'essai de la formule Business, sans carte bancaire.</p>
      <p>Première étape : définissez votre positionnement dans Attirer, puis générez vos premières idées de contenu.</p>
      <p>À très vite,<br />L'équipe Growthis</p>
    `,
  });
}

export async function sendTrialEndingSoonEmail({
  to,
  orgName,
  daysLeft,
}: {
  to: string;
  orgName: string;
  daysLeft: number;
}) {
  const resend = getClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Votre essai Business se termine dans ${daysLeft} jours`,
    html: `
      <p>Bonjour,</p>
      <p>L'essai Business de ${escapeHtml(orgName)} se termine dans ${daysLeft} jours. Passé ce délai, votre organisation repasse automatiquement en formule Gratuite, sans perte de données.</p>
      <p>Pour continuer sans interruption, choisissez une formule payante depuis la page Formules.</p>
    `,
  });
}

export async function sendPaymentFailedEmail({ to, orgName }: { to: string; orgName: string }) {
  const resend = getClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Échec du paiement de votre abonnement Growthis",
    html: `
      <p>Bonjour,</p>
      <p>Le dernier paiement de l'abonnement de ${escapeHtml(orgName)} a échoué.</p>
      <p>Mettez à jour votre moyen de paiement depuis la page Formules pour éviter une interruption de service.</p>
    `,
  });
}

export async function sendReferralRewardEmail({ to, orgName }: { to: string; orgName: string }) {
  const resend = getClient();
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Un mois offert grâce à votre parrainage",
    html: `
      <p>Bonjour,</p>
      <p>La personne que vous avez parrainée vient de s'abonner à Growthis : un mois est offert sur l'abonnement de ${escapeHtml(orgName)}.</p>
      <p>Merci de faire connaître Growthis autour de vous.</p>
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
