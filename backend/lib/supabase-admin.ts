import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminCached: SupabaseClient | null = null;
let anonCached: SupabaseClient | null = null;

/** Service-role Supabase client. Bypasses RLS. Server-only. */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminCached) return adminCached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  adminCached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminCached;
}

/** Anon-key client used to verify a user JWT without elevated privileges. Cached. */
export function getSupabaseAnon(): SupabaseClient {
  if (anonCached) return anonCached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing public Supabase env vars");
  }

  anonCached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonCached;
}