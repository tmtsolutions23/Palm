import { getSupabaseAdmin } from "./supabase-admin";
import { ApiError } from "./errors";
import { getAnthropic, DAILY_MODEL, computeCostUsd, extractText } from "./claude";
import { DAILY_SYSTEM_PROMPT, buildDailyUserMessage } from "./prompts/daily";
import { getProfile } from "./auth";

/**
 * Generate one daily insight for one user on one date. Idempotent on
 * (user_id, for_date) — second call returns the existing row.
 */
export async function generateDailyInsight(args: {
  userId: string;
  forDate: string;
}): Promise<{
  id: string;
  user_id: string;
  for_date: string;
  content: string;
  delivered_at: string | null;
  opened_at: string | null;
  created_at: string;
}> {
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("daily_insights")
    .select("*")
    .eq("user_id", args.userId)
    .eq("for_date", args.forDate)
    .maybeSingle();
  if (existing) return existing as never;

  // Most-recent full reading is the personalization seed
  const { data: lastReading } = await admin
    .from("readings")
    .select("summary, lines_jsonb")
    .eq("user_id", args.userId)
    .eq("reading_type", "full")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastReading) {
    throw new ApiError(
      400,
      "no_reading",
      "Take a palm reading first to unlock daily insights.",
    );
  }

  // Last 5 insights to avoid repetition
  const { data: recent } = await admin
    .from("daily_insights")
    .select("content")
    .eq("user_id", args.userId)
    .order("for_date", { ascending: false })
    .limit(5);

  const profile = await getProfile(args.userId);
  const lines = (lastReading.lines_jsonb ?? {}) as {
    life?: string;
    heart?: string;
    head?: string;
    fate?: string;
  };

  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: DAILY_MODEL,
    max_tokens: 200,
    system: [
      { type: "text", text: DAILY_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      buildDailyUserMessage({
        forDate: args.forDate,
        displayName: profile.display_name,
        recentSummary: lastReading.summary ?? "",
        recentLines: {
          life: lines.life ?? "",
          heart: lines.heart ?? "",
          head: lines.head ?? "",
          fate: lines.fate ?? "",
        },
        recentInsights: recent?.map((r) => r.content) ?? [],
      }),
    ],
  });

  const content = extractText(message).trim();
  const cost = computeCostUsd(DAILY_MODEL, message.usage.input_tokens, message.usage.output_tokens);

  const { data: inserted, error: insertErr } = await admin
    .from("daily_insights")
    .insert({
      user_id: args.userId,
      for_date: args.forDate,
      content,
    })
    .select()
    .single();
  if (insertErr || !inserted) {
    throw new ApiError(500, "db_error", insertErr?.message ?? "Failed to insert insight");
  }

  // Telemetry: record cost on the readings table is not appropriate; for now
  // we drop daily costs (cheap model, low value for per-row tracking).
  void cost;

  return inserted as never;
}
