/**
 * Reflection Prompts Hook
 * Manages prompt generation and history tracking
 * Pure business logic - no UI dependencies
 */

import { useState, useCallback, useMemo } from "react";
import { generateReflectionPrompt, getQuickCheckInPrompt, shouldGenerateNewPrompt, type PromptContext } from "@/services/prompt-service";
import type { JournalEntry, Mood } from "@/lib/types";

export interface UseReflectionPromptsReturn {
  // State
  currentPrompt: string;
  isGenerating: boolean;
  promptHistory: string[];
  
  // Actions
  generateNewPrompt: (context?: Partial<PromptContext>) => Promise<void>;
  getQuickPrompt: () => string;
  clearCurrentPrompt: () => void;
  
  // Computed
  hasPrompt: boolean;
  shouldRefresh: boolean;
}

export function useReflectionPrompts(
  recentEntries: JournalEntry[] = [],
  lastPromptDate?: string
): UseReflectionPromptsReturn {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const generateNewPrompt = useCallback(async (context: Partial<PromptContext> = {}) => {
    setIsGenerating(true);
    
    try {
      const fullContext: PromptContext = {
        recentEntries,
        promptHistory,
        ...context,
      };

      const result = await generateReflectionPrompt(fullContext);
      
      if (result.success) {
        setCurrentPrompt(result.prompt);
        setPromptHistory(prev => [...prev, result.prompt].slice(-10)); // Keep last 10
      } else {
        console.warn("Prompt generation failed:", result.error);
        // Fallback handled in service
        setCurrentPrompt(result.prompt);
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      setCurrentPrompt(getQuickCheckInPrompt());
    } finally {
      setIsGenerating(false);
    }
  }, [recentEntries, promptHistory]);

  const getQuickPrompt = useCallback(() => {
    const prompt = getQuickCheckInPrompt();
    setCurrentPrompt(prompt);
    return prompt;
  }, []);

  const clearCurrentPrompt = useCallback(() => {
    setCurrentPrompt("");
  }, []);

  const hasPrompt = useMemo(() => currentPrompt.length > 0, [currentPrompt]);
  
  const shouldRefresh = useMemo(() => {
    return shouldGenerateNewPrompt(lastPromptDate, promptHistory);
  }, [lastPromptDate, promptHistory]);

  return {
    currentPrompt,
    isGenerating,
    promptHistory,
    generateNewPrompt,
    getQuickPrompt,
    clearCurrentPrompt,
    hasPrompt,
    shouldRefresh,
  };
}
