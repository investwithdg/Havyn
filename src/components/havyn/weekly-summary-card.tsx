"use client";

import React, { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, HeartHandshake, Share2 } from "lucide-react";
import type { JournalEntry, PostpartumProfile } from "@/lib/types";
import { buildWeeklyPostpartumSummary } from "@/lib/weekly-summary";

export function WeeklySummaryCard({
  entries,
  postpartumProfile,
}: {
  entries: JournalEntry[];
  postpartumProfile?: PostpartumProfile | null;
}) {
  const [copied, setCopied] = useState(false);
  const summary = useMemo(
    () => buildWeeklyPostpartumSummary(entries, postpartumProfile),
    [entries, postpartumProfile]
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Havyn 7-day support summary", text: summary.text });
        return;
      }
      await navigator.clipboard.writeText(summary.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to share weekly summary:", error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy weekly summary:", error);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-[#e8e6e3] shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">
            <ClipboardList size={19} />
          </div>
          <div>
            <h2 className="text-base font-semibold">7-day support summary</h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300">
              Copy a plain-language snapshot for a care team, partner, doula, or hotline.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SummaryMetric label="Days" value={`${summary.daysTracked}/7`} />
        <SummaryMetric label="Risk" value={summary.riskLevel} />
        <SummaryMetric label="Sleep" value={summary.avgSleep ? `${summary.avgSleep}h` : "--"} />
      </div>

      <div className="mt-3 rounded-xl bg-black/15 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
          <HeartHandshake size={13} />
          Support focus
        </div>
        <p className="text-xs leading-relaxed text-zinc-300">
          {summary.supportNeeds.length
            ? summary.supportNeeds.join(", ")
            : summary.daysTracked
              ? "No repeated support need flagged this week."
              : "Start checking in to build a useful weekly pattern."}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShare}
          disabled={!summary.daysTracked}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:bg-zinc-600 disabled:text-zinc-300"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!summary.daysTracked}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:bg-zinc-600 disabled:text-zinc-300"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/15 p-3 text-center">
      <p className="text-[11px] text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold capitalize text-white">{value}</p>
    </div>
  );
}
