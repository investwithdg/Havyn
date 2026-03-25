"use client";

import React from "react";
import { PhoneCall, AlertTriangle, ShieldCheck, ChevronUp, Heart, ExternalLink } from "lucide-react";

const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", url: "tel:988" },
  { name: "Crisis Text Line", contact: "Text HOME to 741741", url: "sms:741741?body=HOME" },
  { name: "SAMHSA Helpline", contact: "1-800-662-4357", url: "tel:18006624357" },
];

export function EscalateScreen() {
  return (
    <div className="w-full h-full bg-stone-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
      <div className="absolute top-8 flex flex-col items-center text-zinc-400 opacity-60">
        <span className="text-xs font-medium uppercase tracking-widest mb-2">Swipe Home</span>
        <ChevronUp size={20} className="animate-bounce" />
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-red-900/30">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>

        <h2 className="text-xl font-semibold mb-3">Noticeable Patterns</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
          Your recent check-ins show a persistent trend of difficult days over the last two weeks. Sometimes we all need a little extra support.
        </p>

        {/* Action buttons — always available, never gated */}
        <div className="space-y-3">
          <button
            onClick={() => { /* TODO: Contact professional flow */ }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            <PhoneCall size={18} />
            <span>Contact Professional</span>
          </button>

          <button
            onClick={() => { /* TODO: Generate status report flow */ }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium hover:bg-zinc-200 transition-colors"
          >
            <ShieldCheck size={18} />
            <span>Generate Status Report</span>
          </button>
        </div>

        {/* Free crisis resources — always visible */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={14} className="text-red-400" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Immediate Help
            </span>
          </div>
          <div className="space-y-2">
            {CRISIS_RESOURCES.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors group"
              >
                <div>
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {resource.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {resource.contact}
                  </p>
                </div>
                <ExternalLink size={12} className="text-zinc-400 group-hover:text-red-500 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
