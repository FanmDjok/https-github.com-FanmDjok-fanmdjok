// Faux client Supabase pour les tests unitaires : couvre le sous-ensemble de
// l'API PostgREST réellement utilisé par le code testé (select/eq/limit/
// maybeSingle/single, update/insert, storage.createSignedUrl, auth.admin).
// N'est pas un mock générique : chaque test configure les données renvoyées
// par table via `tables`, et peut observer les écritures via `onUpdate`/`onInsert`.
type TableResult = { data: unknown; error?: unknown; count?: number | null };

export type FakeSupabaseConfig = {
  tables?: Record<string, TableResult | TableResult[]>;
  rpcs?: Record<string, TableResult>;
  onUpdate?: (table: string, patch: Record<string, unknown>) => void;
  onInsert?: (table: string, row: Record<string, unknown>) => void;
  authUsers?: Record<string, { email: string } | null>;
  storageSignedUrl?: string | null;
};

export function createFakeSupabase(config: FakeSupabaseConfig = {}) {
  const callCounts: Record<string, number> = {};

  function tableResult(table: string): TableResult {
    const entry = config.tables?.[table];
    if (Array.isArray(entry)) {
      const idx = callCounts[table] ?? 0;
      callCounts[table] = idx + 1;
      return entry[Math.min(idx, entry.length - 1)] ?? { data: null };
    }
    return entry ?? { data: null };
  }

  function chain(table: string): unknown {
    const obj = {
      select: () => obj,
      eq: () => obj,
      is: () => obj,
      gte: () => obj,
      lte: () => obj,
      order: () => obj,
      limit: () => obj,
      maybeSingle: async () => tableResult(table),
      single: async () => tableResult(table),
      then: (resolve: (value: TableResult) => void) => resolve(tableResult(table)),
      update: (patch: Record<string, unknown>) => {
        config.onUpdate?.(table, patch);
        return { eq: async () => ({ data: null, error: null }) };
      },
      insert: (row: Record<string, unknown>) => {
        config.onInsert?.(table, row);
        return {
          select: () => ({ single: async () => ({ data: null, error: null }) }),
          then: (resolve: (value: TableResult) => void) => resolve({ data: null, error: null }),
        };
      },
      upsert: (row: Record<string, unknown>) => {
        config.onInsert?.(table, row);
        return { then: (resolve: (value: TableResult) => void) => resolve({ data: null, error: null }) };
      },
      delete: () => ({ eq: async () => ({ data: null, error: null }) }),
    };
    return obj;
  }

  return {
    from: (table: string) => chain(table),
    rpc: async (name: string) => config.rpcs?.[name] ?? { data: null },
    storage: {
      from: () => ({
        createSignedUrl: async () => ({
          data: config.storageSignedUrl ? { signedUrl: config.storageSignedUrl } : null,
        }),
        list: async () => ({ data: [] }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
    auth: {
      admin: {
        getUserById: async (id: string) => ({ data: { user: config.authUsers?.[id] ?? null } }),
      },
    },
  };
}
