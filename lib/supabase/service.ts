import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Client "service role" : contourne totalement les RLS. Réservé aux tâches
// serveur qui doivent agir pour un visiteur anonyme après des vérifications
// applicatives explicites (capture de prospect, génération de lien signé).
// Ne jamais importer ce fichier depuis un composant client.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
