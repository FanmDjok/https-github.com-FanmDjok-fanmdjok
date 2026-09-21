"use client";

import { useRef, useState } from "react";
import { ChevronsUpDown, Plus, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OrganizationSummary } from "@/lib/organizations";
import { switchOrganization } from "@/app/(app)/actions";

const PLAN_LABEL: Record<OrganizationSummary["plan"], string> = {
  gratuit: "Gratuit",
  essentiel: "Essentiel",
  business: "Business",
};

export function OrgSwitcher({
  orgs,
  currentOrgId,
}: {
  orgs: OrganizationSummary[];
  currentOrgId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const current = orgs.find((o) => o.id === currentOrgId) ?? orgs[0];

  if (!current) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-2 text-left"
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-emerald-ink"
          style={{ backgroundColor: current.brand_color ?? "#0E8A5F" }}
        >
          {current.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {current.name}
          </span>
          <span className="block text-xs text-ink-secondary">
            {PLAN_LABEL[current.plan]}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-secondary" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-line bg-surface p-1 shadow-sm">
          <form ref={formRef} action={switchOrganization}>
            {orgs.map((org) => (
              <button
                key={org.id}
                type="submit"
                name="orgId"
                value={org.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-ink/5",
                  org.id === current.id ? "text-ink" : "text-ink-secondary",
                )}
              >
                <span className="flex-1 truncate">{org.name}</span>
                {org.id === current.id ? <Check className="h-3.5 w-3.5 text-emerald" /> : null}
              </button>
            ))}
          </form>
          <Link
            href="/onboarding/nouvelle-marque"
            className="mt-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink-secondary hover:bg-ink/5"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter une marque
          </Link>
        </div>
      ) : null}
    </div>
  );
}
