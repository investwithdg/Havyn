/**
 * CTA (Call-to-Action) Service
 * Determines contextually relevant CTAs based on user state
 * Pure functions - no UI dependencies
 */

import type { JournalEntry } from "@/lib/types";

export interface CTAConfig {
  text: string;
  action: "start_journal" | "continue_journal" | "view_insights" | "set_goal";
  priority: number; // Higher = more important
  context: string; // Why this CTA is shown
}

export interface UserContext {
  hasCheckedInToday: boolean;
  recentEntry?: JournalEntry | null;
  totalEntries: number;
  lastActiveDate?: Date;
  currentStreak: number;
}

/**
 * Determines the most relevant CTA based on user context
 * Returns single, focused action - never multiple competing CTAs
 */
export function getDynamicCTA(userContext: UserContext): CTAConfig {
  const { hasCheckedInToday, recentEntry, totalEntries, currentStreak } = userContext;

  // Priority 1: First-time user
  if (totalEntries === 0) {
    return {
      text: "Start Your First Journal Entry",
      action: "start_journal",
      priority: 100,
      context: "Welcome! Begin your journaling journey.",
    };
  }

  // Priority 2: Daily check-in not completed
  if (!hasCheckedInToday) {
    return {
      text: "Start Today's Reflection",
      action: "start_journal",
      priority: 90,
      context: "Your daily check-in is waiting.",
    };
  }

  // Priority 3: Milestone celebrations
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    return {
      text: `Celebrate ${currentStreak} Days!`,
      action: "view_insights",
      priority: 80,
      context: "Amazing consistency! See your progress.",
    };
  }

  // Priority 4: Encourage continued engagement
  if (recentEntry && hasCheckedInToday) {
    return {
      text: "Explore Your Journey",
      action: "view_insights",
      priority: 70,
      context: "Reflect on your recent thoughts and patterns.",
    };
  }

  // Priority 5: Re-engagement
  return {
    text: "Continue Your Practice",
    action: "start_journal",
    priority: 60,
    context: "Every entry brings new insights.",
  };
}

/**
 * Determines if CTA should be prominently displayed
 */
export function shouldShowCTA(userContext: UserContext): boolean {
  const cta = getDynamicCTA(userContext);
  return cta.priority >= 70 || !userContext.hasCheckedInToday;
}

/**
 * Gets encouraging messages for different user states
 */
export function getEncouragementMessage(userContext: UserContext): string {
  const { currentStreak, totalEntries, hasCheckedInToday } = userContext;

  if (hasCheckedInToday && currentStreak > 1) {
    return `${currentStreak} day streak! You're building a powerful habit.`;
  }

  if (totalEntries >= 10) {
    return "Your journal is becoming a rich collection of insights.";
  }

  if (totalEntries >= 3) {
    return "You're developing a meaningful practice.";
  }

  return "Every entry is a step toward better self-understanding.";
}
