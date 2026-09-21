import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";

let fakeSupabase: ReturnType<typeof createFakeSupabase>;
const updates: { table: string; patch: Record<string, unknown> }[] = [];

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => fakeSupabase,
}));

const validateConstraints = vi.fn(() => [] as string[]);
const publish = vi.fn();
vi.mock("@/lib/social/registry", () => ({
  getSocialProvider: () => ({ validateConstraints, publish }),
}));

const getValidTokenSet = vi.fn();
vi.mock("@/lib/social/token-helper", () => ({
  getValidTokenSet: (...args: unknown[]) => getValidTokenSet(...args),
}));

vi.mock("@/lib/notifications", () => ({ createNotification: vi.fn() }));
vi.mock("@/lib/org-contact", () => ({ getOrgOwnerEmail: async () => null }));
vi.mock("@/lib/email/resend", () => ({
  sendPublishFailedEmail: vi.fn(),
  sendManualPublishReminderEmail: vi.fn(),
}));

const BASE_TARGET = {
  id: "target-1",
  post_id: "post-1",
  organization_id: "org-1",
  network: "instagram",
  caption_override: null,
  status: "en_attente",
  attempts: 0,
};
const BASE_POST = { title: "Mon post", caption: "Bonjour !", media_asset_id: null };
const BASE_ACCOUNT = { id: "account-1", status: "connecté" };

function setup(overrides: {
  target?: Partial<typeof BASE_TARGET>;
  post?: typeof BASE_POST | null;
  account?: typeof BASE_ACCOUNT | null;
  tokenSet?: unknown;
}) {
  updates.length = 0;
  fakeSupabase = createFakeSupabase({
    tables: {
      post_targets: { data: { ...BASE_TARGET, ...overrides.target } },
      posts: { data: overrides.post === undefined ? BASE_POST : overrides.post },
      social_accounts: { data: overrides.account === undefined ? BASE_ACCOUNT : overrides.account },
    },
    onUpdate: (table, patch) => updates.push({ table, patch }),
  });
}

function lastUpdateFor(table: string) {
  return [...updates].reverse().find((u) => u.table === table)?.patch;
}

describe("attemptPublish (file de publication)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateConstraints.mockReturnValue([]);
  });

  it("publie avec succès et marque la tâche « publié »", async () => {
    getValidTokenSet.mockResolvedValue({ tokenSet: { accessToken: "token" }, accountId: "account-1" });
    publish.mockResolvedValue({ externalId: "ext-1", externalUrl: "https://instagram.com/p/ext-1" });
    setup({});

    const { attemptPublish } = await import("./publish-post-target");
    const result = await attemptPublish("target-1");

    expect(result).toEqual({ done: true });
    const patch = lastUpdateFor("post_targets");
    expect(patch).toMatchObject({ status: "publié", external_id: "ext-1" });
  });

  it("mode sans API : marque la tâche « sans_connexion » sans appeler le fournisseur", async () => {
    setup({ account: null });

    const { attemptPublish } = await import("./publish-post-target");
    await attemptPublish("target-1");

    expect(publish).not.toHaveBeenCalled();
    expect(lastUpdateFor("post_targets")).toMatchObject({ status: "sans_connexion" });
  });

  it("échec temporaire (tentative < max) : relance via une exception pour le backoff Inngest", async () => {
    getValidTokenSet.mockResolvedValue({ tokenSet: { accessToken: "token" }, accountId: "account-1" });
    publish.mockRejectedValue(new Error("Erreur réseau temporaire"));
    setup({ target: { attempts: 0 } });

    const { attemptPublish } = await import("./publish-post-target");
    await expect(attemptPublish("target-1")).rejects.toThrow("Erreur réseau temporaire");

    // Le statut n'est PAS marqué "échec" tant que le nombre max de tentatives
    // n'est pas atteint — seule l'erreur est enregistrée pour affichage.
    const patch = lastUpdateFor("post_targets");
    expect(patch).not.toMatchObject({ status: "échec" });
    expect(patch).toMatchObject({ error: "Erreur réseau temporaire" });
  });

  it("échec définitif après le nombre maximal de tentatives : marque « échec » sans relancer", async () => {
    getValidTokenSet.mockResolvedValue({ tokenSet: { accessToken: "token" }, accountId: "account-1" });
    publish.mockRejectedValue(new Error("Erreur définitive"));
    setup({ target: { attempts: 2 } }); // 3e et dernière tentative (MAX_ATTEMPTS = 3)

    const { attemptPublish } = await import("./publish-post-target");
    const result = await attemptPublish("target-1");

    expect(result).toEqual({ done: true });
    expect(lastUpdateFor("post_targets")).toMatchObject({ status: "échec" });
  });

  it("tâche déjà au nombre maximal de tentatives au départ : abandonne sans appeler le fournisseur", async () => {
    setup({ target: { attempts: 3 } });

    const { attemptPublish } = await import("./publish-post-target");
    const result = await attemptPublish("target-1");

    expect(result).toEqual({ done: true });
    expect(publish).not.toHaveBeenCalled();
    expect(lastUpdateFor("post_targets")).toMatchObject({
      status: "échec",
      error: "Nombre maximal de tentatives atteint.",
    });
  });

  it("compte à reconnecter (jeton invalide) : marque « échec » avec un message explicite", async () => {
    getValidTokenSet.mockResolvedValue(null);
    setup({});

    const { attemptPublish } = await import("./publish-post-target");
    await attemptPublish("target-1");

    expect(publish).not.toHaveBeenCalled();
    expect(lastUpdateFor("post_targets")?.error).toMatch(/reconnecté/);
  });

  it("contraintes du réseau non respectées : marque « échec » sans appeler publish", async () => {
    getValidTokenSet.mockResolvedValue({ tokenSet: { accessToken: "token" }, accountId: "account-1" });
    validateConstraints.mockReturnValue(["Légende trop longue."]);
    setup({});

    const { attemptPublish } = await import("./publish-post-target");
    await attemptPublish("target-1");

    expect(publish).not.toHaveBeenCalled();
    expect(lastUpdateFor("post_targets")).toMatchObject({ status: "échec", error: "Légende trop longue." });
  });

  it("tâche déjà publiée : ne fait rien", async () => {
    setup({ target: { status: "publié" } });

    const { attemptPublish } = await import("./publish-post-target");
    const result = await attemptPublish("target-1");

    expect(result).toEqual({ done: true });
    expect(updates).toHaveLength(0);
  });
});
