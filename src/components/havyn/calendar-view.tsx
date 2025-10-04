"use client";

import { DayPicker, type DayProps } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { JournalEntry, Mood } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

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
        {props.children}
        <div
          className={cn(
            "absolute bottom-1 w-1.5 h-1.5 rounded-full",
            moodColors[entry.mood]
          )}
        />
      </div>
    );
  }
  return <>{props.children}</>;
}

export function CalendarView({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">Your Journey</CardTitle>
          <CardDescription>Visualize your mood and pain trends over time.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
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
    </div>
  );
}
