import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/organizations";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { orgs, currentId } = await getCurrentOrganizationId(supabase, user.id);
  if (orgs.length === 0) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const userLabel = profile?.full_name || user.email || "Votre compte";

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar orgs={orgs} currentOrgId={currentId} userLabel={userLabel} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
