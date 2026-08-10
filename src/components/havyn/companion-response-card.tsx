"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, HeartHandshake, Share2, ShieldAlert } from "lucide-react";
import type { Mood, PostpartumProfile, PostpartumSignals, RiskAssessment } from "@/lib/types";
import { buildCompanionResponse } from "@/lib/postpartum-companion";

type CompanionResponseCardProps = {
  mood?: Mood;
  painLevel?: number;
  postpartum?: PostpartumSignals | null;
  risk?: RiskAssessment | null;
  profile?: PostpartumProfile | null;
  prompt?: string;
  onOpenSupport?: () => void;
};

export function CompanionResponseCard({
  mood,
  painLevel,
  postpartum,
  risk,
  profile,
  prompt,
  onOpenSupport,
}: CompanionResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const response = useMemo(
    () => buildCompanionResponse({ mood, painLevel, postpartum, risk, profile, prompt }),
    [mood, painLevel, postpartum, risk, profile, prompt]
  );
  const needsSupport = risk?.escalationRecommended;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Havyn check-in", text: response.shareText });
        return;
      }
      await navigator.clipboard.writeText(response.shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to share check-in summary:", error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response.shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy check-in summary:", error);
    }
  };

  return (
    <section className="mb-5 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-emerald-900/30 dark:bg-zinc-900">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
          <HeartHandshake size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-300/70">Havyn noticed</p>
          <h2 className="mt-1 text-base font-semibold text-zinc-950 dark:text-zinc-50">{response.headline}</h2>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{response.reflection}</p>
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Next step</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{response.nextStep}</p>
      </div>

      {response.supportCue && (
        <div className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">{response.supportCue}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {needsSupport && (
          <button
            type="button"
            onClick={onOpenSupport}
            className="col-span-2 rounded-full bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Open Support Options
          </button>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-900 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-zinc-100 px-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </section>
  );
}
