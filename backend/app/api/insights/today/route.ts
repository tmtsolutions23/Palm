import { type NextRequest, NextResponse } from "next/server";
import { requireUser, getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid } from "@/lib/subscription";
import { generateDailyInsight, getApplicableInsight, shouldGenerateForDate } from "@/lib/daily-insight";

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

    // 2-day insight caching: on even days, fall back to yesterday's insight
    const existing = await getApplicableInsight(admin, user.id, today);
    if (existing) {
      return NextResponse.json(existing);
    }

    // Lazy generation if cron hasn't produced one yet AND today is a generation day.
    // On even days with no yesterday insight, generate anyway so the user isn't stuck.
    if (shouldGenerateForDate(today)) {
      const created = await generateDailyInsight({ userId: user.id, forDate: today });
      return NextResponse.json(created);
    }

    // Even day, no yesterday insight — generate for today as a fallback
    const created = await generateDailyInsight({ userId: user.id, forDate: today });
    return NextResponse.json(created);
  } catch (err) {
    return errorResponse(err);
  }
}
