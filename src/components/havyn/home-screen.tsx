"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Baby,
  CalendarDays,
  Crown,
  HeartHandshake,
  Menu,
  Moon,
  NotebookPen,
  PhoneCall,
  Settings,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SettingsScreen } from "@/components/havyn/settings-screen";
import { FoundingMemberBanner } from "@/components/havyn/founding-member-banner";
import type { PremiumFeature } from "@/services/subscription-service";
import type { UseSubscriptionReturn } from "@/hooks/use-subscription";
import type { JournalEntry, PostpartumProfile, RiskLevel } from "@/lib/types";
import { toDate, isSameDay } from "@/lib/date-utils";

export function HomeScreen({
  user,
  onSignOut,
  encouragement,
  prompt,
  journalEntries = [],
  postpartumProfile,
  isPremium = false,
  triggerPaywall,
  subscription,
  onManageSubscription,
  onOpenProfile,
  onOpenSupport,
  foundingMemberCount,
}: {
  user: any;
  onSignOut: () => void;
  encouragement?: string;
  prompt?: string;
  journalEntries?: JournalEntry[];
  postpartumProfile?: PostpartumProfile | null;
  isPremium?: boolean;
  triggerPaywall?: (feature: PremiumFeature) => void;
  subscription?: UseSubscriptionReturn;
  onManageSubscription?: () => void;
  onOpenProfile?: () => void;
  onOpenSupport?: () => void;
  foundingMemberCount?: number;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const latestEntry = useMemo(() => getLatestEntry(journalEntries), [journalEntries]);
  const todayEntry = useMemo(() => getTodayEntry(journalEntries), [journalEntries]);
  const trends = useMemo(() => getSevenDayTrends(journalEntries), [journalEntries]);
  const riskLevel = todayEntry?.risk?.level ?? "low";
  const postpartumWeek = getCurrentPostpartumWeek(postpartumProfile);
  const latestEntryLabel = latestEntry && !todayEntry ? formatEntryAge(latestEntry) : null;
  const displayName = user?.displayName?.split(" ")?.[0] || "there";

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-emerald-50 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] dark:bg-zinc-950" data-scrollable="true">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <header className="flex items-start justify-between gap-4 pt-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-300/70">Today</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Hi, {displayName}</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {postpartumWeek ? `Postpartum week ${postpartumWeek}` : "Set your postpartum profile for better support"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </header>

        {!isPremium && triggerPaywall && foundingMemberCount !== undefined && (
          <FoundingMemberBanner
            currentCount={foundingMemberCount}
            onStartTrial={() => triggerPaywall("unlimited_ai_prompts")}
          />
        )}

        <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-emerald-900/30 dark:bg-zinc-900">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                {todayEntry ? "You checked in today" : "Start with a quick check-in"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {todayEntry
                  ? getCheckInSummary(todayEntry)
                  : "Swipe down to tell Havyn how your body, mind, sleep, feeding, and support are doing."}
              </p>
            </div>
            <StatusBadge riskLevel={riskLevel} hasTodayEntry={!!todayEntry} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MetricTile icon={<Moon size={15} />} label="Sleep" value={formatSleep(todayEntry)} />
            <MetricTile icon={<AlertTriangle size={15} />} label="Anxiety" value={formatScore(todayEntry?.postpartum?.anxietyLevel)} />
            <MetricTile icon={<HeartHandshake size={15} />} label="Support" value={formatSupport(todayEntry?.postpartum?.supportToday)} />
          </div>
          {latestEntryLabel && (
            <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Latest saved check-in was {latestEntryLabel}. Today metrics will fill in after a new check-in.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center gap-2">
            <NotebookPen size={17} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Havyn reflection</h2>
          </div>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {prompt || encouragement || "After your next check-in, Havyn will offer one grounded reflection or next step for the moment you are in."}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onOpenSupport}
            className="flex min-h-24 flex-col justify-between rounded-2xl border border-red-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-red-50 dark:border-red-900/30 dark:bg-zinc-900 dark:hover:bg-red-950/20"
          >
            <PhoneCall size={20} className="text-red-500" />
            <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Get support now</span>
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex min-h-24 flex-col justify-between rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-blue-50 dark:border-blue-900/30 dark:bg-zinc-900 dark:hover:bg-blue-950/20"
          >
            <User size={20} className="text-blue-500" />
            <span className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Update profile</span>
          </button>
        </section>

        <section className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">7-day pattern</h2>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{trends.count}/7 days</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <TrendTile label="Mood" value={trends.mostCommonMood || "--"} />
            <TrendTile label="Avg anxiety" value={trends.avgAnxiety ?? "--"} />
            <TrendTile label="Avg sleep" value={trends.avgSleep ? `${trends.avgSleep}h` : "--"} />
          </div>
        </section>

        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 text-center dark:border-emerald-900/30 dark:bg-zinc-900/80">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-300/70">Navigation</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Swipe down for check-in, right for calendar, left for journal, up for support.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-sm flex-col gap-2 rounded-[1.5rem] border border-zinc-100 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Menu</span>
                {isPremium && (
                  <Badge variant="secondary" className="bg-[#E09D00]/15 text-[#E09D00] text-[10px] px-1.5 py-0">
                    <Crown className="w-3 h-3 mr-0.5" />
                    Premium
                  </Badge>
                )}
              </div>
              <button onClick={() => setMenuOpen(false)} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={16} />
              </button>
            </div>
            <MenuButton icon={<User size={20} className="text-blue-500" />} label="Profile" onClick={() => { setMenuOpen(false); onOpenProfile?.(); }} />
            <MenuButton icon={<Settings size={20} className="text-zinc-500" />} label="Settings" onClick={() => { setMenuOpen(false); setSettingsOpen(true); }} />
            <MenuButton icon={<ShieldAlert size={20} />} label="Sign Out" danger onClick={onSignOut} />
          </motion.div>
        )}
      </AnimatePresence>

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

