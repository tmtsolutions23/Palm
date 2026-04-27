import { type NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generateDailyInsight, shouldGenerateForDate } from "@/lib/daily-insight";
import { sendPushBatch, type PushMessage } from "@/lib/push";
import { errorResponse } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 300;

const PAGE_SIZE = 200;

/**
 * Vercel Cron: runs nightly at 03:00 UTC. Generates today's insight for every
 * active subscriber and dispatches Expo Push notifications in chunks.
 *
 * Insights are valid for 2 days — we only generate on odd calendar days.
 * On even days the cron returns early (no LLM spend).
 * On the read path, even-day requests fall back to yesterday's insight.
 *
 * Scale notes:
 * - Up to ~5,000 paying users this single function call is fine.
 * - Beyond ~5,000, switch to a queue (Inngest, QStash, or Supabase Edge
 *   Cron + workers) to fan out across many parallel workers, and do
 *   per-timezone scheduling so users get pushed at their local
 *   `daily_insight_time` rather than all at once.
 */
export async function GET(req: NextRequest) {
  try {
    requireCronAuth(req);

    const today = new Date().toISOString().slice(0, 10);

    if (!shouldGenerateForDate(today)) {
      return NextResponse.json({
        date: today,
        generated: 0,
        skipped: 0,
        failed: 0,
        pushed: 0,
        push_failed: 0,
        reason: "even_day_cache_reuse",
      });
    }

    const admin = getSupabaseAdmin();

    const results = { generated: 0, skipped: 0, failed: 0, pushed: 0, push_failed: 0 };
    let from = 0;

    while (true) {
      const { data: profiles, error } = await admin
        .from("profiles")
        .select("id, push_token")
        .in("subscription_status", ["active", "trialing", "lifetime"])
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      if (!profiles || profiles.length === 0) break;

      const pushBatch: PushMessage[] = [];

      for (const p of profiles) {
        try {
          const insight = await generateDailyInsight({ userId: p.id, forDate: today });
          results.generated += 1;
          if (p.push_token) {
            pushBatch.push({
              to: p.push_token,
              title: "Today's reading",
              body: truncate(insight.content, 240),
              data: { type: "daily_insight", id: insight.id },
              sound: "default",
            });
          }
        } catch (e: unknown) {
          const code = (e as { code?: string })?.code;
          if (code === "no_reading") {
            results.skipped += 1;
          } else {
            results.failed += 1;
            console.error("[cron] daily insight failed", p.id, e);
          }
        }
      }

      const pushResult = await sendPushBatch(pushBatch);
      results.pushed += pushResult.sent;
      results.push_failed += pushResult.failed;

      if (pushResult.sent > 0) {
        const userIds = profiles.map((p) => p.id);
        await admin
          .from("daily_insights")
          .update({ delivered_at: new Date().toISOString() })
          .eq("for_date", today)
          .in("user_id", userIds)
          .is("delivered_at", null);
      }

      if (pushResult.invalidTokens.length > 0) {
        await admin
          .from("profiles")
          .update({ push_token: null })
          .in("push_token", pushResult.invalidTokens);
      }

      if (profiles.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return NextResponse.json({ date: today, ...results });
  } catch (err) {
    return errorResponse(err);
  }
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}
