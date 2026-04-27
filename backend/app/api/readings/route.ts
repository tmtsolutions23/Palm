import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid } from "@/lib/subscription";
import { fetchPalmAsBase64 } from "@/lib/storage";
import { getAnthropic, VISION_MODEL, computeCostUsd, extractText } from "@/lib/claude";
import { READING_SYSTEM_PROMPT, buildReadingUserMessage } from "@/lib/prompts/reading";
import { pickDemoReading } from "@/lib/demo-reading";

export const runtime = "nodejs";
export const maxDuration = 60;

const PostBody = z.object({
  photo_id: z.string().uuid(),
  hand: z.enum(["left", "right"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `readings:post:${user.id}`, limit: 10, windowSec: 86400 });

    const profile = await getProfile(user.id);
    const body = PostBody.parse(await req.json());

    // Free-tier users receive a curated demo reading with zero AI cost.
    if (!isPaid(profile as never)) {
      const demo = pickDemoReading(user.id);

      const admin = getSupabaseAdmin();
      const { data: photo, error: photoErr } = await admin
        .from("palm_photos")
        .select("id, user_id")
        .eq("id", body.photo_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (photoErr || !photo) {
        throw new ApiError(404, "photo_not_found", "Photo not found");
      }

      const { data: reading, error: insertErr } = await admin
        .from("readings")
        .insert({
          user_id: user.id,
          photo_id: photo.id,
          reading_type: "full",
          lines_jsonb: demo.lines,
          summary: demo.summary,
          model_version: "demo",
          input_tokens: 0,
          output_tokens: 0,
          cost_usd: 0,
        })
        .select()
        .single();
      if (insertErr || !reading) {
        throw new ApiError(500, "db_error", insertErr?.message ?? "Insert failed");
      }

      return NextResponse.json({
        reading_id: reading.id,
        summary: demo.summary,
        lines: demo.lines,
        created_at: reading.created_at,
        is_demo: true,
      });
    }

    // Paid-tier users get a real AI reading.
    const admin = getSupabaseAdmin();
    const { data: photo, error: photoErr } = await admin
      .from("palm_photos")
      .select("id, user_id, storage_path")
      .eq("id", body.photo_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (photoErr || !photo) throw new ApiError(404, "photo_not_found", "Photo not found");

    const { base64, mediaType } = await fetchPalmAsBase64(photo.storage_path);

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
    await rateLimit({ key: `readings:get:${user.id}`, limit: 60, windowSec: 60 });

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
