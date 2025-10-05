"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 as Spinner } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePromptAction } from "@/app/actions";

export function PromptCTA({ onNewPrompt }: { onNewPrompt: (prompt: string) => void }) {
  const [welcomePrompt, setWelcomePrompt] = useState("Welcome back. Take a moment for yourself.");
  const [isGenerating, startGenerating] = useTransition();

  const generateWelcomePrompt = () => {
    startGenerating(async () => {
      const result = await generatePromptAction({ mood: "neutral", promptType: "check-in" });
      onNewPrompt(result.prompt);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-2xl font-headline text-primary mb-4">{welcomePrompt}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Your journal is a private space to reflect and grow. Start your daily entry when you're ready.
      </p>
      <Button onClick={generateWelcomePrompt} disabled={isGenerating}>
        {isGenerating ? <Spinner className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
        Start Today's Journal
      </Button>
    </div>
  );
}
