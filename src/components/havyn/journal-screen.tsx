"use client";

import React, { useState } from "react";
import { PenTool, Check, Loader2 } from "lucide-react";
import { formatCharacterCount } from "@/lib/ui-utils";

export function JournalScreen({
  prompt,
  isSubmitting,
  onSubmit
}: {
  prompt?: string;
  isSubmitting?: boolean;
  onSubmit?: (content: string) => void;
}) {
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (content.trim() && onSubmit) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <div className="w-full h-full bg-[#fdfbf7] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 flex flex-col pt-16 px-6 relative">
      <div className="flex items-center justify-between mb-8 opacity-70">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#d4c5b0] dark:text-zinc-500">
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

      {prompt && (
        <div className="mb-6 opacity-40 italic font-serif text-sm border-l-2 border-[#d4c5b0] pl-3">
          {prompt}
        </div>
      )}

      <textarea 
        className="w-full flex-grow bg-transparent resize-none text-lg leading-relaxed font-serif placeholder:text-[#d4c5b0]/50 dark:placeholder:text-zinc-700 outline-none pb-20"
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
      />
      
      <div className="absolute bottom-6 right-6 opacity-30 text-xs font-medium uppercase tracking-widest text-[#d4c5b0] dark:text-zinc-500 flex items-center gap-2">
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
