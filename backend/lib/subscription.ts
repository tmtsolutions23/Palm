export type SubscriptionStatus =
  | "free"
  | "trialing"
  | "active"
  | "cancelled"
  | "lifetime"
  | "billing_issue";

/**
 * Returns true if the profile has a paid entitlement for premium features.
 * Cancelled users keep access until subscription_expires_at.
 *
 * Free-tier users receive a static demo reading instead of a real AI call,
 * so there is no longer a free-readings counter or limit.
 */
export function isPaid(profile: {
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
}): boolean {
  if (profile.subscription_status === "lifetime") return true;
  if (profile.subscription_status === "active") return true;
  if (profile.subscription_status === "trialing") return true;
  if (profile.subscription_status === "cancelled" && profile.subscription_expires_at) {
    return new Date(profile.subscription_expires_at).getTime() > Date.now();
  }
  return false;
}
