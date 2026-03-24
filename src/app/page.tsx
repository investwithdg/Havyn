"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import type { JournalEntry } from "@/lib/types";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";

// Swipe Navigation
import { SwipeContainer } from "@/components/havyn/swipe-container";
import { HomeScreen } from "@/components/havyn/home-screen";
import { JournalScreen } from "@/components/havyn/journal-screen";
import { JournalSidebar } from "@/components/havyn/journal-sidebar";
import { CalendarView } from "@/components/havyn/calendar-view";
import { CheckInScreen } from "@/components/havyn/check-in-screen";
import { EscalateScreen } from "@/components/havyn/escalate-screen";

export default function HavynAppPage() {
  const user = { uid: "mock-user", displayName: "Test User", email: "test@example.com", photoURL: "" } as any;
  const userLoading = false;
  const router = useRouter();

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const entriesLoading = false;

  const handleSignOut = async () => {
    router.push('/login');
  };

  if (userLoading || !user || entriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden overscroll-none touch-none">
      <SwipeContainer 
        homeScreen={<HomeScreen user={user} onSignOut={handleSignOut} />}
        journalScreen={<JournalScreen />}
        journalSidebar={<JournalSidebar entries={journalEntries} />}
        calendarScreen={<CalendarView entries={journalEntries} />}
        checkInScreen={<CheckInScreen onComplete={() => console.log('Check-in complete, transition to journal is handled by user swipe.')} />}
        escalateScreen={<EscalateScreen />}
      />
    </div>
  );
}
