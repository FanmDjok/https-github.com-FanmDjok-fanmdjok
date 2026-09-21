import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/logo";
import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form";
import { ArrowLeft } from "lucide-react";

export default async function NewOrganizationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-10">
      <Logo size="lg" />
      <div className="mt-10 w-full max-w-sm animate-fade-up rounded-2xl border border-line bg-surface p-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </Link>
        <h1 className="font-serif text-2xl text-ink">
          Une nouvelle <em>marque</em>
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Chaque marque a son propre positionnement, ses comptes, sa page et
          ses prospects. La formule Business permet jusqu&apos;à 3 marques.
        </p>
        <div className="mt-6">
          <CreateOrganizationForm />
        </div>
      </div>
    </div>
  );
}
