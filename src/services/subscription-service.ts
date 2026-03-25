/**
 * Subscription Service
 * Handles subscription tier logic and feature gating
 * Pure functions - no UI dependencies
 */

export type SubscriptionTier = "free" | "premium";

export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";

export interface UserSubscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export const PREMIUM_FEATURES = [
  "unlimited_ai_prompts",
  "ai_coaching_chat",
  "pain_trend_insights",
  "export_journal",
  "advanced_analysis",
] as const;

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: "free",
  status: "active",
};

/**
 * Extracts subscription data from user profile document
 * Returns default free tier if no subscription field exists
 */
export function getUserSubscription(
  userProfileData: Record<string, unknown> | null | undefined
): UserSubscription {
  if (!userProfileData?.subscription) {
    return DEFAULT_SUBSCRIPTION;
  }

  const sub = userProfileData.subscription as Record<string, unknown>;

  return {
    tier: (sub.tier as SubscriptionTier) || "free",
    status: (sub.status as SubscriptionStatus) || "active",
    currentPeriodEnd: sub.currentPeriodEnd
      ? (sub.currentPeriodEnd as { toDate?: () => Date }).toDate?.() ??
        new Date(sub.currentPeriodEnd as string)
      : undefined,
    stripeCustomerId: sub.stripeCustomerId as string | undefined,
    stripeSubscriptionId: sub.stripeSubscriptionId as string | undefined,
  };
}

/**
 * Checks if a feature requires premium access
 */
export function isPremiumFeature(featureName: string): boolean {
  return PREMIUM_FEATURES.includes(featureName as PremiumFeature);
}

/**
 * Determines if a user with the given tier can access a feature
 */
export function canAccessFeature(
  tier: SubscriptionTier,
  featureName: string
): boolean {
  if (!isPremiumFeature(featureName)) return true;
  return tier === "premium";
}

/**
 * Checks if subscription is in an active state (active or trial)
 */
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  return subscription.status === "active" || subscription.status === "trial";
}
