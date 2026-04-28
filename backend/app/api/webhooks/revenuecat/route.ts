import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ApiError, errorResponse } from "@/lib/errors";
import type { SubscriptionStatus } from "@/lib/subscription";
import { getBackendEnv } from "@/lib/env/backend";

export const runtime = "nodejs";

/**
 * RevenueCat webhook receiver. Configure in the RevenueCat dashboard with
 * Authorization header set to the value of REVENUECAT_WEBHOOK_AUTH.
 *
 * Optional hardening:
 * - set REVENUECAT_LIFETIME_PRODUCT_IDS to a comma-separated allowlist for exact
 *   lifetime detection, rather than relying on substring matches.
 */
export async function POST(req: NextRequest) {
  try {
    const env = getBackendEnv();
    const auth = req.headers.get("authorization");
    if (auth !== env.REVENUECAT_WEBHOOK_AUTH) {
      throw new ApiError(401, "unauthorized", "Webhook auth failed");
    }

    const payload = (await req.json()) as RevenueCatWebhookPayload;
    const event = payload.event;
    if (!event) throw new ApiError(400, "bad_payload", "Missing event");

    const userId = event.app_user_id;
    if (!userId) throw new ApiError(400, "bad_payload", "Missing app_user_id");

    const admin = getSupabaseAdmin();
    const status = mapEventToStatus(event.type, event, parseLifetimeProductIds(env.REVENUECAT_LIFETIME_PRODUCT_IDS));
    const expiresAt = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;

    const updates: Record<string, unknown> = {
      revenuecat_user_id: userId,
    };
    if (status) updates.subscription_status = status;
    if (event.product_id) updates.subscription_product_id = event.product_id;
    if (expiresAt !== null) updates.subscription_expires_at = expiresAt;

    await admin.from("profiles").update(updates).eq("id", userId);

    await admin.from("subscription_events").insert({
      user_id: userId,
      revenuecat_user_id: userId,
      event_type: event.type,
      product_id: event.product_id ?? null,
      expires_at: expiresAt,
      payload_jsonb: event,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

interface RevenueCatWebhookPayload {
  event?: {
    type: string;
    app_user_id?: string;
    product_id?: string;
    expiration_at_ms?: number;
    period_type?: string;
    [key: string]: unknown;
  };
}

function parseLifetimeProductIds(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function mapEventToStatus(
  type: string,
  event: { period_type?: string; product_id?: string },
  lifetimeProductIds: Set<string>,
): SubscriptionStatus | null {
  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
    case "UNCANCELLATION":
      return event.period_type === "TRIAL" ? "trialing" : "active";
    case "NON_RENEWING_PURCHASE":
      if (event.product_id && lifetimeProductIds.has(event.product_id)) return "lifetime";
      return "active";
    case "CANCELLATION":
    case "EXPIRATION":
      return "cancelled";
    case "BILLING_ISSUE":
      return "billing_issue";
    case "SUBSCRIBER_ALIAS":
    case "TRANSFER":
    case "TEST":
      return null;
    default:
      return null;
  }
}
