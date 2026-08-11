"use client";

import React from "react";
import { format } from "date-fns";
import type { JournalEntry, PostpartumProfile } from "@/lib/types";
import { WeeklySummaryCard } from "@/components/havyn/weekly-summary-card";

export function JournalSidebar({
  entries = [],
  postpartumProfile,
}: {
  entries?: JournalEntry[];
  postpartumProfile?: PostpartumProfile | null;
}) {
  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#3d3d3d] px-5 pt-[max(4rem,env(safe-area-inset-top))] pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] text-[#e8e6e3]" data-scrollable="true">
      {/* Wayfinding */}
      <div className="absolute top-1/2 left-1 -translate-y-1/2 opacity-30 text-xs font-medium uppercase tracking-widest text-zinc-400 -rotate-90 origin-left">
         <span className="flex items-center gap-1">Swipe Journal</span>
      </div>

      <div className="mb-5">
        <WeeklySummaryCard entries={entries} postpartumProfile={postpartumProfile} />
      </div>

      <h2 className="text-xl font-medium mb-6">Past Entries</h2>
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-zinc-500 italic">No previous entries.</p>
        ) : (
          entries.map((entry, idx) => (
            <div key={entry.id || idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-zinc-400 mb-2">
                {entry.date ? format(new Date(entry.date as any), "MMM d, yyyy") : "Unknown date"}
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed">{entry.entryText}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
