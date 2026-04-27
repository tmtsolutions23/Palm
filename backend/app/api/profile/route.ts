import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const TimeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM required");

const PatchBody = z.object({
  display_name: z.string().min(1).max(40).optional(),
  birth_date: z.string().date().nullable().optional(),
  push_token: z.string().nullable().optional(),
  daily_insight_time: TimeOfDay.optional(),
  timezone: z.string().min(1).max(64).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `profile:get:${user.id}`, limit: 60, windowSec: 60 });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "Profile not found");
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `profile:patch:${user.id}`, limit: 30, windowSec: 60 });

    const patch = PatchBody.parse(await req.json());
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("profiles")
      .update(patch)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw new ApiError(500, "db_error", error.message);
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
