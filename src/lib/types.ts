import type { analyzeJournalEntry } from "@/app/actions";
import type { z } from "zod";
import type { GenerateInitialJournalPromptOutput } from "@/ai/flows/generate-initial-journal-prompt";
import type { AnalyzeJournalEntryOutput } from "@/ai/flows/analyze-journal-entry";

export type Mood = "Happy" | "Calm" | "Okay" | "Anxious" | "Sad";

export type JournalEntry = {
  id: string;
  date: Date;
  mood: Mood;
  painLevel: number;
  entryText: string;
  analysis?: AnalyzeJournalEntryOutput | null;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | GenerateInitialJournalPromptOutput;
  isLoading?: boolean;
};
