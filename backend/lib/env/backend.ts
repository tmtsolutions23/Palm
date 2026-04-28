import { z } from "zod";

const BackendEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_MODEL_VISION: z.string().min(1).default("claude-sonnet-4-6"),
  ANTHROPIC_MODEL_DAILY: z.string().min(1).default("claude-haiku-4-5-20251001"),

  REVENUECAT_WEBHOOK_AUTH: z.string().min(1),
  REVENUECAT_LIFETIME_PRODUCT_IDS: z.string().optional(),
  CRON_SECRET: z.string().min(1),

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT_BACKEND: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
});

export type BackendEnv = z.infer<typeof BackendEnvSchema>;

let cachedEnv: BackendEnv | null = null;

export function getBackendEnv(): BackendEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = BackendEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid backend environment: ${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function validateBackendEnv(): BackendEnv {
  return getBackendEnv();
}
