// src/ai/flows/analyze-journal-entry.ts
'use server';

/**
 * @fileOverview Analyzes a journal entry to identify recurring themes and emotions.
 *
 * - analyzeJournalEntry - A function that analyzes the journal entry.
 * - AnalyzeJournalEntryInput - The input type for the analyzeJournalEntry function.
 * - AnalyzeJournalEntryOutput - The return type for the analyzeJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJournalEntryInputSchema = z.object({
  entryText: z
    .string()
    .describe('The text content of the journal entry to be analyzed.'),
});

export type AnalyzeJournalEntryInput = z.infer<typeof AnalyzeJournalEntryInputSchema>;

const AnalyzeJournalEntryOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('Recurring themes identified in the journal entry.'),
  emotions: z
    .array(z.string())
    .describe('Emotions expressed in the journal entry.'),
  summary: z.string().describe('A concise summary of the journal entry.'),
});

export type AnalyzeJournalEntryOutput = z.infer<typeof AnalyzeJournalEntryOutputSchema>;

export async function analyzeJournalEntry(input: AnalyzeJournalEntryInput): Promise<AnalyzeJournalEntryOutput> {
  return analyzeJournalEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJournalEntryPrompt',
  input: {schema: AnalyzeJournalEntryInputSchema},
  output: {schema: AnalyzeJournalEntryOutputSchema},
  prompt: `You are an AI trained to analyze journal entries and identify recurring themes and emotions.

  Analyze the following journal entry and provide a summary, identify the themes and emotions expressed.

  Journal Entry: {{{entryText}}}
  Output format: A JSON object matching the schema.

  Themes should be a list of strings of themes.
  Emotions should be a list of strings of emotions.
  Summary should be a concise summary of the journal entry.
  `,
});

const analyzeJournalEntryFlow = ai.defineFlow(
  {
    name: 'analyzeJournalEntryFlow',
    inputSchema: AnalyzeJournalEntryInputSchema,
    outputSchema: AnalyzeJournalEntryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
