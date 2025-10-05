'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a personalized journaling prompt for the user.
 *
 * @function generateInitialJournalPrompt - Generates a personalized journaling prompt.
 * @interface GenerateInitialJournalPromptInput - The input type for the generateInitialJournalPrompt function.
 * @interface GenerateInitialJournalPromptOutput - The output type for the generateInitialJournalPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialJournalPromptInputSchema = z.object({
  mood: z
    .string()
    .describe("The user's current mood, e.g., happy, sad, anxious."),
  recentThoughts: z
    .string()
    .optional()
    .describe("A brief summary of the user's recent thoughts and experiences."),
  promptType: z
    .enum(['greeting', 'check-in'])
    .describe(
      'The type of prompt to generate. "greeting" for a simple welcome, "check-in" for a daily reflection.'
    ),
});
export type GenerateInitialJournalPromptInput = z.infer<
  typeof GenerateInitialJournalPromptInputSchema
>;

const GenerateInitialJournalPromptOutputSchema = z.object({
  prompt: z
    .string()
    .describe('A personalized journaling prompt to help the user start writing.'),
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
  input: {schema: GenerateInitialJournalPromptInputSchema},
  output: {schema: GenerateInitialJournalPromptOutputSchema},
  prompt: `You are a helpful AI assistant for a journaling app called Havyn. Your goal is to provide a warm, encouraging, and context-aware prompt.

  Based on the requested prompt type, generate a single, specific, and thought-provoking journaling prompt.

  {{#if eq promptType 'greeting'}}
  Generate a short, welcoming message for the user. It's the first thing they see when they open the app. Be warm and inviting. Example: "Welcome back. Ready to reflect?"
  {{/if}}

  {{#if eq promptType 'check-in'}}
  The user wants a daily check-in prompt.
  - If recent thoughts are provided, use them to create a tailored and empathetic prompt.
  - If no recent thoughts are given, create a general but insightful prompt related to their mood.
  - Your response should ONLY be the prompt itself, without any conversational filler.

  Mood: {{{mood}}}
  {{#if recentThoughts}}
  Recent Thoughts: {{{recentThoughts}}}
  {{/if}}

  Journaling Prompt:
  {{/if}}
  `,
});

const generateInitialJournalPromptFlow = ai.defineFlow(
  {
    name: 'generateInitialJournalPromptFlow',
    inputSchema: GenerateInitialJournalPromptInputSchema,
    outputSchema: GenerateInitialJournalPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
