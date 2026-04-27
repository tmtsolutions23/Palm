import PostHog from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export const posthog = apiKey
  ? new PostHog(apiKey, { host, captureAppLifecycleEvents: true })
  : null;

/**
 * Canonical event taxonomy. Add new events here, NEVER inline strings in screens —
 * keeps PostHog dashboards consistent.
 */
export const Event = {
  AppOpen: "app_open",
  Signup: "signup",
  ReadingStarted: "reading_started",
  ReadingCompleted: "reading_completed",
  ReadingFailed: "reading_failed",
  PaywallView: "paywall_view",
  PurchaseStarted: "purchase_started",
  PurchaseCompleted: "purchase_completed",
  PurchaseRestored: "purchase_restored",
  CompatibilityStarted: "compatibility_started",
  CompatibilityCompleted: "compatibility_completed",
  DailyOpened: "daily_opened",
  ShareTapped: "share_tapped",
} as const;

export type EventName = (typeof Event)[keyof typeof Event];

export function track(event: EventName, props?: Record<string, unknown>): void {
  posthog?.capture(event, props);
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  posthog?.identify(userId, traits);
}

export function reset(): void {
  posthog?.reset();
}
