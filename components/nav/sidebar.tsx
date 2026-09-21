"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { Logo } from "@/components/ui/logo";
import { OrgSwitcher } from "@/components/nav/org-switcher";
import type { OrganizationSummary } from "@/lib/organizations";
import { signOut } from "@/app/auth/actions";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function Sidebar({
  orgs,
  currentOrgId,
  userLabel,
}: {
  orgs: OrganizationSummary[];
  currentOrgId: string | null;
  userLabel: string;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
      <Link href="/" className="px-2">
        <Logo />
      </Link>

      <div className="mt-6">
        <OrgSwitcher orgs={orgs} currentOrgId={currentOrgId} />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald/10 text-emerald"
                  : "text-ink-secondary hover:bg-ink/5 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
        <span className="truncate text-sm text-ink-secondary">{userLabel}</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-ink-secondary hover:text-ink"
            aria-label="Changer de thème"
            title={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <form action={signOut}>
            <button
              type="submit"
              className="text-ink-secondary hover:text-ink"
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
