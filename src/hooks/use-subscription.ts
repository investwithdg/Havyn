/**
 * Subscription Hook
 * Provides subscription state and feature gating from user profile data
 * Reuses existing useDoc(userRef) data — no additional Firestore listeners
 */

import { useState, useMemo, useCallback } from "react";
import {
  getUserSubscription,
  canAccessFeature,
  isSubscriptionActive,
  type UserSubscription,
  type SubscriptionTier,
  type PremiumFeature,
} from "@/services/subscription-service";

export interface UseSubscriptionReturn {
  subscription: UserSubscription;
  tier: SubscriptionTier;
  isPremium: boolean;
  canAccess: (feature: PremiumFeature) => boolean;
  isLoading: boolean;
  // Paywall state management
  paywallOpen: boolean;
  paywallFeature: PremiumFeature | null;
  triggerPaywall: (feature: PremiumFeature) => void;
  closePaywall: () => void;
}

export function useSubscription(
  userProfile: Record<string, unknown> | null | undefined,
  profileLoading: boolean = false
): UseSubscriptionReturn {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<PremiumFeature | null>(null);

  const subscription = useMemo(
    () => getUserSubscription(userProfile),
    [userProfile]
  );

  const isPremium = useMemo(
    () => subscription.tier === "premium" && isSubscriptionActive(subscription),
    [subscription]
  );

  const canAccess = useCallback(
    (feature: PremiumFeature) => canAccessFeature(subscription.tier, feature),
    [subscription.tier]
  );

  const triggerPaywall = useCallback((feature: PremiumFeature) => {
    setPaywallFeature(feature);
    setPaywallOpen(true);
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallOpen(false);
    setPaywallFeature(null);
  }, []);

  return {
    subscription,
    tier: subscription.tier,
    isPremium,
    canAccess,
    isLoading: profileLoading,
    paywallOpen,
    paywallFeature,
    triggerPaywall,
    closePaywall,
  };
}
