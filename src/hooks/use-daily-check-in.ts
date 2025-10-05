/**
 * Daily Check-In Hook
 * Encapsulates all business logic for daily check-ins
 * Provides clean interface to components
 */

import { useState, useCallback, useMemo } from "react";
import { useFirestore, useUser } from "@/firebase";
import { recordDailyCheckIn, hasTodayCheckIn, type CheckInData } from "@/services/daily-check-in";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "@/lib/ui-utils";

export interface UseDailyCheckInReturn {
  // State
  isSubmitting: boolean;
  hasCheckedInToday: boolean | null; // null = loading
  
  // Actions
  submitCheckIn: (data: CheckInData) => Promise<boolean>;
  checkTodayStatus: () => Promise<void>;
  
  // Computed
  canCheckIn: boolean;
}

export function useDailyCheckIn(): UseDailyCheckInReturn {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean | null>(null);

  const checkTodayStatus = useCallback(async () => {
    if (!firestore || !user) return;
    
    try {
      const hasEntry = await hasTodayCheckIn(firestore, user.uid);
      setHasCheckedInToday(hasEntry);
    } catch (error) {
      console.error("Error checking today's status:", error);
      setHasCheckedInToday(false);
    }
  }, [firestore, user]);

  const submitCheckIn = useCallback(async (data: CheckInData): Promise<boolean> => {
    if (!firestore || !user || isSubmitting) return false;

    setIsSubmitting(true);
    
    try {
      const result = await recordDailyCheckIn(firestore, user.uid, data);
      
      if (result.success) {
        setHasCheckedInToday(true);
        toast(TOAST_MESSAGES.checkInSaved);
        return true;
      } else {
        toast({
          ...TOAST_MESSAGES.checkInError,
          description: result.error || TOAST_MESSAGES.checkInError.description,
        });
        return false;
      }
    } catch (error) {
      toast(TOAST_MESSAGES.checkInError);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [firestore, user, isSubmitting, toast]);

  const canCheckIn = useMemo(() => {
    return !isSubmitting && hasCheckedInToday === false;
  }, [isSubmitting, hasCheckedInToday]);

  return {
    isSubmitting,
    hasCheckedInToday,
    submitCheckIn,
    checkTodayStatus,
    canCheckIn,
  };
}
