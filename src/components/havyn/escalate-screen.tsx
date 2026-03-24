"use client";

import React from "react";
import { PhoneCall, AlertTriangle, ShieldCheck, ChevronUp } from "lucide-react";

export function EscalateScreen() {
  return (
    <div className="w-full h-full bg-stone-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-8 flex flex-col items-center text-zinc-400 opacity-60">
        <span className="text-xs font-medium uppercase tracking-widest mb-2">Swipe Home</span>
        <ChevronUp size={20} className="animate-bounce" />
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-red-900/30">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="text-xl font-semibold mb-3">Noticeable Patterns</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
          Your recent check-ins show a persistent trend of difficult days over the last two weeks. Sometimes we all need a little extra support.
        </p>
        
        <div className="space-y-4">
          <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
            <PhoneCall size={18} />
            <span>Contact Professional</span>
          </button>
          
          <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium hover:bg-zinc-200 transition-colors">
            <ShieldCheck size={18} />
            <span>Generate Status Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
