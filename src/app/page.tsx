"use client";

import { useState, useMemo } from "react";
import { BotMessageSquare, BookHeart, CalendarDays } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/havyn/logo";
import { UserAvatar } from "@/components/havyn/user-avatar";
import { ChatView } from "@/components/havyn/chat-view";
import { JournalView } from "@/components/havyn/journal-view";
import { CalendarView } from "@/components/havyn/calendar-view";
import type { JournalEntry, Mood } from "@/lib/types";

export default function HavynAppPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  const [prompt, setPrompt] = useState<string>("");

  const handleNewPrompt = (newPrompt: string) => {
    setPrompt(newPrompt);
    setActiveTab("journal");
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id" | "date">) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date(),
    };
    setJournalEntries((prev) => [...prev, newEntry]);
    setPrompt(""); // Clear prompt after use
  };

  const todayEntry = useMemo(() => {
    const today = new Date();
    return journalEntries.find(
      (entry) =>
        entry.date.getDate() === today.getDate() &&
        entry.date.getMonth() === today.getMonth() &&
        entry.date.getFullYear() === today.getFullYear()
    );
  }, [journalEntries]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <Logo />
        <UserAvatar />
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow h-full">
        <main className="flex-grow pb-20 overflow-y-auto">
          <TabsContent value="home" className="mt-0">
            <ChatView onNewPrompt={handleNewPrompt} />
          </TabsContent>
          <TabsContent value="journal" className="mt-0">
            <JournalView 
              initialPrompt={prompt} 
              onAddJournalEntry={addJournalEntry}
              entries={journalEntries}
              hasTodayEntry={!!todayEntry}
            />
          </TabsContent>
          <TabsContent value="calendar" className="mt-0">
            <CalendarView entries={journalEntries} />
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
