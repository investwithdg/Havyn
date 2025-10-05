import type { z } from "zod";
import type { GenerateInitialJournalPromptOutput } from "@/ai/flows/generate-initial-journal-prompt";
import type { AnalyzeJournalEntryOutput } from "@/ai/flows/analyze-journal-entry";
import type { Timestamp } from "firebase/firestore";

export type Mood = "Happy" | "Calm" | "Okay" | "Anxious" | "Sad";

export type JournalEntry = {
  id: string;
  date: Date | Timestamp;
  mood: Mood;
  painLevel: number;
  entryText: string;
  analysis?: AnalyzeJournalEntryOutput | null;
  userId: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | { prompt: string };
  isLoading?: boolean;
};
