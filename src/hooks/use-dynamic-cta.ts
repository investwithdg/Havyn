/**
 * Dynamic CTA Hook
 * Manages contextually relevant call-to-action logic
 * Pure business logic - no UI dependencies
 */

import { useMemo, useEffect, useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { getDynamicCTA, shouldShowCTA, getEncouragementMessage, type UserContext, type CTAConfig } from "@/services/cta-service";
import { hasTodayCheckIn, getRecentCheckIn } from "@/services/daily-check-in";
import type { JournalEntry } from "@/lib/types";
import { toDate, isSameDay, getTodayStart } from "@/lib/date-utils";

export interface UseDynamicCTAReturn {
  // State
  cta: CTAConfig | null;
  encouragement: string;
  isLoading: boolean;
  
  // Computed
  shouldShow: boolean;
  
  // Actions
  refreshCTA: () => Promise<void>;
}

export function useDynamicCTA(entries: JournalEntry[] = []): UseDynamicCTAReturn {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildUserContext = async (): Promise<UserContext | null> => {
    if (!firestore || !user) return null;

    try {
      const [hasCheckedInToday, recentEntry] = await Promise.all([
        hasTodayCheckIn(firestore, user.uid),
        getRecentCheckIn(firestore, user.uid),
      ]);

      const currentStreak = calculateCurrentStreak(entries);

      return {
        hasCheckedInToday,
        recentEntry,
        totalEntries: entries.length,
        currentStreak,
        lastActiveDate: recentEntry?.date ? 
          (recentEntry.date instanceof Date ? recentEntry.date : recentEntry.date.toDate()) : 
          undefined,
      };
    } catch (error) {
      console.error("Error building user context:", error);
      return null;
    }
  };

  const refreshCTA = async () => {
    setIsLoading(true);
    const context = await buildUserContext();
    setUserContext(context);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshCTA();
  }, [firestore, user, entries.length]);

  const cta = useMemo(() => {
    if (!userContext) return null;
    return getDynamicCTA(userContext);
  }, [userContext]);

  const shouldShow = useMemo(() => {
    if (!userContext) return false;
    return shouldShowCTA(userContext);
  }, [userContext]);

  const encouragement = useMemo(() => {
    if (!userContext) return "";
    return getEncouragementMessage(userContext);
  }, [userContext]);

  return {
    cta,
    encouragement,
    isLoading,
    shouldShow,
    refreshCTA,
  };
}

/**
 * Calculates current consecutive day streak
 */
function calculateCurrentStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => {
    return toDate(b.date).getTime() - toDate(a.date).getTime();
  });

  let streak = 0;
  const today = getTodayStart();

  for (let i = 0; i < sortedEntries.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (isSameDay(sortedEntries[i].date, expectedDate)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
