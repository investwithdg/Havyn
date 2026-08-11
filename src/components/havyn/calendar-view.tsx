"use client";

import { useMemo } from "react";
import { DayPicker, type DayProps } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import { Lock, TrendingUp } from "lucide-react";
import type { JournalEntry, Mood } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";
import type { PremiumFeature } from "@/services/subscription-service";

const moodStyles: Record<Mood, { bg: string; text: string; dot: string }> = {
  Happy: { bg: "bg-primary/15", text: "text-primary", dot: "bg-primary" },
  Calm: { bg: "bg-tertiary/15", text: "text-tertiary", dot: "bg-tertiary" },
  Okay: { bg: "bg-accent/20", text: "text-accent-foreground", dot: "bg-accent" },
  Anxious: { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  Sad: { bg: "bg-zinc-400/15", text: "text-zinc-600 dark:text-zinc-300", dot: "bg-zinc-400" },
};

function toDate(date: Date | Timestamp): Date {
    return date instanceof Date ? date : date.toDate();
}

function CustomDay(props: DayProps & { entries: JournalEntry[] }) {
  const { date, entries } = props;
  const entry = entries.find(
    (e) => {
        const entryDate = toDate(e.date);
        return entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear();
    }
  );

  if (entry) {
    const style = moodStyles[entry.mood];
    const notablePain = entry.painLevel >= 6;
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-xl font-medium",
          style.bg,
          style.text,
          notablePain && "ring-2 ring-destructive/60"
        )}
      >
        {(props as any).children || date.getDate()}
        <div className={cn("absolute bottom-1 h-1 w-1 rounded-full", style.dot)} />
      </div>
    );
  }
  return <>{(props as any).children || date.getDate()}</>;
}

const MOOD_VALUES: Record<Mood, number> = {
  Happy: 5,
  Calm: 4,
  Okay: 3,
  Anxious: 2,
  Sad: 1,
};

function TrendChart({ entries }: { entries: JournalEntry[] }) {
  const chartData = useMemo(() => {
    const sorted = [...entries]
      .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime())
      .slice(-30);

    return sorted.map((entry) => {
      const d = toDate(entry.date);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        mood: MOOD_VALUES[entry.mood] ?? 3,
        pain: entry.painLevel,
      };
    });
  }, [entries]);

  if (chartData.length < 2) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Keep journaling to see your trends!
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis yAxisId="mood" domain={[1, 5]} tick={{ fontSize: 10 }} hide />
        <YAxis yAxisId="pain" domain={[0, 10]} orientation="right" tick={{ fontSize: 10 }} hide />
        <Tooltip />
        <Area yAxisId="mood" type="monotone" dataKey="mood" stroke="#4ecdc4" fill="#4ecdc4" fillOpacity={0.2} name="Mood" />
        <Line yAxisId="pain" type="monotone" dataKey="pain" stroke="#ff6b6b" strokeWidth={2} dot={false} name="Pain" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function CalendarView({
  entries,
  isPremium = false,
  triggerPaywall,
}: {
  entries: JournalEntry[];
  isPremium?: boolean;
  triggerPaywall?: (feature: PremiumFeature) => void;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-y-auto px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))]" data-scrollable="true">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Your Journey</CardTitle>
          <CardDescription>Visualize your mood and pain trends over time.</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <DayPicker
            mode="single"
            showOutsideDays
            className="w-full p-0"
            classNames={{
              months: "flex flex-col w-full",
              month: "w-full space-y-3",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              table: "w-full border-collapse",
              head_row: "grid grid-cols-7",
              head_cell: "text-muted-foreground font-normal text-[0.75rem] text-center pb-1",
              row: "grid grid-cols-7 mt-1.5",
              cell: "aspect-square text-center text-sm p-0.5 relative",
              day: "h-full w-full p-0 font-normal aria-selected:opacity-100 rounded-xl hover:bg-accent/20 focus:bg-accent/20",
              day_selected: "!bg-accent !text-accent-foreground",
              day_today: "font-semibold ring-1 ring-primary/40 rounded-xl",
              day_outside: "text-muted-foreground/50",
              day_disabled: "text-muted-foreground opacity-50",
            }}
            components={{
              Day: (props) => <CustomDay {...props} entries={entries} />,
            }}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {Object.entries(moodStyles).map(([mood, style]) => (
              <div key={mood} className="flex items-center gap-1.5">
                <div className={cn("h-2 w-2 rounded-full", style.dot)} />
                <span>{mood}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full ring-2 ring-destructive/60" />
              <span>Notable pain</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends Section */}
      <Card className="mt-4 shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Mood &amp; Pain Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPremium ? (
            <TrendChart entries={entries} />
          ) : (
            <div className="relative">
              <div className="h-[140px] bg-gradient-to-b from-accent/5 to-transparent rounded-xl flex flex-col items-center justify-center gap-3 border border-accent/20">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-foreground">Premium Feature</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    See how your mood and pain change over time with visual trend charts
                  </p>
                </div>
                {triggerPaywall && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 border-accent/40 text-accent hover:bg-accent/10"
                    onClick={() => triggerPaywall("pain_trend_insights")}
                  >
                    Unlock Trends
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
