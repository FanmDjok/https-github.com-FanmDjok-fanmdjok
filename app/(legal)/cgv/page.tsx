export const metadata = { title: "Conditions générales de vente — growthis" };

export default function CgvPage() {
  return (
    <>
      <h1>Conditions générales de vente</h1>
      <p>Dernière mise à jour : [date].</p>

      <h2>1. Formules et tarifs</h2>
      <p>
        Growthis propose trois formules : Gratuit (0 €), Essentiel et Business, facturées
        mensuellement ou annuellement (2 mois offerts en annuel). Les tarifs en vigueur sont
        affichés sur la page Formules et peuvent évoluer, sans effet sur un abonnement déjà en
        cours jusqu&apos;à son renouvellement.
      </p>

      <h2>2. Essai gratuit</h2>
      <p>
        Toute nouvelle organisation bénéficie de 14 jours d&apos;essai de la formule Business, sans
        carte bancaire. Aucun prélèvement n&apos;intervient tant qu&apos;aucune formule payante
        n&apos;a été souscrite explicitement.
      </p>

      <h2>3. Paiement</h2>
      <p>
        Le paiement est traité par Stripe, prestataire de paiement sécurisé. Growthis ne stocke
        jamais vos coordonnées bancaires. L&apos;abonnement est renouvelé automatiquement à chaque
        échéance jusqu&apos;à résiliation.
      </p>

      <h2>4. Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation
        ne s&apos;applique pas une fois le service pleinement exécuté avec l&apos;accord du client
        avant la fin du délai de rétractation. En souscrivant un abonnement payant, vous acceptez
        que l&apos;exécution commence immédiatement.
      </p>

      <h2>5. Résiliation et remboursement</h2>
      <p>
        Vous pouvez résilier votre abonnement à tout moment depuis le portail de facturation ; la
        résiliation prend effet à la fin de la période déjà payée, sans remboursement au prorata
        sauf disposition légale contraire.
      </p>

      <h2>6. Pause d&apos;abonnement</h2>
      <p>
        Une pause de 1 à 3 mois peut être demandée depuis la page Formules : la facturation est
        suspendue pendant cette période et reprend automatiquement à la date choisie, ou peut être
        reprise manuellement à tout moment.
      </p>

      <h2>7. Parrainage</h2>
      <p>
        Chaque organisation dispose d&apos;un code de parrainage personnel. Lorsqu&apos;une
        organisation parrainée souscrit un premier abonnement payant, un mois est offert au parrain
        et au filleul. Cet avantage n&apos;est pas cumulable avec une autre offre promotionnelle sur
        le même mois et ne peut être converti en espèces.
      </p>

      <h2>8. Facturation</h2>
      <p>
        Une facture est émise automatiquement à chaque paiement et disponible depuis le portail de
        facturation Stripe.
      </p>
    </>
  );
}
