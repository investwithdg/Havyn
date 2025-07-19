"use server";

import {
  generateInitialJournalPrompt,
  type GenerateInitialJournalPromptInput,
} from "@/ai/flows/generate-initial-journal-prompt";
import {
  analyzeJournalEntry,
  type AnalyzeJournalEntryInput,
} from "@/ai/flows/analyze-journal-entry";

export async function generatePromptAction(
  input: GenerateInitialJournalPromptInput
) {
  return await generateInitialJournalPrompt(input);
}

export async function analyzeEntryAction(input: AnalyzeJournalEntryInput) {
  return await analyzeJournalEntry(input);
}
