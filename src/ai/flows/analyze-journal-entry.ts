'use server';
/**
 * @fileOverview Analyzes a postpartum journal entry for supportive reflection and risk-aware themes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeJournalEntryInputSchema = z.object({
  entryText: z
    .string()
    .describe('The text content of the journal entry to be analyzed.'),
});

export type AnalyzeJournalEntryInput = z.infer<typeof AnalyzeJournalEntryInputSchema>;

const AnalyzeJournalEntryOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('Postpartum themes identified in the journal entry.'),
  emotions: z
    .array(z.string())
    .describe('Emotions expressed in the journal entry.'),
  summary: z.string().describe('A concise, compassionate summary of the journal entry.'),
});

export type AnalyzeJournalEntryOutput = z.infer<typeof AnalyzeJournalEntryOutputSchema>;

export async function analyzeJournalEntry(input: AnalyzeJournalEntryInput): Promise<AnalyzeJournalEntryOutput> {
  return analyzeJournalEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJournalEntryPrompt',
  input: { schema: AnalyzeJournalEntryInputSchema },
  output: { schema: AnalyzeJournalEntryOutputSchema },
  prompt: `You are Havyn, an AI postpartum companion. Analyze the journal entry to help the user understand what she is carrying today.

Boundaries:
- Do not diagnose postpartum depression, anxiety, psychosis, or any medical condition.
- Do not prescribe treatment or medication.
- If the entry suggests self-harm, harm to someone else, feeling unsafe, hallucinations, paranoia, or loss of control, include an urgent support-oriented theme such as "needs immediate human support".
- Prefer support-oriented language: "support level", "signals to discuss", "care-team follow-up", and "human support".
- Do not use clinical scoring language like "risk score", "screen positive", or diagnosis-like wording.
- Keep the summary compassionate, plainspoken, and non-alarming.

Journal Entry: {{{entryText}}}

Return JSON matching the schema:
- themes: 2-5 postpartum-relevant themes, such as sleep deprivation, feeding stress, identity shift, recovery pain, isolation, bonding, intrusive thoughts, support needs, or care-team follow-up.
- emotions: emotions explicitly or implicitly present.
- summary: 1-2 sentences reflecting the entry without diagnosis.`,
});

const analyzeJournalEntryFlow = ai.defineFlow(
  {
    name: 'analyzeJournalEntryFlow',
    inputSchema: AnalyzeJournalEntryInputSchema,
    outputSchema: AnalyzeJournalEntryOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
