import type { NextRequest } from "next/server";
import { getSupabaseAnon, getSupabaseAdmin } from "./supabase-admin";
import { ApiError } from "./errors";
import { getBackendEnv } from "./env/backend";

export interface AuthedUser {
  id: string;
  email: string | null;
}

/**
 * Verify the Supabase JWT from the Authorization header.
 * Throws ApiError 401 on missing/invalid token.
 */
export async function requireUser(req: NextRequest): Promise<AuthedUser> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "missing_auth", "Missing Authorization header");

  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiError(401, "invalid_auth", "Invalid or expired session");
  }

  return { id: data.user.id, email: data.user.email ?? null };
}

/**
 * Load profile row. Auto-creates if missing (handle_new_user trigger should
 * normally cover this, but the trigger can fail silently in dev).
 */
export async function getProfile(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new ApiError(500, "db_error", error.message);
  if (data) return data;

  const { data: created, error: insertErr } = await admin
    .from("profiles")
    .insert({ id: userId })
    .select()
    .single();
  if (insertErr) throw new ApiError(500, "db_error", insertErr.message);
  return created;
}

/** Authorize Vercel cron requests via the platform-issued bearer header. */
export function requireCronAuth(req: NextRequest): void {
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${getBackendEnv().CRON_SECRET}`;
  if (header !== expected) {
    throw new ApiError(401, "unauthorized", "Cron auth failed");
  }
}
