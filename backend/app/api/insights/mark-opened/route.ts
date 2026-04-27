import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({ id: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `daily:mark:${user.id}`, limit: 60, windowSec: 60 });

    const { id } = Body.parse(await req.json());
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("daily_insights")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new ApiError(500, "db_error", error.message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
