"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, ShieldAlert, X, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SettingsScreen } from "@/components/havyn/settings-screen";
import { FoundingMemberBanner } from "@/components/havyn/founding-member-banner";
import type { PremiumFeature } from "@/services/subscription-service";
import type { UseSubscriptionReturn } from "@/hooks/use-subscription";

export function HomeScreen({
  user,
  onSignOut,
  encouragement,
  prompt,
  isPremium = false,
  triggerPaywall,
  subscription,
  onManageSubscription,
  foundingMemberCount,
}: {
  user: any;
  onSignOut: () => void;
  encouragement?: string;
  prompt?: string;
  isPremium?: boolean;
  triggerPaywall?: (feature: PremiumFeature) => void;
  subscription?: UseSubscriptionReturn;
  onManageSubscription?: () => void;
  foundingMemberCount?: number;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stage, setStage] = useState<"caterpillar" | "chrysalis" | "butterfly">("caterpillar");
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto progression of live depiction over time (example: 5s per stage, looping)
  useEffect(() => {
    const interval = setInterval(() => {
      setStage(prev => {
        if (prev === "caterpillar") return "chrysalis";
        if (prev === "chrysalis") return "butterfly";
        return "caterpillar";
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-zinc-900 dark:to-zinc-800 relative px-6">

      {/* Founding Member Banner */}
      {!isPremium && triggerPaywall && foundingMemberCount !== undefined && (
        <FoundingMemberBanner
          currentCount={foundingMemberCount}
          onStartTrial={() => triggerPaywall("unlimited_ai_prompts")}
        />
      )}

      {/* Dynamic Context - Genkit Prompt */}
      {prompt && !menuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 text-center max-w-sm px-4"
        >
          <p className="text-xl font-serif text-emerald-900 dark:text-emerald-100 leading-relaxed italic">
            "{prompt}"
          </p>
        </motion.div>
      )}

      {/* The Live Depiction Button */}
      <motion.button 
        onClick={() => setMenuOpen(true)}
        className="relative flex items-center justify-center w-32 h-32 rounded-full hover:bg-white/10 transition-colors z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {stage === "caterpillar" && (
            <motion.div
              key="caterpillar"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex gap-1"
            >
              {/* Simple Caterpillar SVG */}
              <svg width="60" height="20" viewBox="0 0 60 20" className="text-emerald-500 fill-current">
                <circle cx="10" cy="10" r="8" />
                <circle cx="24" cy="10" r="8" />
                <circle cx="38" cy="10" r="8" />
                <circle cx="50" cy="9" r="6" />
              </svg>
            </motion.div>
          )}
          
          {stage === "chrysalis" && (
            <motion.div
              key="chrysalis"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {/* Chrysalis SVG */}
              <svg width="30" height="50" viewBox="0 0 30 50" className="text-emerald-700 fill-current">
                <path d="M15 0 C25 10, 30 25, 15 50 C0 25, 5 10, 15 0 Z" />
              </svg>
            </motion.div>
          )}

          {stage === "butterfly" && (
            <motion.div
              key="butterfly"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: [0, -5, 5, 0],
                y: [0, -5, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              exit={{ opacity: 0, scale: 1.5 }}
            >
              {/* Butterfly SVG */}
              <svg width="64" height="64" viewBox="0 0 64 64" className="text-blue-500 fill-current drop-shadow-lg">
                <path d="M32 20 C20 0, 0 10, 10 32 C0 54, 20 64, 32 44 C44 64, 64 54, 54 32 C64 10, 44 0, 32 20 Z" />
                <ellipse cx="32" cy="32" rx="3" ry="12" className="text-zinc-800 fill-current" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dynamic CTA Encouragement */}
      {encouragement && !menuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-32 text-center max-w-[250px]"
        >
          <span className="text-sm font-medium text-emerald-700/60 dark:text-emerald-300/60 bg-white/40 dark:bg-black/20 px-4 py-2 rounded-full shadow-sm backdrop-blur-md">
            {encouragement}
          </span>
        </motion.div>
      )}

      {/* Home Menu Modal/Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl w-64 flex flex-col gap-4 border border-zinc-100 dark:border-zinc-800 z-50"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 px-2">
                <span className="font-semibold">Menu</span>
                {isPremium && (
                  <Badge variant="secondary" className="bg-[#E09D00]/15 text-[#E09D00] text-[10px] px-1.5 py-0">
                    <Crown className="w-3 h-3 mr-0.5" />
                    Premium
                  </Badge>
                )}
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={16} />
              </button>
            </div>
            
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <User size={20} className="text-blue-500" />
              <span className="font-medium text-sm">Profile</span>
            </button>
            
            <button
              onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Settings size={20} className="text-zinc-500" />
              <span className="font-medium text-sm">Settings</span>
            </button>
            
            <button onClick={onSignOut} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
              <ShieldAlert size={20} />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay when menu is open */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Decorative Swipe Help Text */}
      <div className="absolute bottom-12 text-emerald-800/40 dark:text-emerald-100/40 text-[10px] font-bold tracking-widest uppercase flex gap-8 z-0">
        <span className="flex flex-col items-center">
           <span>Check-in</span>
           <span>↓</span>
        </span>
        <span className="flex items-center mx-4 tracking-normal gap-2">← Calendar <span className="mx-2">•</span> Journal →</span>
      </div>

      {/* Settings Sheet */}
      {subscription && triggerPaywall && (
        <SettingsScreen
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          user={user}
          subscription={subscription}
          onSignOut={onSignOut}
          onManageSubscription={onManageSubscription || (() => {})}
          triggerPaywall={triggerPaywall}
        />
      )}
    </div>
  );
}
