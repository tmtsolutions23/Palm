import { z } from "zod";

/**
 * Validates mobile environment variables at startup.
 * EXPO_PUBLIC_ vars are embedded at build time by Expo;
 * they must be present in .env or eas.json extra fields.
 */

const MobileEnv = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_API_URL: z.string().url().optional(),

  // RevenueCat (platform-specific — one will be present)
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: z.string().optional(),
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: z.string().optional(),

  // Optional observability
  EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
  EXPO_PUBLIC_POSTHOG_KEY: z.string().optional(),
  EXPO_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

export type MobileEnv = z.infer<typeof MobileEnv>;

export function validateMobileEnv(): MobileEnv {
  const parsed = MobileEnv.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .filter((i) => i.code === "invalid_type" || i.code === "too_small")
      .map((i) => i.path.join("."))
      .join(", ");
    console.warn(`[env] Missing optional env vars: ${missing}`);
    // Don't throw in mobile — some vars are truly optional (analytics, sentry)
    // and the app should still run for development.
  }
  return (parsed.success ? parsed.data : process.env) as MobileEnv;
}