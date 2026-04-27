import { ApiError } from "./errors";

/**
 * Simple in-memory rate limiter for MVP. Replace with Vercel KV / Upstash
 * before scaling beyond a single region — Vercel Functions don't share memory.
 *
 * For now, the highest-cost endpoint (POST /api/readings) is also gated by
 * subscription_status server-side, so a stampede is bounded by paying users.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Entry>();

export function rateLimit(opts: { key: string; limit: number; windowSec: number }): void {
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
