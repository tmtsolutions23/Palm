import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Deprecated: the mobile client uses `supabase.auth.signInWithIdToken({
 * provider: 'apple', token: <identityToken> })` directly, which handles Apple
 * identity-token verification, user provisioning, and session minting on the
 * Supabase side. This endpoint exists only as a documented stub.
 *
 * Configure Apple in your Supabase project's Auth settings (Services ID,
 * Team ID, Key ID, and the .p8 private key contents).
 */
export function POST() {
  return NextResponse.json(
    {
      error: "deprecated",
      message:
        "Apple Sign In is handled directly by Supabase via signInWithIdToken on the client.",
    },
    { status: 410 },
  );
}
