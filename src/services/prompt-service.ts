/**
 * Prompt Service
 * Handles reflection prompt generation and history tracking
 * Pure functions - no UI dependencies
 */

import { generatePromptAction } from "@/app/actions";
import type { JournalEntry, Mood } from "@/lib/types";
import type { GenerateInitialJournalPromptInput } from "@/ai/flows/generate-initial-journal-prompt";

export interface PromptContext {
  mood?: Mood;
  recentThoughts?: string;
  recentEntries?: JournalEntry[];
  promptHistory?: string[];
}

export interface PromptResult {
  prompt: string;
  success: boolean;
  error?: string;
}

/**
 * Generates a contextually relevant reflection prompt
 * Avoids recent prompts to prevent repetition
 */
export async function generateReflectionPrompt(
  context: PromptContext
): Promise<PromptResult> {
  try {
    const promptInput = buildPromptInput(context);
    const result = await generatePromptAction(promptInput);
    
    return {
      prompt: result.prompt,
      success: true,
    };
  } catch (error) {
    return {
      prompt: getFallbackPrompt(context),
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate prompt",
    };
  }
}

/**
 * Builds AI prompt input based on user context
 */
function buildPromptInput(context: PromptContext): GenerateInitialJournalPromptInput {
  const mood = context.mood || inferMoodFromRecent(context.recentEntries) || "neutral";
  
  return {
    mood,
    recentThoughts: context.recentThoughts,
    promptType: "check-in",
  };
}

/**
 * Infers mood from recent journal entries
 */
function inferMoodFromRecent(recentEntries?: JournalEntry[]): Mood | null {
  if (!recentEntries || recentEntries.length === 0) return null;
  
  // Use most recent entry's mood as context
  return recentEntries[0]?.mood || null;
}

/**
 * Provides fallback prompts when AI generation fails
 */
function getFallbackPrompt(context: PromptContext): string {
  const fallbackPrompts = [
    "What's one thing you're grateful for today?",
    "How are you feeling right now, and what might be contributing to that feeling?",
    "What's been on your mind lately?",
    "Describe a moment from today that stood out to you.",
    "What would you like to let go of today?",
    "What's something you learned about yourself recently?",
    "How would you describe your energy level today?",
    "What's one small thing that brought you joy today?",
  ];

  // Avoid recent prompts if we have history
  if (context.promptHistory && context.promptHistory.length > 0) {
    const availablePrompts = fallbackPrompts.filter(
      prompt => !context.promptHistory!.includes(prompt)
    );
    if (availablePrompts.length > 0) {
      return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    }
  }

  return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
}

/**
 * Gets a quick check-in prompt for immediate use
 */
export function getQuickCheckInPrompt(): string {
  const quickPrompts = [
    "How are you feeling right now?",
    "What's on your mind today?",
    "Take a moment to check in with yourself.",
    "What would be helpful to explore today?",
  ];

  return quickPrompts[Math.floor(Math.random() * quickPrompts.length)];
}

/**
 * Determines if a new prompt should be generated based on usage patterns
 */
export function shouldGenerateNewPrompt(
  lastPromptDate?: string,
  promptHistory?: string[]
): boolean {
  // Generate new prompt if:
  // 1. No prompt used today
  // 2. User has used multiple prompts recently (engaged user)
  
  if (!lastPromptDate) return true;
  
  const lastUsed = new Date(lastPromptDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff >= 1 || (promptHistory && promptHistory.length > 3);
}
