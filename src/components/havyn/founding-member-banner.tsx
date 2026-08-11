"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const DISMISS_KEY = "havyn_founding_banner_dismissed";
const MAX_FOUNDING_MEMBERS = 100;

interface FoundingMemberBannerProps {
  currentCount: number;
  onStartTrial: () => void;
}

export function FoundingMemberBanner({
  currentCount,
  onStartTrial,
}: FoundingMemberBannerProps) {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISS_KEY) === "true";
    setDismissed(wasDismissed);
  }, []);

  if (dismissed || currentCount >= MAX_FOUNDING_MEMBERS) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  const spotsLeft = MAX_FOUNDING_MEMBERS - currentCount;
  const progress = (currentCount / MAX_FOUNDING_MEMBERS) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute left-4 right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 rounded-2xl border border-accent/30 bg-accent/10 dark:bg-accent/5 p-4 shadow-lg backdrop-blur-sm"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-accent/60" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <Crown className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Become a Founding Member
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              $4.99/mo for life — only {spotsLeft} spots left
            </p>

            <div className="mt-2 space-y-1.5">
              <Progress value={progress} className="h-1.5" />
              <p className="text-[10px] text-muted-foreground">
                {currentCount}/{MAX_FOUNDING_MEMBERS} founding members
              </p>
            </div>

            <Button
              size="sm"
              className="mt-2 h-7 text-xs bg-accent hover:bg-accent/90 text-white"
              onClick={onStartTrial}
            >
              Claim Your Spot
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
