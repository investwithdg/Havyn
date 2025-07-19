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
    .describe("A brief summary of the user's recent thoughts and experiences."),
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
  prompt: `You are a helpful AI assistant designed to provide personalized journaling prompts to users.

  Based on the user's current mood and recent thoughts, generate a single, specific, and thought-provoking journaling prompt to help them explore their feelings and experiences.

  Mood: {{{mood}}}
  Recent Thoughts: {{{recentThoughts}}}

  Journaling Prompt:`,
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
