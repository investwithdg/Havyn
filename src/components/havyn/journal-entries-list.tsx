/**
 * Journal Entries List Component
 * Pure UI component - displays journal entries
 * No business logic - receives all data via props
 */

"use client";

import { format } from "date-fns";
import { Sparkles, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { JournalEntry, Mood } from "@/lib/types";
import { toDate } from "@/lib/date-utils";
import { getMoodBadgeClasses, getSkeletonCount } from "@/lib/ui-utils";

export interface JournalEntriesListProps {
  // Data
  entries: JournalEntry[];
  loading?: boolean;
  
  // UI Options
  showAnalysis?: boolean;
  maxEntries?: number;
  
  // Handlers
  onEntryClick?: (entry: JournalEntry) => void;
}

export function JournalEntriesList({
  entries,
  loading = false,
  showAnalysis = true,
  maxEntries,
  onEntryClick,
}: JournalEntriesListProps) {
  if (loading) {
    const skeletonCount = getSkeletonCount(entries.length || 3);
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Alert className="bg-secondary/50">
        <Info className="h-4 w-4" />
        <AlertTitle>No entries yet</AlertTitle>
        <AlertDescription>
          Your journal entries will appear here once you start writing.
        </AlertDescription>
      </Alert>
    );
  }

  const sortedEntries = [...entries]
    .sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())
    .slice(0, maxEntries);

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => (
        <Card 
          key={entry.id}
          className={`transition-all ${
            onEntryClick ? 'cursor-pointer hover:shadow-md hover:border-primary/20' : ''
          }`}
          onClick={() => onEntryClick?.(entry)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-start text-base">
              <span className="font-medium">
                {format(toDate(entry.date), 'EEEE, MMMM d, yyyy')}
              </span>
              <div className="text-right space-y-1">
                <Badge 
                  variant="outline" 
                  className={getMoodBadgeClasses(entry.mood)}
                >
                  {entry.mood}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Pain: {entry.painLevel}/10
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 mb-4">
              {entry.entryText}
            </p>
            
            {showAnalysis && entry.analysis && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="font-medium text-sm text-primary">AI Analysis</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">AI-generated insights about your entry</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <p className="text-xs text-muted-foreground italic mb-3">
                  "{entry.analysis.summary}"
                </p>
                
                <div className="flex gap-1 flex-wrap">
                  {entry.analysis.themes?.slice(0, 3).map((theme) => (
                    <Badge 
                      key={theme} 
                      variant="outline" 
                      className="text-xs bg-primary/5 text-primary border-primary/20"
                    >
                      {theme}
                    </Badge>
                  ))}
                  {entry.analysis.emotions?.slice(0, 3).map((emotion) => (
                    <Badge 
                      key={emotion} 
                      variant="outline" 
                      className="text-xs bg-accent/5 text-accent border-accent/20"
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
