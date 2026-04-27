import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, getProfile } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { isPaid } from "@/lib/subscription";
import { fetchPalmAsBase64 } from "@/lib/storage";
import { getAnthropic, VISION_MODEL, computeCostUsd, extractText } from "@/lib/claude";
import {
  COMPATIBILITY_SYSTEM_PROMPT,
  buildCompatibilityUserMessage,
} from "@/lib/prompts/compatibility";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  photo_a_id: z.string().uuid(),
  photo_b_id: z.string().uuid(),
  partner_label: z.string().min(1).max(40),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    await rateLimit({ key: `compat:post:${user.id}`, limit: 5, windowSec: 86400 });

    const profile = await getProfile(user.id);
    if (!isPaid(profile as never)) {
      throw new ApiError(402, "paywall_required", "Compatibility readings are a Pro feature.");
    }

    const body = Body.parse(await req.json());
    const admin = getSupabaseAdmin();

    const { data: photos, error: photosErr } = await admin
      .from("palm_photos")
      .select("id, storage_path")
      .in("id", [body.photo_a_id, body.photo_b_id])
      .eq("user_id", user.id);
    if (photosErr) throw new ApiError(500, "db_error", photosErr.message);
    const a = photos?.find((p) => p.id === body.photo_a_id);
    const b = photos?.find((p) => p.id === body.photo_b_id);
    if (!a || !b) throw new ApiError(404, "photo_not_found", "One or both photos not found");

    const [imgA, imgB] = await Promise.all([
      fetchPalmAsBase64(a.storage_path),
      fetchPalmAsBase64(b.storage_path),
    ]);

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: VISION_MODEL,
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: COMPATIBILITY_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        buildCompatibilityUserMessage({
          imageABase64: imgA.base64,
          imageBBase64: imgB.base64,
          mediaTypeA: imgA.mediaType,
          mediaTypeB: imgB.mediaType,
          ownerLabel: profile.display_name ?? "Person A",
          partnerLabel: body.partner_label,
        }),
      ],
    });

    const text = extractText(message).trim();
    const parsed = safeJson(text);
    if (!parsed) throw new ApiError(502, "ai_parse_error", "AI returned an unparseable response");
    if ("error" in parsed && parsed.error === "no_palm_visible") {
      throw new ApiError(400, "photo_quality_low", parsed.message ?? "Palm not visible");
    }

    const cost = computeCostUsd(VISION_MODEL, message.usage.input_tokens, message.usage.output_tokens);

    const { data: reading, error: insertErr } = await admin
      .from("compatibility_readings")
      .insert({
        owner_user_id: user.id,
        partner_label: body.partner_label,
        photo_a_id: body.photo_a_id,
        photo_b_id: body.photo_b_id,
        reading_jsonb: parsed,
        model_version: VISION_MODEL,
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cost_usd: cost,
      })
      .select()
      .single();
    if (insertErr || !reading) throw new ApiError(500, "db_error", insertErr?.message ?? "Insert failed");

    return NextResponse.json({ id: reading.id, ...parsed, created_at: reading.created_at });
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
