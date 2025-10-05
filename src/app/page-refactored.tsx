/**
 * Refactored Havyn App Page
 * Clean separation of concerns - uses hooks for business logic
 * Components are purely presentational
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import { BotMessageSquare, BookHeart, CalendarDays, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// App Components  
import { Logo } from "@/components/havyn/logo";
import { UserAvatar } from "@/components/havyn/user-avatar";
import { ChatView } from "@/components/havyn/chat-view";
import { CalendarView } from "@/components/havyn/calendar-view";
import { DynamicCTA } from "@/components/havyn/dynamic-cta";
import { DailyCheckInForm, type CheckInFormData } from "@/components/havyn/daily-check-in-form";
import { JournalEntriesList } from "@/components/havyn/journal-entries-list";

// Business Logic Hooks
import { useDailyCheckIn } from "@/hooks/use-daily-check-in";
import { useDynamicCTA } from "@/hooks/use-dynamic-cta";
import { useReflectionPrompts } from "@/hooks/use-reflection-prompts";

// Firebase & Types
import { useAuth, useUser, useCollection, useDoc, useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { JournalEntry } from "@/lib/types";

type AppView = "home" | "check-in" | "journal" | "calendar";

export default function HavynAppPageRefactored() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const [activeView, setActiveView] = useState<AppView>("home");

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

  // Auth redirect
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  // Check today's status on load
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

  const handleCTAAction = (action: string) => {
    switch (action) {
      case "start_journal":
        if (reflectionPrompts.shouldRefresh) {
          reflectionPrompts.generateNewPrompt();
        } else {
          reflectionPrompts.getQuickPrompt();
        }
        setActiveView("check-in");
        break;
      case "continue_journal":
        setActiveView("journal");
        break;
      case "view_insights":
        setActiveView("calendar");
        break;
      default:
        setActiveView("check-in");
    }
  };

  const handleNewPrompt = (prompt: string) => {
    reflectionPrompts.generateNewPrompt({ recentThoughts: prompt });
    setActiveView("check-in");
  };

  const handleCheckInSubmit = async (data: CheckInFormData) => {
    const success = await dailyCheckIn.submitCheckIn(data);
    if (success) {
      reflectionPrompts.clearCurrentPrompt();
      dynamicCTA.refreshCTA();
      setActiveView("home");
    }
  };

  const handleCheckInCancel = () => {
    reflectionPrompts.clearCurrentPrompt();
    setActiveView("home");
  };

  // Loading state
  if (userLoading || !user || entriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const showWelcomeCTA = activeView === "home" && 
    dynamicCTA.shouldShow && 
    !dynamicCTA.isLoading;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <Logo />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
          <UserAvatar user={user} />
        </div>
      </header>
      
      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as AppView)} className="flex flex-col flex-grow h-full">
        <main className="flex-grow pb-20 overflow-y-auto">
          
          {/* Home View */}
          <TabsContent value="home" className="mt-0 h-full">
            {showWelcomeCTA ? (
              <div className="flex items-center justify-center h-full p-4">
                <DynamicCTA
                  cta={dynamicCTA.cta}
                  encouragement={dynamicCTA.encouragement}
                  isLoading={dynamicCTA.isLoading}
                  onAction={handleCTAAction}
                  variant="prominent"
                />
              </div>
            ) : (
              <ChatView onNewPrompt={handleNewPrompt} />
            )}
          </TabsContent>

          {/* Check-In View */}
          <TabsContent value="check-in" className="mt-0">
            <DailyCheckInForm
              initialPrompt={reflectionPrompts.currentPrompt}
              isSubmitting={dailyCheckIn.isSubmitting || reflectionPrompts.isGenerating}
              onSubmit={handleCheckInSubmit}
              onCancel={handleCheckInCancel}
              disabled={!dailyCheckIn.canCheckIn}
            />
          </TabsContent>

          {/* Journal View */}
          <TabsContent value="journal" className="mt-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-headline text-primary">Your Journal</h2>
                {dailyCheckIn.canCheckIn && (
                  <DynamicCTA
                    cta={dynamicCTA.cta}
                    onAction={handleCTAAction}
                    variant="minimal"
                    showEncouragement={false}
                  />
                )}
              </div>
              
              <JournalEntriesList
                entries={journalEntries || []}
                loading={entriesLoading}
                showAnalysis={true}
              />
            </div>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-0">
            <CalendarView entries={journalEntries || []} />
          </TabsContent>
          
        </main>
        
        {/* Bottom Navigation */}
        <TabsList className="fixed bottom-0 left-0 right-0 z-10 h-16 grid w-full grid-cols-3 rounded-none border-t bg-background">
          <TabsTrigger 
            value="home" 
            className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <BotMessageSquare size={20}/>
            <span className="text-xs">Home</span>
          </TabsTrigger>
          <TabsTrigger 
            value="journal" 
            className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <BookHeart size={20}/>
            <span className="text-xs">Journal</span>
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            <CalendarDays size={20}/>
            <span className="text-xs">Calendar</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
