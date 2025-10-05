"use client";

import { useState, useTransition, useEffect } from "react";
import { Smile, Meh, Frown, Sparkles, BookCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { JournalEntry, Mood } from "@/lib/types";
import { analyzeEntryAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const moods: { name: Mood; icon: React.ReactNode }[] = [
  { name: "Happy", icon: <Smile className="w-8 h-8 text-green-500" /> },
  { name: "Calm", icon: <Meh className="w-8 h-8 text-blue-500" /> },
  { name: "Okay", icon: <Meh className="w-8 h-8 text-yellow-500" /> },
  { name: "Anxious", icon: <Frown className="w-8 h-8 text-orange-500" /> },
  { name: "Sad", icon: <Frown className="w-8 h-8 text-gray-500" /> },
];

type DailyCheckInProps = {
  initialPrompt: string;
  onAddJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onEntryAdded: () => void;
};

export function DailyCheckIn({ initialPrompt, onAddJournalEntry, onEntryAdded }: DailyCheckInProps) {
  const [mood, setMood] = useState<Mood>("Okay");
  const [painLevel, setPainLevel] = useState([3]);
  const [entryText, setEntryText] = useState(initialPrompt);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setEntryText(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = () => {
    if (!entryText.trim()) {
      toast({ title: "Please write something in your journal.", variant: "destructive" });
      return;
    }

    startAnalyzing(async () => {
      try {
        const analysis = await analyzeEntryAction({ entryText });
        onAddJournalEntry({ mood, painLevel: painLevel[0], entryText, analysis });
        toast({ title: "Journal entry saved!", description: "Your thoughts are safe with us.", variant: "default" });
      } catch (error) {
        console.error("Analysis failed, saving entry without it.", error)
        onAddJournalEntry({ mood, painLevel: painLevel[0], entryText, analysis: null });
        toast({ title: "Entry saved without analysis", description: "We couldn't analyze your entry right now, but it's saved.", variant: "default" });
      } finally {
        setEntryText("");
        onEntryAdded();
      }
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline text-primary">New Journal Entry</h2>
        <p className="text-muted-foreground">Log your feelings for today.</p>
      </div>
      
      {initialPrompt && (
        <Alert className="bg-primary/5 border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">AI-Suggested Prompt</AlertTitle>
          <AlertDescription>
            {initialPrompt}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium">How are you feeling?</label>
            <div className="flex justify-around pt-2">
              {moods.map((m) => (
                <button key={m.name} onClick={() => setMood(m.name)} className={`p-2 rounded-full transition-all ${mood === m.name ? 'bg-accent/20 ring-2 ring-accent' : 'opacity-50 hover:opacity-100'}`}>
                  {m.icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Pain Level: {painLevel[0]}</label>
            <Slider value={painLevel} onValueChange={setPainLevel} max={10} step={1} />
          </div>
          <div>
            <label className="text-sm font-medium">Your thoughts</label>
            <Textarea value={entryText} onChange={(e) => setEntryText(e.target.value)} rows={8} placeholder="Let it all out..." />
          </div>
        </CardContent>
      </Card>
      <Button onClick={handleSubmit} disabled={isAnalyzing} className="w-full">
        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookCheck className="mr-2 h-4 w-4" />}
        Save Entry
      </Button>
    </div>
  );
}
