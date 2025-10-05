/**
 * UI Utilities
 * Common UI helper functions and constants
 */

import type { Mood } from "./types";

/**
 * Mood configuration with icons and colors
 */
export const MOOD_CONFIG = {
  Happy: { 
    color: "text-green-500", 
    bgColor: "bg-green-100", 
    borderColor: "border-green-200",
    textColor: "text-green-800"
  },
  Calm: { 
    color: "text-blue-500", 
    bgColor: "bg-blue-100", 
    borderColor: "border-blue-200",
    textColor: "text-blue-800"
  },
  Okay: { 
    color: "text-yellow-500", 
    bgColor: "bg-yellow-100", 
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800"
  },
  Anxious: { 
    color: "text-orange-500", 
    bgColor: "bg-orange-100", 
    borderColor: "border-orange-200",
    textColor: "text-orange-800"
  },
  Sad: { 
    color: "text-gray-500", 
    bgColor: "bg-gray-100", 
    borderColor: "border-gray-200",
    textColor: "text-gray-800"
  },
} as const;

/**
 * Gets mood styling classes
 */
export function getMoodStyles(mood: Mood) {
  return MOOD_CONFIG[mood] || MOOD_CONFIG.Okay;
}

/**
 * Gets combined mood classes for badges
 */
export function getMoodBadgeClasses(mood: Mood): string {
  const styles = getMoodStyles(mood);
  return `${styles.bgColor} ${styles.textColor} ${styles.borderColor}`;
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Formats character count display
 */
export function formatCharacterCount(count: number, max?: number): string {
  if (max) {
    return `${count}/${max}`;
  }
  return `${count} characters`;
}

/**
 * Gets loading skeleton count based on array length
 */
export function getSkeletonCount(expectedCount: number = 3, min: number = 1, max: number = 5): number {
  return Math.min(Math.max(expectedCount, min), max);
}

/**
 * Common toast messages
 */
export const TOAST_MESSAGES = {
  checkInSaved: {
    title: "Check-in saved!",
    description: "Your thoughts are safely recorded.",
  },
  checkInError: {
    title: "Failed to save check-in",
    description: "Please try again.",
    variant: "destructive" as const,
  },
  analysisError: {
    title: "Entry saved without analysis", 
    description: "We couldn't analyze your entry right now, but it's saved.",
  },
  promptError: {
    title: "Error",
    description: "Could not get a response from the AI. Please try again.",
    variant: "destructive" as const,
  },
  emptyEntry: {
    title: "Please write something in your journal.",
    variant: "destructive" as const,
  },
} as const;
