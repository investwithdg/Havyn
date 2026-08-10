"use client";

import React, { useState } from "react";
import { PenTool, Check, Loader2 } from "lucide-react";
import { CompanionResponseCard } from "@/components/havyn/companion-response-card";
import { formatCharacterCount } from "@/lib/ui-utils";
import type { Mood, PostpartumProfile, PostpartumSignals, RiskAssessment } from "@/lib/types";

export function JournalScreen({
  prompt,
  isSubmitting,
  onSubmit,
  companionContext,
  onOpenSupport,
}: {
  prompt?: string;
  isSubmitting?: boolean;
  onSubmit?: (content: string) => void;
  companionContext?: {
    mood?: Mood;
    painLevel?: number;
    postpartum?: PostpartumSignals | null;
    risk?: RiskAssessment | null;
    profile?: PostpartumProfile | null;
  } | null;
  onOpenSupport?: () => void;
}) {
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (content.trim() && onSubmit) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#fdfbf7] px-5 pt-[max(4rem,env(safe-area-inset-top))] text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      <div className="mb-6 flex items-center justify-between gap-4 opacity-70">
        <span className="min-w-0 text-xs font-semibold uppercase tracking-widest text-[#d4c5b0] dark:text-zinc-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
        </span>
        
        {/* Save Interaction */}
        <button 
          onClick={handleSave} 
          disabled={!content.trim() || isSubmitting}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-emerald-600 disabled:opacity-30 disabled:text-zinc-400 transition-opacity"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save</>}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))]" data-scrollable="true">
        {companionContext?.postpartum && (
          <CompanionResponseCard
            {...companionContext}
            prompt={prompt}
            onOpenSupport={onOpenSupport}
          />
        )}

        {prompt && (
          <div className="mb-6 opacity-60 italic font-serif text-sm border-l-2 border-[#d4c5b0] pl-3">
            {prompt}
          </div>
        )}

      <textarea 
        className="min-h-[45dvh] w-full resize-none bg-transparent font-serif text-lg leading-relaxed outline-none placeholder:text-[#d4c5b0]/50 dark:placeholder:text-zinc-700"
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
      />
      </div>
      
      <div className="absolute bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] right-5 opacity-30 text-xs font-medium uppercase tracking-widest text-[#d4c5b0] dark:text-zinc-500 flex items-center gap-2">
         {formatCharacterCount(content.length)} <PenTool size={12} />
      </div>

      {/* Wayfinding */}
      <div className="absolute top-1/2 -left-3 -translate-y-1/2 opacity-30 text-xs font-medium uppercase tracking-widest text-[#d4c5b0] dark:text-zinc-500 flex flex-col items-center gap-2 -rotate-90 origin-left">
         <span className="flex items-center gap-1">Swipe Home</span>
      </div>

      {/* Decorative paper texture or line */}
      <div className="absolute top-0 left-0 w-8 h-full border-r border-red-100/50 dark:border-white/5 pointer-events-none" />
    </div>
  );
}
