import { type NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { cleanupPalmPhotoIfUnreferenced } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `compat:detail:${user.id}`, limit: 60, windowSec: 60 });

    const { id } = await ctx.params;
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("compatibility_readings")
      .select("*")
      .eq("id", id)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "Compatibility reading not found");

    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `compat:delete:${user.id}`, limit: 30, windowSec: 60 });

    const { id } = await ctx.params;
    const admin = getSupabaseAdmin();
    const { data: reading, error: readErr } = await admin
      .from("compatibility_readings")
      .select("id, photo_a_id, photo_b_id")
      .eq("id", id)
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (readErr) throw new ApiError(500, "db_error", readErr.message);
    if (!reading) throw new ApiError(404, "not_found", "Compatibility reading not found");

    const { error: delErr } = await admin
      .from("compatibility_readings")
      .delete()
      .eq("id", id)
      .eq("owner_user_id", user.id);
    if (delErr) throw new ApiError(500, "db_error", delErr.message);

    await Promise.all([
      cleanupPalmPhotoIfUnreferenced(reading.photo_a_id),
      cleanupPalmPhotoIfUnreferenced(reading.photo_b_id),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
