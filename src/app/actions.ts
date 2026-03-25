"use server";

import {
  generateInitialJournalPrompt,
  type GenerateInitialJournalPromptInput,
} from "@/ai/flows/generate-initial-journal-prompt";
import {
  analyzeJournalEntry,
  type AnalyzeJournalEntryInput,
} from "@/ai/flows/analyze-journal-entry";
import {
  deepAnalysis,
  type DeepAnalysisInput,
} from "@/ai/flows/deep-analysis";

export async function generatePromptAction(
  input: GenerateInitialJournalPromptInput
) {
  return await generateInitialJournalPrompt(input);
}

export async function analyzeEntryAction(input: AnalyzeJournalEntryInput) {
  return await analyzeJournalEntry(input);
}

export async function deepAnalyzeEntryAction(input: DeepAnalysisInput) {
  return await deepAnalysis(input);
}
