import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid, FREE_READING_LIMIT } from "@/lib/subscription";
import { fetchPalmAsBase64 } from "@/lib/storage";
import { getAnthropic, VISION_MODEL, computeCostUsd, extractText } from "@/lib/claude";
import { READING_SYSTEM_PROMPT, buildReadingUserMessage } from "@/lib/prompts/reading";

export const runtime = "nodejs";
export const maxDuration = 60;

const PostBody = z.object({
  photo_id: z.string().uuid(),
  hand: z.enum(["left", "right"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    rateLimit({ key: `readings:post:${user.id}`, limit: 100, windowSec: 86400 });

    const profile = await getProfile(user.id);
    const body = PostBody.parse(await req.json());

    // Free quota gate (check only — increment after successful Claude call so
    // failed photo readings don't burn the user's free reading).
    if (!isPaid(profile as never) && profile.free_readings_used >= FREE_READING_LIMIT) {
      throw new ApiError(402, "paywall_required", "Upgrade to continue reading.");
    }

    // Load photo
    const admin = getSupabaseAdmin();
    const { data: photo, error: photoErr } = await admin
      .from("palm_photos")
      .select("id, user_id, storage_path")
      .eq("id", body.photo_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (photoErr || !photo) throw new ApiError(404, "photo_not_found", "Photo not found");

    const { base64, mediaType } = await fetchPalmAsBase64(photo.storage_path);

    // Call Claude
    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: READING_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        buildReadingUserMessage({
          imageBase64: base64,
          mediaType,
          hand: body.hand,
          displayName: profile.display_name,
        }),
      ],
    });

    const text = extractText(message).trim();
    const parsed = safeJson(text);
    if (!parsed) {
      throw new ApiError(502, "ai_parse_error", "AI returned an unparseable response");
    }
    if ("error" in parsed && parsed.error === "no_palm_visible") {
      // Don't consume free quota for unusable photos
      throw new ApiError(400, "photo_quality_low", parsed.message ?? "Palm not visible");
    }

    const lines = parsed.lines ?? {};
    const summary = parsed.summary ?? "";
    const cost = computeCostUsd(VISION_MODEL, message.usage.input_tokens, message.usage.output_tokens);

    const { data: reading, error: insertErr } = await admin
      .from("readings")
      .insert({
        user_id: user.id,
        photo_id: photo.id,
        reading_type: "full",
        lines_jsonb: lines,
        summary,
        model_version: VISION_MODEL,
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cost_usd: cost,
      })
      .select()
      .single();
    if (insertErr || !reading) throw new ApiError(500, "db_error", insertErr?.message ?? "Insert failed");

    // Successful reading — now consume the free quota for free users.
    if (!isPaid(profile as never)) {
      await admin
        .from("profiles")
        .update({ free_readings_used: profile.free_readings_used + 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      reading_id: reading.id,
      summary,
      lines,
      created_at: reading.created_at,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    rateLimit({ key: `readings:get:${user.id}`, limit: 60, windowSec: 60 });

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10), 100);
    const before = url.searchParams.get("before");

    const admin = getSupabaseAdmin();
    let q = admin
      .from("readings")
      .select("id, reading_type, summary, share_card_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (before) q = q.lt("created_at", before);

    const { data, error } = await q;
    if (error) throw new ApiError(500, "db_error", error.message);
    return NextResponse.json({ readings: data });
  } catch (err) {
    return errorResponse(err);
  }
}

function safeJson(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