function getLatestEntry(entries: JournalEntry[]) {
  return [...entries].sort((a, b) => toDate(b.date).getTime() - toDate(a.date).getTime())[0];
}

function getTodayEntry(entries: JournalEntry[]) {
  const today = new Date();
  return entries.find((entry) => isSameDay(entry.date, today));
}

function getCurrentPostpartumWeek(profile?: PostpartumProfile | null) {
  const week = getRawPostpartumWeek(profile);
  if (!week) return undefined;
  return week <= 12 ? week : `${week} - transition`;
}

function getRawPostpartumWeek(profile?: PostpartumProfile | null) {
  if (profile?.babyBirthDate) {
    const birthDate = new Date(`${profile.babyBirthDate}T00:00:00`);
    if (!Number.isNaN(birthDate.getTime()) && birthDate <= new Date()) {
      return Math.max(1, Math.floor((Date.now() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
    }
  }

  return profile?.postpartumWeek;
}

function getCheckInSummary(entry: JournalEntry) {
  const parts = [`Mood: ${entry.mood}`];
  if (entry.postpartum?.overwhelmLevel !== undefined) parts.push(`overwhelm ${entry.postpartum.overwhelmLevel}/10`);
  if (entry.postpartum?.recoveryConcern && entry.postpartum.recoveryConcern !== "none") parts.push(`${entry.postpartum.recoveryConcern} recovery concern`);
  return parts.join(". ");
}

function getSevenDayTrends(entries: JournalEntry[]) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);

  const recent = entries.filter((entry) => toDate(entry.date) >= cutoff);
  const anxiety = recent.map((entry) => entry.postpartum?.anxietyLevel).filter((value): value is number => typeof value === "number");
  const sleep = recent.map((entry) => entry.postpartum?.sleepHours).filter((value): value is number => typeof value === "number");
  const moodCounts = recent.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] ?? 0) + 1;
    return acc;
  }, {});

  return {
    count: recent.length,
    avgAnxiety: anxiety.length ? Math.round(anxiety.reduce((sum, value) => sum + value, 0) / anxiety.length) : null,
    avgSleep: sleep.length ? Math.round((sleep.reduce((sum, value) => sum + value, 0) / sleep.length) * 10) / 10 : null,
    mostCommonMood: Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0],
  };
}

function StatusBadge({ riskLevel, hasTodayEntry }: { riskLevel: RiskLevel; hasTodayEntry: boolean }) {
  const className = riskLevel === "urgent"
    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-200"
    : riskLevel === "elevated"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
      : hasTodayEntry
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${className}`}>
      {hasTodayEntry ? riskLevel : "Open"}
    </span>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
      <div className="mb-2 text-emerald-700 dark:text-emerald-300">{icon}</div>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function TrendTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-950">
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function MenuButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
        danger ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function formatScore(value?: number) {
  return typeof value === "number" ? `${value}/10` : "--";
}

function formatSleep(entry?: JournalEntry) {
  return typeof entry?.postpartum?.sleepHours === "number" ? `${entry.postpartum.sleepHours}h` : "--";
}

function formatSupport(value?: string) {
  if (!value) return "--";
  return value.replace("_", " ");
}

function formatEntryAge(entry: JournalEntry) {
  const date = toDate(entry.date);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
