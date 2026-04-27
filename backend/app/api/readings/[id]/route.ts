import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    rateLimit({ key: `readings:detail:${user.id}`, limit: 60, windowSec: 60 });

    const { id } = await ctx.params;
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("readings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "Reading not found");
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    rateLimit({ key: `readings:delete:${user.id}`, limit: 30, windowSec: 60 });

    const { id } = await ctx.params;
    const admin = getSupabaseAdmin();

    // Look up the photo path for cleanup
    const { data: reading, error: readErr } = await admin
      .from("readings")
      .select("id, photo_id, palm_photos(storage_path)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (readErr) throw new ApiError(500, "db_error", readErr.message);
    if (!reading) throw new ApiError(404, "not_found", "Reading not found");

    const photoPath = (reading as unknown as { palm_photos?: { storage_path?: string } | null })
      ?.palm_photos?.storage_path;

    const { error: delErr } = await admin
      .from("readings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (delErr) throw new ApiError(500, "db_error", delErr.message);

    if (photoPath) {
      // Best-effort: photo cleanup. Failure here is non-fatal.
      await admin.storage.from("palms").remove([photoPath]).catch(() => {});
      await admin.from("palm_photos").delete().eq("storage_path", photoPath).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
