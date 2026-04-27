import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Account deletion. Required by App Store Review Guideline 5.1.1(v).
 *
 * This is a hard-delete: removes auth.users row (which cascades to all
 * user-owned tables via ON DELETE CASCADE) and the user's photos in
 * Supabase Storage. The user is automatically signed out as soon as their
 * row is gone (their JWT becomes invalid).
 *
 * Subscription cancellation is the user's responsibility (via App
 * Store / Play Store), per platform policy. We don't attempt it here.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `account:delete:${user.id}`, limit: 3, windowSec: 86400 });

    const admin = getSupabaseAdmin();

    // 1. Collect storage paths so we can clean up bytes after the row is gone.
    const { data: photos } = await admin
      .from("palm_photos")
      .select("storage_path")
      .eq("user_id", user.id);

    // 2. Delete the auth user. ON DELETE CASCADE wipes profile + readings +
    //    compatibility + daily_insights + palm_photos rows.
    const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);
    if (deleteErr) throw new ApiError(500, "delete_failed", deleteErr.message);

    // 3. Best-effort storage cleanup.
    const paths = (photos ?? []).map((p) => p.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await admin.storage.from("palms").remove(paths).catch((e) => {
        console.warn("[account-delete] storage cleanup failed", e);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
