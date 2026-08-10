'use server';
/**
 * @fileOverview Generates a postpartum-aware journaling prompt for Havyn.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateInitialJournalPromptInputSchema = z.object({
  mood: z
    .string()
    .describe("The user's current mood, e.g., Calm, Okay, Anxious."),
  recentThoughts: z
    .string()
    .optional()
    .describe("A brief summary of the user's recent thoughts and experiences."),
  promptType: z
    .enum(['greeting', 'check-in'])
    .describe(
      'The type of prompt to generate. "greeting" for a simple welcome, "check-in" for a daily reflection.'
    ),
  postpartumWeek: z
    .number()
    .optional()
    .describe('Approximate postpartum week, if known.'),
  deliveryType: z
    .string()
    .optional()
    .describe('Birth or delivery context, if the user shared it.'),
  feedingMode: z
    .string()
    .optional()
    .describe('Current feeding mode, if the user shared it.'),
  supportSystem: z
    .string()
    .optional()
    .describe('Names or roles of support people the user shared.'),
  careTeam: z
    .string()
    .optional()
    .describe('Care team context such as OB, midwife, therapist, doula, or pediatrician.'),
  anxietyLevel: z
    .number()
    .optional()
    .describe('Anxiety level from 0-10.'),
  overwhelmLevel: z
    .number()
    .optional()
    .describe('Overwhelm level from 0-10.'),
  sleepHours: z
    .number()
    .optional()
    .describe('Sleep hours in the last 24 hours.'),
  feedingStress: z
    .string()
    .optional()
    .describe('Feeding stress level: none, mild, moderate, or severe.'),
  recoveryConcern: z
    .string()
    .optional()
    .describe('Physical recovery concern level: none, mild, moderate, or severe.'),
  supportToday: z
    .string()
    .optional()
    .describe('Support level today: strong, some, limited, or none_today.'),
  riskLevel: z
    .string()
    .optional()
    .describe('Deterministic risk level from the app, if present.'),
  riskFlags: z
    .string()
    .optional()
    .describe('Comma-separated deterministic support signals from the app, if present.'),
  unwantedScaryThoughts: z
    .string()
    .optional()
    .describe('Unwanted scary thoughts level: none, mild, moderate, or severe.'),
  thoughtsFeelUncontrollable: z
    .boolean()
    .optional()
    .describe('Whether the user said scary thoughts feel hard to control.'),
  harmConcern: z
    .boolean()
    .optional()
    .describe('Whether the user said she fears hurting herself or someone else.'),
  notFeelingSafe: z
    .boolean()
    .optional()
    .describe('Whether the user said she does not feel safe right now.'),
});
export type GenerateInitialJournalPromptInput = z.infer<
  typeof GenerateInitialJournalPromptInputSchema
>;

const GenerateInitialJournalPromptOutputSchema = z.object({
  prompt: z
    .string()
    .describe('A personalized postpartum journaling prompt to help the user reflect safely.'),
});
export type GenerateInitialJournalPromptOutput = z.infer<
  typeof GenerateInitialJournalPromptOutputSchema
>;

export async function generateInitialJournalPrompt(
  input: GenerateInitialJournalPromptInput
): Promise<GenerateInitialJournalPromptOutput> {
  return generateInitialJournalPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialJournalPrompt',
  input: { schema: GenerateInitialJournalPromptInputSchema },
  output: { schema: GenerateInitialJournalPromptOutputSchema },
  prompt: `You are Havyn, an AI-powered postpartum companion for the first 12 weeks after birth.

Your role is to help a postpartum mother reflect with warmth, steadiness, and practical support. You are not a clinician and must not diagnose, prescribe treatment, or imply certainty about medical or mental health conditions.

Safety and support rules:
- Treat riskLevel and riskFlags as authoritative deterministic app signals. Do not override or soften them.
- If riskLevel is urgent, do not ask for deeper journaling. Tell her to bring in real human support now: local emergency services if there is immediate danger, 988, the maternal hotline, an emergency contact, or her care team.
- If riskLevel is elevated, name that this check-in deserves extra support and ask one practical next-step question about who can help in the next hour.
- If harmConcern, notFeelingSafe, thoughtsFeelUncontrollable, hallucinations, paranoia, or loss of control are present, prioritize urgent human support.
- Use support-oriented wording: "support level", "signals to discuss", "care-team follow-up". Do not use clinical scoring language like "diagnosis", "risk score", or "screen positive".
- Keep the response short: one or two sentences.
- Ask only one gentle question or offer one small next step.
- Do not use shame, pressure, or overly cheerful language.

{{#if eq promptType 'greeting'}}
Generate a short welcome message for a postpartum mother returning to Havyn. Mention that this is a check-in, not a performance.
{{/if}}

{{#if eq promptType 'check-in'}}
Generate a single postpartum journaling prompt based on the current signals.

Context:
Mood: {{{mood}}}
{{#if postpartumWeek}}Postpartum week: {{{postpartumWeek}}}{{/if}}
{{#if deliveryType}}Delivery context: {{{deliveryType}}}{{/if}}
{{#if feedingMode}}Feeding mode: {{{feedingMode}}}{{/if}}
{{#if supportSystem}}Support people: {{{supportSystem}}}{{/if}}
{{#if careTeam}}Care team: {{{careTeam}}}{{/if}}
{{#if anxietyLevel}}Anxiety: {{{anxietyLevel}}}/10{{/if}}
{{#if overwhelmLevel}}Overwhelm: {{{overwhelmLevel}}}/10{{/if}}
{{#if sleepHours}}Sleep: {{{sleepHours}}} hours{{/if}}
{{#if feedingStress}}Feeding stress: {{{feedingStress}}}{{/if}}
{{#if recoveryConcern}}Recovery concern: {{{recoveryConcern}}}{{/if}}
{{#if supportToday}}Support today: {{{supportToday}}}{{/if}}
{{#if riskLevel}}Support level: {{{riskLevel}}}{{/if}}
{{#if riskFlags}}Signals to discuss: {{{riskFlags}}}{{/if}}
{{#if unwantedScaryThoughts}}Unwanted scary thoughts: {{{unwantedScaryThoughts}}}{{/if}}
{{#if thoughtsFeelUncontrollable}}Scary thoughts feel hard to control: yes{{/if}}
{{#if harmConcern}}Fear of hurting self or someone else: yes{{/if}}
{{#if notFeelingSafe}}Does not feel safe right now: yes{{/if}}
{{#if recentThoughts}}Recent thoughts: {{{recentThoughts}}}{{/if}}

Return only the prompt text.
{{/if}}`,
});

const generateInitialJournalPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialJournalPromptFlow',
    inputSchema: GenerateInitialJournalPromptInputSchema,
    outputSchema: GenerateInitialJournalPromptOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
