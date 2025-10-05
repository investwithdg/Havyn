"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { BotMessageSquare, BookHeart, CalendarDays, LogOut, Loader2 as Spinner } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/havyn/logo";
import { UserAvatar } from "@/components/havyn/user-avatar";
import { ChatView } from "@/components/havyn/chat-view";
import { JournalView } from "@/components/havyn/journal-view";
import { CalendarView } from "@/components/havyn/calendar-view";
import { PromptCTA } from "@/components/havyn/prompt-cta";
import type { JournalEntry } from "@/lib/types";
import { useAuth, useUser, useCollection, useDoc, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HavynAppPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("home");
  const [initialPrompt, setInitialPrompt] = useState<string>("");

  const userRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc(userRef);

  const journalEntriesRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "journalEntries");
  }, [firestore, user]);

  const { data: journalEntries, loading: entriesLoading } = useCollection<JournalEntry>(journalEntriesRef);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const handleNewPrompt = (newPrompt: string) => {
    setInitialPrompt(newPrompt);
    setActiveTab("journal");
  };

  const addJournalEntry = async (entry: Omit<JournalEntry, "id" | "date">) => {
    if (!journalEntriesRef || !userRef) return;
    const newEntry = {
      ...entry,
      date: serverTimestamp(),
      userId: user?.uid,
    };
    await addDoc(journalEntriesRef, newEntry);
    await setDoc(userRef, { lastPromptDate: new Date().toISOString() }, { merge: true });
    setInitialPrompt(""); // Clear prompt after use
  };

  const todayEntry = useMemo(() => {
    if (!journalEntries) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return journalEntries.find((entry) => {
        if (!entry.date) return false;
        // Firestore timestamps can be seconds/nanoseconds objects
        const entryDate = entry.date instanceof Timestamp ? entry.date.toDate() : new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
    });
  }, [journalEntries]);
  
  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  if (userLoading || !user || entriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const showWelcome = activeTab === "home" && !todayEntry;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <Logo />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
          <UserAvatar user={user} />
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow h-full">
        <main className="flex-grow pb-20 overflow-y-auto">
          <TabsContent value="home" className="mt-0">
            {showWelcome ? (
              <PromptCTA onNewPrompt={handleNewPrompt} />
            ) : (
              <ChatView onNewPrompt={handleNewPrompt} />
            )}
          </TabsContent>
          <TabsContent value="journal" className="mt-0">
            <JournalView 
              initialPrompt={initialPrompt} 
              onAddJournalEntry={addJournalEntry}
              entries={journalEntries || []}
              loading={entriesLoading}
            />
          </TabsContent>
          <TabsContent value="calendar" className="mt-0">
            <CalendarView entries={journalEntries || []} />
          </TabsContent>
        </main>
        
        <TabsList className="fixed bottom-0 left-0 right-0 z-10 h-16 grid w-full grid-cols-3 rounded-none border-t bg-background">
          <TabsTrigger value="home" className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
            <BotMessageSquare size={20}/>
            <span className="text-xs">Home</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
            <BookHeart size={20}/>
            <span className="text-xs">Journal</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none">
            <CalendarDays size={20}/>
            <span className="text-xs">Calendar</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

// Add a simple loader component
function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
