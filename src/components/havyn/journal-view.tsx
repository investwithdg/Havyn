"use client";

import { useState, useTransition, useEffect } from "react";
import { format } from "date-fns";
import type { Timestamp } from "firebase/firestore";
import { Smile, Meh, Frown, Sparkles, Plus, Loader2, BookCheck, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { JournalEntry, Mood } from "@/lib/types";
import { analyzeEntryAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

const moods: { name: Mood; icon: React.ReactNode }[] = [
  { name: "Happy", icon: <Smile className="w-8 h-8 text-green-500" /> },
  { name: "Calm", icon: <Meh className="w-8 h-8 text-blue-500" /> },
  { name: "Okay", icon: <Meh className="w-8 h-8 text-yellow-500" /> },
  { name: "Anxious", icon: <Frown className="w-8 h-8 text-orange-500" /> },
  { name: "Sad", icon: <Frown className="w-8 h-8 text-gray-500" /> },
];

function toDate(date: Date | Timestamp): Date {
    return date instanceof Date ? date : date.toDate();
}

export function JournalView({ initialPrompt, onAddJournalEntry, entries, hasTodayEntry, loading }: { initialPrompt: string; onAddJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date' | 'analysis' | 'userId'> & { analysis?: any }) => void; entries: JournalEntry[], hasTodayEntry: boolean, loading: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState<Mood>("Okay");
  const [painLevel, setPainLevel] = useState([3]);
  const [entryText, setEntryText] = useState(initialPrompt);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setEntryText(initialPrompt);
  }, [initialPrompt]);
  
  useEffect(() => {
    if (!loading && entries.length === 0 && !hasTodayEntry) {
      setShowForm(true);
    }
  }, [loading, entries, hasTodayEntry]);

  const handleSubmit = () => {
    if (!entryText.trim()) {
      toast({ title: "Please write something in your journal.", variant: "destructive" });
      return;
    }

    startAnalyzing(async () => {
      try {
        const analysis = await analyzeEntryAction({ entryText });
        onAddJournalEntry({ mood, painLevel: painLevel[0], entryText, analysis });
        setShowForm(false);
        setEntryText("");
        toast({ title: "Journal entry saved!", description: "Your thoughts are safe with us.", variant: "default" });
      } catch (error) {
        onAddJournalEntry({ mood, painLevel: painLevel[0], entryText, analysis: null });
        toast({ title: "Entry saved without analysis", description: "We couldn't analyze your entry right now, but it's saved.", variant: "default" });
        setShowForm(false);
        setEntryText("");
      }
    });
  };

  if (showForm || initialPrompt) {
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline text-primary">Your Journal</h2>
        {!hasTodayEntry && !loading && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4"/> New Entry
          </Button>
        )}
      </div>

      {loading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && entries.length === 0 && !hasTodayEntry && (
         <Alert className="bg-secondary">
         <Info className="h-4 w-4 text-secondary-foreground" />
         <AlertTitle>No entries yet</AlertTitle>
         <AlertDescription>
           Start by creating a new journal entry. Your thoughts will appear here.
         </AlertDescription>
       </Alert>
      )}

      {!loading && entries.sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime()).map(entry => (
        <Card key={entry.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span>{format(toDate(entry.date), 'MMMM d, yyyy')}</span>
              <div className="text-right text-sm font-normal">
                <Badge variant={entry.mood === 'Happy' || entry.mood === 'Calm' ? 'default' : 'secondary'} className="bg-primary/10 text-primary">{entry.mood}</Badge>
                <p className="text-muted-foreground mt-1">Pain: {entry.painLevel}/10</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.entryText}</p>
            {entry.analysis && (
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                  <Sparkles size={16}/> AI Analysis
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} className="cursor-pointer text-muted-foreground"/>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This analysis is generated by AI and may not be perfect.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <p className="text-sm mt-2 text-muted-foreground italic">"{entry.analysis.summary}"</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {entry.analysis.themes.map(theme => <Badge key={theme} variant="outline" className="text-tertiary border-tertiary">{theme}</Badge>)}
                  {entry.analysis.emotions.map(emotion => <Badge key={emotion} variant="outline" className="text-accent border-accent">{emotion}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
