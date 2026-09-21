import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeSupabase } from "@/test/fake-supabase";
import { encryptToken } from "@/lib/crypto";

// Une clé fixe (32 octets en base64) suffit pour ces tests : le contenu
// chiffré n'a pas besoin de correspondre à une vraie session.
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

const validateToken = vi.fn();
const refreshToken = vi.fn();
vi.mock("@/lib/social/registry", () => ({
  getSocialProvider: () => ({ validateToken, refreshToken }),
}));

const ACCOUNT_ID = "account-1";
const ENCRYPTED_ACCESS = encryptToken("access-actuel");
const ENCRYPTED_REFRESH = encryptToken("refresh-actuel");

function setup(overrides: { onUpdate?: (table: string, patch: Record<string, unknown>) => void } = {}) {
  return createFakeSupabase({
    tables: {
      social_accounts: {
        data: {
          id: ACCOUNT_ID,
          access_token_encrypted: ENCRYPTED_ACCESS,
          refresh_token_encrypted: ENCRYPTED_REFRESH,
          expires_at: null,
          external_account_id: "ext-1",
          meta: {},
        },
      },
    },
    onUpdate: overrides.onUpdate,
  });
}

describe("getValidTokenSet (rafraîchissement de jeton)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renvoie le jeton déchiffré tel quel quand il est encore valide", async () => {
    validateToken.mockResolvedValue(true);
    const supabase = setup();

    const { getValidTokenSet } = await import("./token-helper");
    const result = await getValidTokenSet(supabase as never, "org-1", "instagram");

    expect(result?.tokenSet.accessToken).toBe("access-actuel");
    expect(refreshToken).not.toHaveBeenCalled();
  });

  it("rafraîchit et rechiffre le jeton quand il est expiré, puis le persiste", async () => {
    validateToken.mockResolvedValue(false);
    refreshToken.mockResolvedValue({ accessToken: "nouveau-access", refreshToken: "nouveau-refresh" });

    const updates: { table: string; patch: Record<string, unknown> }[] = [];
    const supabase = setup({ onUpdate: (table, patch) => updates.push({ table, patch }) });

    const { getValidTokenSet } = await import("./token-helper");
    const result = await getValidTokenSet(supabase as never, "org-1", "instagram");

    expect(result?.tokenSet.accessToken).toBe("nouveau-access");
    expect(updates).toHaveLength(1);
    expect(updates[0].table).toBe("social_accounts");
    // Le nouveau jeton est chiffré en base, jamais stocké en clair.
    expect(updates[0].patch.access_token_encrypted).not.toBe("nouveau-access");
    expect(typeof updates[0].patch.access_token_encrypted).toBe("string");
  });

  it("marque le compte « à reconnecter » si le rafraîchissement échoue", async () => {
    validateToken.mockResolvedValue(false);
    refreshToken.mockRejectedValue(new Error("Jeton de rafraîchissement révoqué"));

    const updates: { table: string; patch: Record<string, unknown> }[] = [];
    const supabase = setup({ onUpdate: (table, patch) => updates.push({ table, patch }) });

    const { getValidTokenSet } = await import("./token-helper");
    const result = await getValidTokenSet(supabase as never, "org-1", "instagram");

    expect(result).toBeNull();
    expect(updates).toEqual([{ table: "social_accounts", patch: { status: "à reconnecter" } }]);
  });

  it("renvoie null si aucun compte n'est connecté pour ce réseau", async () => {
    const supabase = createFakeSupabase({ tables: { social_accounts: { data: null } } });

    const { getValidTokenSet } = await import("./token-helper");
    const result = await getValidTokenSet(supabase as never, "org-1", "instagram");

    expect(result).toBeNull();
    expect(validateToken).not.toHaveBeenCalled();
  });
});
