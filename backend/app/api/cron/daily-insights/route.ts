import { type NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generateDailyInsight } from "@/lib/daily-insight";
import { errorResponse } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Vercel Cron: runs nightly at 03:00 UTC. Generates today's insight for every
 * paid subscriber who has at least one full reading. Failures are logged but
 * never block other users.
 *
 * For volume > ~5000 paying users, switch this to a paginated job that fans
 * out to a queue (Inngest, QStash) rather than a single function invocation.
 */
export async function GET(req: NextRequest) {
  try {
    requireCronAuth(req);

    const today = new Date().toISOString().slice(0, 10);
    const admin = getSupabaseAdmin();

    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id")
      .in("subscription_status", ["active", "trialing", "lifetime"]);
    if (error) throw error;

    const results = { generated: 0, skipped: 0, failed: 0 };

    for (const p of profiles ?? []) {
      try {
        await generateDailyInsight({ userId: p.id, forDate: today });
        results.generated += 1;
      } catch (e: unknown) {
        const code = (e as { code?: string })?.code;
        if (code === "no_reading") {
          results.skipped += 1;
        } else {
          results.failed += 1;
          console.error("daily insight failed", p.id, e);
        }
      }
    }

    return NextResponse.json({ date: today, ...results });
  } catch (err) {
    return errorResponse(err);
  }
}
