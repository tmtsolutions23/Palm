import { type NextRequest, NextResponse } from "next/server";
import { requireUser, getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid } from "@/lib/subscription";
import { generateDailyInsight } from "@/lib/daily-insight";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `daily:get:${user.id}`, limit: 60, windowSec: 60 });

    const profile = await getProfile(user.id);
    if (!isPaid(profile as never)) {
      throw new ApiError(402, "paywall_required", "Daily insights are a Pro feature.");
    }

    const today = new Date().toISOString().slice(0, 10);
    const admin = getSupabaseAdmin();

    const { data: existing, error: readErr } = await admin
      .from("daily_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("for_date", today)
      .maybeSingle();
    if (readErr) throw new ApiError(500, "db_error", readErr.message);

    if (existing) {
      return NextResponse.json(existing);
    }

    // Lazy generation if cron hasn't produced one yet (e.g. brand-new user).
    const created = await generateDailyInsight({ userId: user.id, forDate: today });
    return NextResponse.json(created);
  } catch (err) {
    return errorResponse(err);
  }
}
