import { ApiError } from "./errors";

/**
 * Upstash Redis rate limiter. Replaces the in-memory version that didn't
 * work across Vercel Function instances.
 *
 * env vars required:
 *   UPSTASH_REDIS_REST_URL  – e.g. https://us1-xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN – Upstash REST token
 *
 * Falls back to an in-memory local limiter when env vars are missing,
 * so `npm run dev` still works without Upstash. Production MUST have
 * Upstash configured.
 */

// ─── Upstash REST-based limiter ────────────────────────────────────────────

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstashRateLimit(opts: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<void> {
  // sliding-window counter via INCR + EXPIRE
  const redisKey = `rl:${opts.key}`;
  const url = `${UPSTASH_URL}/get/${redisKey}`;
  const headers = { Authorization: `Bearer ${UPSTASH_TOKEN}` };

  // Pipeline: INCR + TTL check in one request using Upstash pipeline
  const pipeUrl = `${UPSTASH_URL}/pipeline`;
  const body = [
    ["INCR", redisKey],
    ["EXPIRE", redisKey, String(opts.windowSec)],
  ];

  const res = await fetch(pipeUrl, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // If Upstash fails open, log but don't block requests
    console.error("[rate-limit] Upstash error:", res.status, await res.text());
    return;
  }

  const data = (await res.json()) as Array<{ result: number }>;
  const count = data[0]?.result ?? 0;

  if (count > opts.limit) {
    const retryIn = opts.windowSec;
    throw new ApiError(429, "rate_limited", `Too many requests. Retry in ${retryIn}s.`);
  }
}

// ─── Fallback: in-memory (dev only) ───────────────────────────────────────

interface Entry {
  count: number;
  resetAt: number;
}
const localBuckets = new Map<string, Entry>();

function localRateLimit(opts: {
  key: string;
  limit: number;
  windowSec: number;
}): void {
  const now = Date.now();
  const ttl = opts.windowSec * 1000;
  const entry = localBuckets.get(opts.key);

  if (!entry || entry.resetAt <= now) {
    localBuckets.set(opts.key, { count: 1, resetAt: now + ttl });
    return;
  }

  entry.count += 1;
  if (entry.count > opts.limit) {
    const retryIn = Math.ceil((entry.resetAt - now) / 1000);
    throw new ApiError(429, "rate_limited", `Too many requests. Retry in ${retryIn}s.`);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowSec: number;
}): void | Promise<void> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    return upstashRateLimit(opts);
  }
  if (process.env.NODE_ENV === "production") {
    console.warn("[rate-limit] ⚠️  No Upstash env vars in production — rate limits are local-only!");
  }
  return localRateLimit(opts);
}