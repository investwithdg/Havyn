"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Firebase & Types
import { useAuth, useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { JournalEntry, Mood } from "@/lib/types";

// Swipe Navigation
import { SwipeContainer } from "@/components/havyn/swipe-container";
import { HomeScreen } from "@/components/havyn/home-screen";
import { JournalScreen } from "@/components/havyn/journal-screen";
import { JournalSidebar } from "@/components/havyn/journal-sidebar";
import { CalendarView } from "@/components/havyn/calendar-view";
import { CheckInScreen } from "@/components/havyn/check-in-screen";
import { EscalateScreen } from "@/components/havyn/escalate-screen";

// Business Logic Hooks
import { useDailyCheckIn } from "@/hooks/use-daily-check-in";
import { useDynamicCTA } from "@/hooks/use-dynamic-cta";
import { useReflectionPrompts } from "@/hooks/use-reflection-prompts";

export default function HavynAppPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  // Firebase Collections
  const userRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const journalEntriesRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "journalEntries");
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userRef);
  const { data: journalEntries, loading: entriesLoading } = useCollection<JournalEntry>(journalEntriesRef);

  // Business Logic Hooks
  const dailyCheckIn = useDailyCheckIn();
  const dynamicCTA = useDynamicCTA(journalEntries || []);
  const reflectionPrompts = useReflectionPrompts(
    journalEntries || [], 
    userProfile?.lastPromptDate
  );

  // State to bridge Check In and Journal
  const [pendingMood, setPendingMood] = useState<Mood>("Okay");
  const [pendingPain, setPendingPain] = useState<number>(0);

  // Auth redirect
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      dailyCheckIn.checkTodayStatus();
    }
  }, [user, firestore]);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  const handleCheckInComplete = async (mood: string, painLevel: number) => {
    const formattedMood = (mood.charAt(0).toUpperCase() + mood.slice(1)) as Mood;
    setPendingMood(formattedMood);
    setPendingPain(painLevel);
    
    // We can save a placeholder check-in if user doesn't journal, or wait for the journal.
    // For this flow, we pre-log the check-in to satisfy "hasCheckedInToday" and then the journal will log *another* comprehensive entry, or this is sufficient.
    await dailyCheckIn.submitCheckIn({
      mood: formattedMood,
      painLevel,
      entryText: ""
    });
    
    // Generate prompt for the journal!
    reflectionPrompts.generateNewPrompt();
    dynamicCTA.refreshCTA();
  };

  const handleJournalSubmit = async (text: string) => {
    await dailyCheckIn.submitCheckIn({
      mood: pendingMood,
      painLevel: pendingPain,
      entryText: text
    });
    reflectionPrompts.clearCurrentPrompt();
  };

  if (userLoading || entriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) return null; // Wait for redirect

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] bg-background text-foreground overflow-hidden overscroll-none touch-pan-y">
      <SwipeContainer 
        homeScreen={
          <HomeScreen 
            user={user} 
            onSignOut={handleSignOut} 
            encouragement={dynamicCTA.encouragement}
            prompt={reflectionPrompts.currentPrompt}
          />
        }
        journalScreen={
          <JournalScreen 
            prompt={reflectionPrompts.currentPrompt}
            isSubmitting={dailyCheckIn.isSubmitting}
            onSubmit={handleJournalSubmit} 
          />
        }
        journalSidebar={<JournalSidebar entries={journalEntries || []} />}
        calendarScreen={<CalendarView entries={journalEntries || []} />}
        checkInScreen={
          <CheckInScreen 
            onComplete={handleCheckInComplete} 
            isSubmitting={dailyCheckIn.isSubmitting} 
          />
        }
        escalateScreen={<EscalateScreen />}
      />
    </div>
  );
}
