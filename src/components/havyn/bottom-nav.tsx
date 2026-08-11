"use client";

import { motion } from "framer-motion";
import { CalendarDays, Home, NotebookPen, PhoneCall, SquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreenKey } from "@/components/havyn/swipe-container";

type NavDestination = ScreenKey | "check-in";

const TABS: Array<{ key: NavDestination; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "journal", label: "Journal", icon: NotebookPen },
  { key: "home", label: "Home", icon: Home },
  { key: "check-in", label: "Check-in", icon: SquarePlus },
];

export function BottomNav({
  activeScreen,
  onNavigate,
  onOpenCheckIn,
  onOpenSupport,
}: {
  activeScreen: ScreenKey;
  onNavigate: (screen: ScreenKey) => void;
  onOpenCheckIn: () => void;
  onOpenSupport: () => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-center gap-1 border-t border-border bg-card/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg"
      aria-label="Primary"
    >
      <div className="mx-auto flex w-full max-w-sm items-stretch justify-between">
        {TABS.map((tab) => {
          const isActive = tab.key === "check-in" ? false : tab.key === activeScreen;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => (tab.key === "check-in" ? onOpenCheckIn() : onNavigate(tab.key))}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
              <span className={cn("text-[10px] font-medium leading-none", isActive ? "text-primary" : "text-muted-foreground")}>
                {tab.label}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenSupport}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-destructive"
          aria-label="Get support now"
        >
          <PhoneCall size={20} />
          <span className="text-[10px] font-medium leading-none">Support</span>
        </button>
      </div>
    </nav>
  );
}
