"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";

export function CheckInScreen({ 
  onComplete, 
  isSubmitting 
}: { 
  onComplete: (mood: string, pain: number) => void;
  isSubmitting?: boolean;
}) {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [painLevel, setPainLevel] = useState<number>(0);
  
  const feelings = ["Great", "Good", "Okay", "Rough", "Awful"];

  const handleComplete = () => {
    if (selectedFeeling) {
      onComplete(selectedFeeling, painLevel);
    }
  };

  return (
    <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950/20 flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-serif font-medium mb-8 text-center">How are you feeling today?</h2>
        
        <div className="grid grid-cols-1 gap-3 mb-6">
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

        <div className="mb-10 px-2">
            <label className="text-sm font-medium mb-2 block">
              Pain Level: <span className="font-bold text-indigo-600">{painLevel}</span>/10
            </label>
            <input 
              type="range" 
              min="0" max="10" 
              value={painLevel} 
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>None</span>
              <span>Severe</span>
            </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-full bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none flex justify-center items-center"
          disabled={!selectedFeeling || isSubmitting}
          onClick={handleComplete}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Check In"}
        </motion.button>
        
        {selectedFeeling && !isSubmitting && (
          <p className="text-center text-sm text-zinc-500 mt-6 animate-pulse">
            Swipe up to return home, then right to Journal!
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
