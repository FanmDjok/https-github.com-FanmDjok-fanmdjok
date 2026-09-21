export const metadata = { title: "Statut de suppression des données — growthis" };

export default async function SuppressionStatutPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <h1 className="font-serif text-2xl text-ink">Demande de suppression prise en compte</h1>
      <p className="mt-3 max-w-sm text-sm text-ink-secondary">
        Votre demande de suppression des données liées à votre compte Facebook/Instagram connecté à
        Growthis a été enregistrée.
      </p>
      {code ? (
        <p className="mt-4 font-mono text-xs text-ink-secondary">Code de confirmation : {code}</p>
      ) : null}
    </div>
  );
}
