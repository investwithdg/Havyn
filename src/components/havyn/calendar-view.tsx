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

const moodColors: Record<Mood, string> = {
  Happy: "bg-green-500",
  Calm: "bg-blue-500",
  Okay: "bg-yellow-500",
  Anxious: "bg-orange-500",
  Sad: "bg-gray-500",
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
    return (
      <div className="relative flex items-center justify-center h-full">
        {(props as any).children || date.getDate()}
        <div
          className={cn(
            "absolute bottom-1 w-1.5 h-1.5 rounded-full",
            moodColors[entry.mood]
          )}
        />
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
    <div className="relative flex h-full flex-col overflow-y-auto px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]" data-scrollable="true">
      {/* Wayfinding */}
      <div className="absolute top-1/2 -right-6 -translate-y-1/2 opacity-30 text-xs font-medium uppercase tracking-widest text-zinc-400 rotate-90 origin-right">
         <span className="flex items-center gap-1">Swipe Home</span>
      </div>
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Your Journey</CardTitle>
          <CardDescription>Visualize your mood and pain trends over time.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center overflow-x-auto">
          <DayPicker
            mode="single"
            showOutsideDays
            className="p-0"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-accent/20 focus:bg-accent/20",
              day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              day_today: "bg-primary/10 text-primary rounded-full",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
            }}
            components={{
              Day: (props) => <CustomDay {...props} entries={entries} />,
            }}
          />
        </CardContent>
        <CardContent>
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs">
                {Object.entries(moodColors).map(([mood, colorClass]) => (
                    <div key={mood} className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", colorClass)}></div>
                        <span>{mood}</span>
                    </div>
                ))}
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
              <div className="h-[140px] bg-gradient-to-b from-[#E09D00]/5 to-transparent rounded-xl flex flex-col items-center justify-center gap-3 border border-[#E09D00]/20">
                <div className="w-10 h-10 rounded-full bg-[#E09D00]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#E09D00]" />
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
                    className="text-xs h-7 border-[#E09D00]/40 text-[#E09D00] hover:bg-[#E09D00]/10"
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
