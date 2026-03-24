"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown } from "lucide-react";

export function CheckInScreen({ onComplete }: { onComplete?: () => void }) {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  
  const feelings = ["Great", "Good", "Okay", "Rough", "awful"];

  return (
    <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950/20 flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-serif font-medium mb-8 text-center">How are you feeling today?</h2>
        
        <div className="grid grid-cols-1 gap-3 mb-10">
          {feelings.map(f => (
            <button
              key={f}
              onClick={() => setSelectedFeeling(f)}
              className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                selectedFeeling === f 
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" 
                  : "border-black/5 bg-white shadow-sm dark:bg-zinc-900 dark:border-white/5"
              }`}
            >
              <span className="capitalize font-medium">{f}</span>
              {selectedFeeling === f && <CheckCircle2 size={20} />}
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-full bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
          disabled={!selectedFeeling}
          onClick={onComplete}
        >
          Check In
        </motion.button>
        
        {selectedFeeling && (
          <p className="text-center text-sm text-zinc-500 mt-6 animate-pulse">
            Ready to journal about it? Swipe up to return.
          </p>
        )}
      </div>

      <div className="absolute bottom-8 flex flex-col items-center text-zinc-400 opacity-60">
        <ChevronDown size={20} className="animate-bounce" />
        <span className="text-xs font-medium uppercase tracking-widest mt-2">Swipe Home</span>
      </div>
    </div>
  );
}
