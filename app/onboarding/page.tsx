import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrganizations } from "@/lib/organizations";
import { Logo } from "@/components/ui/logo";
import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orgs = await getUserOrganizations(supabase, user.id);
  if (orgs.length > 0) redirect("/");

  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-10">
      <Logo size="lg" />
      <div className="mt-10 w-full max-w-sm animate-fade-up rounded-2xl border border-line bg-surface p-6">
        <h1 className="font-serif text-2xl text-ink">
          Installons votre <em>atelier</em>
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Une marque = un espace avec son positionnement, ses contenus, ses
          comptes et ses prospects. Vous pourrez en ajouter d&apos;autres
          plus tard.
        </p>
        <div className="mt-6">
          <CreateOrganizationForm />
        </div>
      </div>
    </div>
  );
}
