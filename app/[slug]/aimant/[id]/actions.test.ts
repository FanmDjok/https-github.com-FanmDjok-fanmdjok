import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";

let fakeSupabase: ReturnType<typeof createFakeSupabase>;
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: () => fakeSupabase }));

let cookieValue: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (name === "gr_attr" ? { value: cookieValue } : undefined) }),
}));

const sendLeadMagnetEmail = vi.fn();
vi.mock("@/lib/email/resend", () => ({
  sendLeadMagnetEmail: (...args: unknown[]) => sendLeadMagnetEmail(...args),
}));

const MAGNET = {
  id: "magnet-1",
  organization_id: "org-1",
  title: "Guide gratuit",
  org_name: "Atelier Test",
  type: "Guide PDF",
  brand_color: "#0E8A5F",
};

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

function setup(overrides: {
  trackedLink?: { id: string; post_targets: { network: string } | null } | null;
  leadsCount?: number;
  plan?: "gratuit" | "essentiel" | "business";
}) {
  const inserted: Record<string, unknown>[] = [];
  fakeSupabase = createFakeSupabase({
    rpcs: { get_public_lead_magnet: { data: [MAGNET] } },
    tables: {
      organizations: { data: { plan: overrides.plan ?? "essentiel" } },
      tracked_links: { data: overrides.trackedLink === undefined ? null : overrides.trackedLink },
      lead_magnets: { data: { storage_path: "org-1/magnet-1.pdf" } },
      // countLeads lit `{ count }` via un `await` direct sur la requête
      // (pas de .single()/.maybeSingle()) : le champ `count` suffit ici.
      leads: { data: null, count: overrides.leadsCount ?? 0 },
    },
    onInsert: (table, row) => {
      if (table === "leads") inserted.push(row);
    },
    storageSignedUrl: "https://signed.example/document.pdf",
  });
  return inserted;
}

describe("submitLeadCapture (attribution publication → prospect)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieValue = undefined;
  });

  it("rattache le prospect au réseau de la publication quand le cookie d'attribution correspond à un lien suivi", async () => {
    cookieValue = "abc123";
    const inserted = setup({
      trackedLink: { id: "link-1", post_targets: { network: "instagram" } },
      leadsCount: 0,
    });

    const { submitLeadCapture } = await import("./actions");
    const result = await submitLeadCapture(
      "magnet-1",
      formData({ name: "Camille", email: "camille@exemple.fr", consent: "on" }),
    );

    expect(result.success).toBe(true);
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({
      tracked_link_id: "link-1",
      network: "instagram",
      organization_id: "org-1",
    });
  });

  it("n'attribue aucun réseau sans cookie d'attribution (capture directe sur la page lien en bio)", async () => {
    cookieValue = undefined;
    const inserted = setup({ leadsCount: 0 });

    const { submitLeadCapture } = await import("./actions");
    const result = await submitLeadCapture(
      "magnet-1",
      formData({ name: "Camille", email: "camille@exemple.fr", consent: "on" }),
    );

    expect(result.success).toBe(true);
    expect(inserted[0]).toMatchObject({ tracked_link_id: null, network: null });
  });

  it("refuse la capture au-delà de la limite de prospects de la formule", async () => {
    setup({ plan: "gratuit", leadsCount: 25 }); // limite Gratuit = 25

    const { submitLeadCapture } = await import("./actions");
    const result = await submitLeadCapture(
      "magnet-1",
      formData({ name: "Camille", email: "camille@exemple.fr", consent: "on" }),
    );

    expect(result.error).toMatch(/n'accepte plus/);
    expect(sendLeadMagnetEmail).not.toHaveBeenCalled();
  });

  it("refuse la capture sans consentement explicite, avant toute écriture", async () => {
    const inserted = setup({ leadsCount: 0 });

    const { submitLeadCapture } = await import("./actions");
    const result = await submitLeadCapture(
      "magnet-1",
      formData({ name: "Camille", email: "camille@exemple.fr" }),
    );

    expect(result.error).toMatch(/consentement/);
    expect(inserted).toHaveLength(0);
  });
});
