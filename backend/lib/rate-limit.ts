import { ApiError } from "./errors";

/**
 * Pluggable rate limiter.
 *
 * Production: backed by Upstash Redis (atomic INCR with TTL — works across
 * regions and Vercel function instances). Triggered when both
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 *
 * Dev fallback: in-memory Map. Sufficient for local dev and very low traffic;
 * NEVER rely on this at scale — Vercel Functions are stateless and run
 * multiple instances, so an in-memory limiter is per-instance only.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Entry>();

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(upstashUrl && upstashToken);

export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<void> {
  if (useUpstash) {
    await rateLimitRedis(opts);
    return;
  }
  rateLimitMemory(opts);
}

function rateLimitMemory(opts: { key: string; limit: number; windowSec: number }): void {
  const now = Date.now();
  const ttl = opts.windowSec * 1000;
  const entry = buckets.get(opts.key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(opts.key, { count: 1, resetAt: now + ttl });
    return;
  }
  entry.count += 1;
  if (entry.count > opts.limit) {
    const retryIn = Math.ceil((entry.resetAt - now) / 1000);
    throw new ApiError(429, "rate_limited", `Too many requests. Retry in ${retryIn}s.`);
  }
}

/**
 * Atomic INCR + EXPIRE on Upstash Redis. We use a single transaction by
 * piping commands so this is safe under concurrency across regions.
 */
async function rateLimitRedis(opts: { key: string; limit: number; windowSec: number }): Promise<void> {
  const k = `rl:${opts.key}`;
  // INCR returns the new value; EXPIRE sets TTL only on first set (NX).
  const res = await fetch(`${upstashUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${upstashToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", k],
      ["EXPIRE", k, String(opts.windowSec), "NX"],
    ]),
  });
  if (!res.ok) {
    // Fail-open: never block a real user because the limiter is down.
    console.warn("[rate-limit] upstash unavailable, fail-open", res.status);
    return;
  }
  const body = (await res.json()) as Array<{ result: number | string }>;
  const count = Number(body[0]?.result ?? 0);
  if (count > opts.limit) {
    throw new ApiError(429, "rate_limited", "Too many requests. Try again shortly.");
  }
}
