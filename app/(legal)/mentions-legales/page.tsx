export const metadata = { title: "Mentions légales — growthis" };

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p>
        <em>
          Modèle à compléter avant la mise en production avec les informations réelles de
          l&apos;entreprise éditrice (les champs entre crochets sont des exemples).
        </em>
      </p>

      <h2>Éditeur du site</h2>
      <p>
        Growthis est édité par [Raison sociale], [forme juridique], immatriculée au RCS de
        [ville] sous le numéro [SIRET], dont le siège social est situé [adresse complète].
        <br />
        Directeur de la publication : [nom et prénom].
        <br />
        Contact : [email de contact].
      </p>

      <h2>Hébergement</h2>
      <p>
        Application hébergée par Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789,
        États-Unis). Base de données et authentification hébergées par Supabase (des sous-traitants
        opérant, selon la configuration du projet, dans l&apos;Union européenne).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site et de l&apos;application Growthis (textes, marque,
        logo, interfaces) sont protégés par le droit de la propriété intellectuelle. Toute
        reproduction non autorisée est interdite.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question relative à ces mentions légales : [email de contact].
      </p>
    </>
  );
}
