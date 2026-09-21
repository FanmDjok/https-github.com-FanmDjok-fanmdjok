import { describe, it, expect } from "vitest";
import { PLAN_LIMITS } from "@/lib/limits";
import {
  countConnectedSocialAccounts,
  countLeadMagnets,
  countLeads,
  countPostsThisMonth,
} from "@/lib/usage";

// Le faux client PostgREST ne modélise pas nativement `{ count: "exact" }` ;
// on simule directement la forme de réponse `{ count }` que Supabase renvoie
// pour ce type de requête.
function fakeCountClient(count: number | null) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    gte: () => chain,
    then: (resolve: (v: { count: number | null }) => void) => resolve({ count }),
  };
  return { from: () => chain } as unknown as Parameters<typeof countLeads>[0];
}

describe("PLAN_LIMITS (cohérence des formules)", () => {
  it("la formule Gratuite est strictement plus limitée que Essentiel et Business", () => {
    const g = PLAN_LIMITS.gratuit;
    const e = PLAN_LIMITS.essentiel;
    const b = PLAN_LIMITS.business;

    expect(g.leadMagnets).toBe(0);
    expect(e.leadMagnets).toBe(1);
    expect(b.leadMagnets).toBeNull(); // illimité

    expect(g.connectedNetworks).toBeLessThan(e.connectedNetworks!);
    expect(g.leads).toBeLessThan(e.leads!);
    expect(e.leads).toBeLessThan(b.leads!);
    expect(b.connectedNetworks).toBeNull(); // tous les réseaux
  });
});

describe("compteurs d'usage (lib/usage.ts)", () => {
  it("countLeadMagnets renvoie le compte tel que fourni par PostgREST", async () => {
    const result = await countLeadMagnets(fakeCountClient(1), "org-1");
    expect(result).toBe(1);
  });

  it("countLeads renvoie 0 quand PostgREST renvoie count = null (table vide)", async () => {
    const result = await countLeads(fakeCountClient(null), "org-1");
    expect(result).toBe(0);
  });

  it("countConnectedSocialAccounts reflète le nombre de comptes connectés", async () => {
    const result = await countConnectedSocialAccounts(fakeCountClient(2), "org-1");
    expect(result).toBe(2);
  });

  it("countPostsThisMonth reflète le nombre de publications du mois", async () => {
    const result = await countPostsThisMonth(fakeCountClient(9), "org-1");
    expect(result).toBe(9);
  });
});

describe("logique de blocage aux limites (comme utilisée dans les server actions)", () => {
  function isBlocked(current: number, limit: number | null, additional = 1) {
    return limit !== null && current + additional > limit;
  }

  it("bloque exactement au seuil de la formule", () => {
    expect(isBlocked(24, PLAN_LIMITS.gratuit.leads!)).toBe(false); // 25 après capture, autorisé
    expect(isBlocked(25, PLAN_LIMITS.gratuit.leads!)).toBe(true); // 26e refusé
  });

  it("ne bloque jamais une limite illimitée (null)", () => {
    expect(isBlocked(999_999, PLAN_LIMITS.business.connectedNetworks)).toBe(false);
    expect(isBlocked(999_999, PLAN_LIMITS.business.postsPerMonth)).toBe(false);
  });

  it("même la formule Business a un plafond de prospects (5000)", () => {
    expect(isBlocked(5000, PLAN_LIMITS.business.leads!)).toBe(true);
    expect(isBlocked(4999, PLAN_LIMITS.business.leads!)).toBe(false);
  });

  it("aimants à prospects : formule Gratuite toujours bloquée (limite 0)", () => {
    expect(isBlocked(0, PLAN_LIMITS.gratuit.leadMagnets!)).toBe(true);
  });
});
