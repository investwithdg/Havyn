"use client";

import React, { useState } from "react";
import { PenTool } from "lucide-react";

export function JournalScreen() {
  const [content, setContent] = useState("");

  return (
    <div className="w-full h-full bg-[#fdfbf7] text-zinc-800 flex flex-col pt-16 px-6 relative">
      <div className="flex items-center justify-between mb-8 opacity-50">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#d4c5b0]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</span>
        <PenTool size={16} className="text-[#d4c5b0]" />
      </div>

      <textarea 
        className="w-full flex-grow bg-transparent -outline-none resize-none text-lg leading-relaxed font-serif placeholder:text-[#d4c5b0]/50 outline-none"
        placeholder="Start writing..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      
      {/* Decorative paper texture or line */}
      <div className="absolute top-0 left-0 w-8 h-full border-r border-red-100/50" />
    </div>
  );
}
