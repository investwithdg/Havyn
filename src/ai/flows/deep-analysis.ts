// src/ai/flows/deep-analysis.ts
'use server';

/**
 * Deep Analysis Flow (Premium)
 * Provides richer therapeutic analysis across multiple entries
 * with pattern detection, recommendations, and risk flagging.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DeepAnalysisInputSchema = z.object({
  entryText: z
    .string()
    .describe('The text content of the current journal entry.'),
  recentEntries: z
    .array(
      z.object({
        mood: z.string().describe('The mood recorded for this entry.'),
        painLevel: z.number().describe('Pain level 0-10.'),
        date: z.string().describe('ISO date string of the entry.'),
        text: z.string().optional().describe('The entry text if available.'),
      })
    )
    .optional()
    .describe('Recent journal entries for pattern analysis.'),
});

export type DeepAnalysisInput = z.infer<typeof DeepAnalysisInputSchema>;

const DeepAnalysisOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('Recurring themes identified in the journal entry.'),
  emotions: z
    .array(z.string())
    .describe('Emotions expressed in the journal entry.'),
  summary: z.string().describe('A concise summary of the journal entry.'),
  patterns: z
    .array(z.string())
    .describe(
      'Patterns detected across recent entries, e.g. recurring topics, mood shifts.'
    ),
  recommendations: z
    .array(z.string())
    .describe(
      'Actionable wellness recommendations based on the analysis.'
    ),
  moodTrend: z
    .enum(['improving', 'stable', 'declining'])
    .describe('Overall mood trend based on recent entries.'),
  riskFlags: z
    .array(z.string())
    .describe(
      'Concerning patterns that may warrant attention, e.g. persistent high pain or declining mood.'
    ),
});

export type DeepAnalysisOutput = z.infer<typeof DeepAnalysisOutputSchema>;

export async function deepAnalysis(
  input: DeepAnalysisInput
): Promise<DeepAnalysisOutput> {
  return deepAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'deepAnalysisPrompt',
  input: { schema: DeepAnalysisInputSchema },
  output: { schema: DeepAnalysisOutputSchema },
  prompt: `You are a compassionate wellness analyst specializing in women's health and emotional wellbeing. You provide thoughtful, therapeutic analysis that helps users understand their patterns and take positive action.

Analyze the current journal entry and any recent entries provided. Your analysis should be warm, supportive, and actionable.

## Current Journal Entry
{{{entryText}}}

{{#if recentEntries}}
## Recent Entries (for context and pattern detection)
{{#each recentEntries}}
- Date: {{this.date}} | Mood: {{this.mood}} | Pain: {{this.painLevel}}/10{{#if this.text}} | "{{this.text}}"{{/if}}
{{/each}}
{{/if}}

## Instructions

1. **Themes**: Identify 2-4 recurring themes from the current entry and recent history.
2. **Emotions**: List the emotions expressed (both explicit and implicit).
3. **Summary**: Write a compassionate 2-3 sentence summary of what the user is experiencing.
4. **Patterns**: Look across recent entries for recurring topics, cyclical mood changes, pain correlations with mood, or behavioral patterns. If no recent entries, note what you observe in this single entry.
5. **Recommendations**: Provide 2-3 specific, actionable wellness recommendations. Be concrete (e.g., "Try a 10-minute walk after lunch" not "exercise more"). Tailor to what the entry reveals.
6. **Mood Trend**: Based on recent entries, classify the overall trend as "improving", "stable", or "declining". If only one entry, base it on the tone.
7. **Risk Flags**: Flag any concerning patterns that may warrant professional attention, such as: persistent high pain levels (7+), sustained declining mood, mentions of hopelessness, social isolation, or sleep disruption lasting more than a week. Only flag genuine concerns — do not over-flag.

Output format: A JSON object matching the schema.`,
});

const deepAnalysisFlow = ai.defineFlow(
  {
    name: 'deepAnalysisFlow',
    inputSchema: DeepAnalysisInputSchema,
    outputSchema: DeepAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
