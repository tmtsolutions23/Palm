import { type NextRequest, NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { generateDailyInsight } from "@/lib/daily-insight";
import { errorResponse } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_SIZE = 100;
const MAX_USERS = 5000;

/**
 * Vercel Cron: runs nightly at 03:00 UTC. Generates today's insight for every
 * paid subscriber who has at least one full reading.
 *
 * Paginates in batches of BATCH_SIZE to avoid Supabase query limits and
 * Vercel Function timeouts. If you exceed MAX_USERS, migrate to a queue-based
 * fan-out (Inngest, QStash, or Vercel Background Functions).
 */
export async function GET(req: NextRequest) {
  try {
    requireCronAuth(req);

    const today = new Date().toISOString().slice(0, 10);
    const admin = getSupabaseAdmin();

    const results = { generated: 0, skipped: 0, failed: 0 };
    let cursor: string | undefined;

    for (;;) {
      let query = admin
        .from("profiles")
        .select("id")
        .in("subscription_status", ["active", "trialing", "lifetime"])
        .order("id", { ascending: true })
        .limit(BATCH_SIZE);

      if (cursor) {
        // Range-based pagination: start after the last ID from the previous batch
        // Supabase .gt on id works for UUIDs (lexicographic order)
        query = query.gt("id", cursor);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;
      if (!profiles || profiles.length === 0) break;

      for (const p of profiles) {
        try {
          await generateDailyInsight({ userId: p.id, forDate: today });
          results.generated += 1;
        } catch (e: unknown) {
          const code = (e as { code?: string })?.code;
          if (code === "no_reading") {
            results.skipped += 1;
          } else {
            results.failed += 1;
            console.error("[daily-insights] failed for user", p.id, e);
          }
        }
      }

      // Safety valve: if we've processed more than MAX_USERS, something is wrong
      if (results.generated + results.skipped + results.failed >= MAX_USERS) {
        console.warn(
          `[daily-insights] processed ${MAX_USERS}+ users — consider migrating to a queue-based approach`,
        );
        break;
      }

      cursor = profiles[profiles.length - 1].id;

      // If we got fewer than BATCH_SIZE, this was the last page
      if (profiles.length < BATCH_SIZE) break;
    }

    return NextResponse.json({ date: today, ...results });
  } catch (err) {
    return errorResponse(err);
  }
}