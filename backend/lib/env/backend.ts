import { z } from "zod";

/**
 * Validates backend environment variables at startup.
 * Call validateEnv() once at the top of Next.js entry — if any required
 * var is missing the process exits with a clear message instead of a
 * cryptic runtime error later.
 */

const BackendEnv = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_MODEL_VISION: z.string().min(1).default("claude-sonnet-4-6"),
  ANTHROPIC_MODEL_DAILY: z.string().min(1).default("claude-haiku-4-5-20251001"),

  // RevenueCat
  REVENUECAT_WEBHOOK_AUTH: z.string().min(1),

  // Rate limiting (optional — falls back to in-memory in dev)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Sentry (optional)
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT_BACKEND: z.string().optional(),

  // Resend (optional)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
});

export type BackendEnv = z.infer<typeof BackendEnv>;

export function validateBackendEnv(): BackendEnv {
  const parsed = BackendEnv.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing required env vars: ${missing}`);
  }
  return parsed.data;
}