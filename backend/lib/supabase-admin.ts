import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getBackendEnv } from "@/lib/env/backend";

let adminCached: SupabaseClient | null = null;
let anonCached: SupabaseClient | null = null;

/** Service-role Supabase client. Bypasses RLS. Server-only. */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminCached) return adminCached;

  const env = getBackendEnv();
  adminCached = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminCached;
}

/** Anon-key client used to verify a user JWT without elevated privileges. Cached. */
export function getSupabaseAnon(): SupabaseClient {
  if (anonCached) return anonCached;

  const env = getBackendEnv();
  anonCached = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonCached;
}
