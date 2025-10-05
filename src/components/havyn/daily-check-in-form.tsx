/**
 * Daily Check-In Form Component
 * Pure UI component - no business logic
 * Receives all data and handlers via props
 */

"use client";

import { useState, useEffect } from "react";
import { Smile, Meh, Frown, Sparkles, BookCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Mood } from "@/lib/types";
import { MOOD_CONFIG, formatCharacterCount, generateTimeBasedId } from "@/lib/ui-utils";

const moods: { name: Mood; icon: React.ReactNode }[] = [
  { name: "Happy", icon: <Smile className="w-8 h-8" /> },
  { name: "Calm", icon: <Meh className="w-8 h-8" /> },
  { name: "Okay", icon: <Meh className="w-8 h-8" /> },
  { name: "Anxious", icon: <Frown className="w-8 h-8" /> },
  { name: "Sad", icon: <Frown className="w-8 h-8" /> },
];

export interface CheckInFormData {
  mood: Mood;
  painLevel: number;
  entryText: string;
}

export interface DailyCheckInFormProps {
  // Data
  initialPrompt?: string;
  isSubmitting?: boolean;
  
  // Handlers
  onSubmit: (data: CheckInFormData) => void;
  onCancel?: () => void;
  
  // UI State
  disabled?: boolean;
}

export function DailyCheckInForm({
  initialPrompt = "",
  isSubmitting = false,
  onSubmit,
  onCancel,
  disabled = false,
}: DailyCheckInFormProps) {
  const [mood, setMood] = useState<Mood>("Okay");
  const [painLevel, setPainLevel] = useState([3]);
  const [entryText, setEntryText] = useState(initialPrompt);

  useEffect(() => {
    setEntryText(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = () => {
    if (!entryText.trim() || disabled) return;
    
    onSubmit({
      mood,
      painLevel: painLevel[0],
      entryText: entryText.trim(),
    });
  };

  const canSubmit = entryText.trim().length > 0 && !isSubmitting && !disabled;

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline text-primary">Daily Check-In</h2>
        <p className="text-muted-foreground">How are you feeling today?</p>
      </div>
      
      {initialPrompt && (
        <Alert className="bg-primary/5 border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Reflection Prompt</AlertTitle>
          <AlertDescription className="text-sm">
            {initialPrompt}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Mood Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">How are you feeling?</label>
            <div className="flex justify-around">
              {moods.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setMood(m.name)}
                  disabled={disabled}
                  className={`p-3 rounded-full transition-all ${
                    mood === m.name 
                      ? 'bg-accent/20 ring-2 ring-accent scale-110' 
                      : 'opacity-50 hover:opacity-100 hover:scale-105'
                  } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={`Select ${m.name} mood`}
                >
                  <div className={MOOD_CONFIG[m.name].color}>{m.icon}</div>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Selected: <span className="font-medium">{mood}</span>
            </p>
          </div>

          {/* Pain Level */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Pain Level: <span className="font-bold text-primary">{painLevel[0]}</span>/10
            </label>
            <Slider 
              value={painLevel} 
              onValueChange={setPainLevel} 
              max={10} 
              step={1}
              disabled={disabled}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>No pain</span>
              <span>Severe pain</span>
            </div>
          </div>

          {/* Journal Entry */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your thoughts</label>
            <Textarea 
              value={entryText} 
              onChange={(e) => setEntryText(e.target.value)}
              rows={6}
              placeholder="Let it all out... What's on your mind today?"
              disabled={disabled}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCharacterCount(entryText.length)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit} 
          disabled={!canSubmit}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <BookCheck className="mr-2 h-4 w-4" />
              Save Check-In
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
