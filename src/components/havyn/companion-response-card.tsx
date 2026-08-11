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
    <section className="mb-5 rounded-2xl border border-primary/15 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <HeartHandshake size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Havyn noticed</p>
          <h2 className="mt-1 text-base font-semibold text-foreground">{response.headline}</h2>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground/80">{response.reflection}</p>
      <div className="mt-3 rounded-xl bg-primary/8 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Next step</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{response.nextStep}</p>
      </div>

      {response.supportCue && (
        <div className="mt-3 flex gap-2 rounded-xl bg-accent/10 p-3 text-accent-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">{response.supportCue}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {needsSupport && (
          <button
            type="button"
            onClick={onOpenSupport}
            className="col-span-2 rounded-full bg-destructive py-3 text-sm font-semibold text-white transition-colors hover:bg-destructive/90"
          >
            Open Support Options
          </button>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </section>
  );
}
