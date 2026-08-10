'use server';
/**
 * Deep Analysis Flow (Premium)
 * Provides postpartum-aware pattern detection, recommendations, and risk flagging.
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
    .describe('Recent journal entries for postpartum pattern analysis.'),
});

export type DeepAnalysisInput = z.infer<typeof DeepAnalysisInputSchema>;

const DeepAnalysisOutputSchema = z.object({
  themes: z
    .array(z.string())
    .describe('Recurring postpartum themes identified in the journal entry.'),
  emotions: z
    .array(z.string())
    .describe('Emotions expressed in the journal entry.'),
  summary: z.string().describe('A concise summary of the journal entry.'),
  patterns: z
    .array(z.string())
    .describe(
      'Patterns detected across recent entries, e.g. sleep disruption, feeding stress, isolation, recovery pain, or mood shifts.'
    ),
  recommendations: z
    .array(z.string())
    .describe(
      'Specific, low-burden postpartum support recommendations. These must not diagnose or prescribe treatment.'
    ),
  moodTrend: z
    .enum(['improving', 'stable', 'declining'])
    .describe('Overall mood trend based on recent entries.'),
  riskFlags: z
    .array(z.string())
    .describe(
      'Concerning postpartum patterns that may warrant immediate support or care-team follow-up.'
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
  prompt: `You are Havyn, an AI postpartum companion for the first 12 weeks after birth. You help the user see patterns with compassion and decide what support to ask for.

Clinical boundaries:
- Do not diagnose postpartum depression, anxiety, psychosis, PTSD, or any medical condition.
- Do not prescribe treatment, medication, supplements, or medical instructions.
- If there are signals of self-harm, harm to others, hallucinations, paranoia, feeling unsafe, or loss of control, riskFlags must include "urgent human support" and recommendations must prioritize contacting emergency support, a trusted person, or the user's care team.
- Use support-oriented language: "support level", "signals to discuss", "care-team follow-up", and "human support". Avoid clinical scoring language such as "risk score" or "screen positive".
- Physical recovery concerns, severe pain, heavy bleeding language, fever language, or feeling physically unsafe should be framed as reasons to contact a clinician promptly.
- Recommendations should be small, practical, and low burden.

## Current Journal Entry
{{{entryText}}}

{{#if recentEntries}}
## Recent Entries
{{#each recentEntries}}
- Date: {{this.date}} | Mood: {{this.mood}} | Pain: {{this.painLevel}}/10{{#if this.text}} | "{{this.text}}"{{/if}}
{{/each}}
{{/if}}

## Instructions

1. Themes: Identify 2-4 postpartum-relevant themes.
2. Emotions: List explicit and implicit emotions.
3. Summary: Write a compassionate 2-3 sentence summary without diagnosis.
4. Patterns: Look for recurring postpartum signals such as sleep deprivation, feeding pressure, physical recovery strain, isolation, anxiety spikes, bonding distress, lack of support, identity shift, or pain/mood correlation.
5. Recommendations: Provide 2-3 concrete next steps. Examples: ask a support person for a protected rest block, write one question for the next OB/midwife visit, text a trusted person, simplify feeding support, or call the care team for physical concerns. Do not tell the user to simply "self-care more".
6. Mood trend: Classify as improving, stable, or declining based on recent entries.
7. Risk flags: Include only genuine concerns. Use phrases such as "urgent human support", "care-team follow-up", "high distress without support", "sleep disruption", "severe recovery concern", or "intrusive thoughts" when supported by the text.

Return a JSON object matching the schema.`,
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
