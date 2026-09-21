export const metadata = { title: "Politique de confidentialité — growthis" };

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>Dernière mise à jour : [date]. Cette politique explique quelles données Growthis traite, pourquoi, et comment les faire valoir vos droits.</p>

      <h2>Responsable du traitement</h2>
      <p>
        [Raison sociale], [adresse]. Pour toute question relative à vos données personnelles :
        [email dédié RGPD].
      </p>

      <h2>Données que nous traitons</h2>
      <p>
        <strong>Compte et organisation</strong> : email, nom, mot de passe (géré par Supabase Auth,
        jamais en clair), nom et couleur de votre marque.
        <br />
        <strong>Contenu que vous créez</strong> : positionnement, idées, scripts, carrousels,
        conversations avec le conseiller IA, aimants à prospects.
        <br />
        <strong>Prospects que vous capturez</strong> : nom, email, consentement explicite, source
        (page lien en bio, aimant, réseau d&apos;origine) — ces données vous appartiennent, Growthis
        les héberge pour votre compte.
        <br />
        <strong>Comptes réseaux sociaux</strong> : si vous connectez un compte (Instagram, Facebook,
        TikTok, LinkedIn, YouTube), les jetons d&apos;accès sont chiffrés (AES-256) avant stockage et
        ne sont jamais journalisés en clair.
        <br />
        <strong>Facturation</strong> : gérée entièrement par Stripe. Growthis ne stocke jamais vos
        coordonnées bancaires.
      </p>

      <h2>Pourquoi nous les traitons</h2>
      <p>
        Fournir le service (authentification, sauvegarde de votre contenu), générer du texte via
        l&apos;API Claude d&apos;Anthropic (positionnement, idées, scripts, carrousels, légendes,
        analyses, conseils — jamais de vidéo générée par IA), publier votre contenu sur les réseaux
        que vous connectez, mesurer les statistiques de vos publications, gérer votre abonnement
        (Stripe), et vous envoyer les emails transactionnels nécessaires (Resend).
      </p>

      <h2>Sous-traitants et destinataires</h2>
      <p>
        <strong>Supabase</strong> (base de données, authentification, stockage de fichiers).
        <br />
        <strong>Anthropic</strong> (génération de texte via l&apos;API Claude — le contenu envoyé
        pour génération n&apos;est pas utilisé pour entraîner leurs modèles dans le cadre d&apos;un
        usage API commercial).
        <br />
        <strong>Stripe</strong> (paiements et facturation).
        <br />
        <strong>Resend</strong> (envoi d&apos;emails transactionnels).
        <br />
        <strong>Inngest</strong> (orchestration des tâches de publication programmée).
        <br />
        <strong>Meta, TikTok, LinkedIn, Google</strong> uniquement pour les réseaux que vous
        connectez vous-même, via leurs API officielles — Growthis n&apos;automatise jamais de likes,
        abonnements ou messages privés.
      </p>
      <p>
        Certains de ces sous-traitants peuvent traiter des données en dehors de l&apos;Union
        européenne (notamment aux États-Unis) ; dans ce cas, ce transfert repose sur les clauses
        contractuelles types de la Commission européenne ou un mécanisme équivalent.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Vos données sont conservées tant que votre compte est actif. En cas de suppression de
        compte, vos données sont effacées sous 30 jours, à l&apos;exception des données que la loi
        nous impose de conserver plus longtemps (facturation notamment).
      </p>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
        d&apos;effacement, de portabilité et d&apos;opposition sur vos données. Vous pouvez exporter
        l&apos;intégralité de vos données ou supprimer votre compte directement depuis les
        paramètres de votre organisation, ou nous écrire à [email dédié RGPD]. Vous pouvez aussi
        introduire une réclamation auprès de la CNIL (cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>
        Growthis utilise uniquement des cookies strictement nécessaires au fonctionnement du
        service : session d&apos;authentification, organisation active, protection CSRF lors de la
        connexion à un réseau social, et attribution d&apos;un prospect à la publication dont il
        provient (30 jours). Aucun cookie publicitaire ou de mesure d&apos;audience tiers
        n&apos;est utilisé.
      </p>

      <h2>Suppression des données liées aux réseaux sociaux</h2>
      <p>
        Si une plateforme tierce (par exemple Meta) vous notifie de la suppression de
        l&apos;application Growthis, ou si vous déconnectez un compte depuis Growthis, les jetons
        associés sont immédiatement supprimés de notre base.
      </p>
    </>
  );
}
