"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Loader2, Moon, ShieldAlert } from "lucide-react";
import type { BondingLevel, ConcernLevel, Mood, PostpartumSignals, SupportLevel } from "@/lib/types";

const MOODS: Array<{ label: string; value: Mood }> = [
  { label: "Steady", value: "Calm" },
  { label: "Okay", value: "Okay" },
  { label: "Tender", value: "Sad" },
  { label: "Anxious", value: "Anxious" },
  { label: "Good", value: "Happy" },
];

const CONCERN_OPTIONS: Array<{ label: string; value: ConcernLevel }> = [
  { label: "None", value: "none" },
  { label: "Mild", value: "mild" },
  { label: "Moderate", value: "moderate" },
  { label: "Severe", value: "severe" },
];

const BONDING_OPTIONS: Array<{ label: string; value: BondingLevel }> = [
  { label: "Connected", value: "connected" },
  { label: "Mixed", value: "mixed" },
  { label: "Distant", value: "distant" },
  { label: "Distressed", value: "distressed" },
];

const SUPPORT_OPTIONS: Array<{ label: string; value: SupportLevel }> = [
  { label: "Strong", value: "strong" },
  { label: "Some", value: "some" },
  { label: "Limited", value: "limited" },
  { label: "None today", value: "none_today" },
];

export function CheckInScreen({
  onComplete,
  isSubmitting
}: {
  onComplete: (mood: Mood, pain: number, postpartum: PostpartumSignals) => void;
  isSubmitting?: boolean;
}) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [painLevel, setPainLevel] = useState(0);
  const [anxietyLevel, setAnxietyLevel] = useState(0);
  const [overwhelmLevel, setOverwhelmLevel] = useState(0);
  const [sleepHours, setSleepHours] = useState(4);
  const [sleepQuality, setSleepQuality] = useState<ConcernLevel>("mild");
  const [recoveryConcern, setRecoveryConcern] = useState<ConcernLevel>("none");
  const [feedingStress, setFeedingStress] = useState<ConcernLevel>("none");
  const [intrusiveThoughts, setIntrusiveThoughts] = useState<ConcernLevel>("none");
  const [thoughtsFeelUncontrollable, setThoughtsFeelUncontrollable] = useState(false);
  const [harmConcern, setHarmConcern] = useState(false);
  const [notFeelingSafe, setNotFeelingSafe] = useState(false);
  const [bonding, setBonding] = useState<BondingLevel>("mixed");
  const [supportToday, setSupportToday] = useState<SupportLevel>("some");
  const [safetyConcern, setSafetyConcern] = useState(false);

  const handleComplete = () => {
    if (!selectedMood) return;

    onComplete(selectedMood, painLevel, {
      anxietyLevel,
      overwhelmLevel,
      sleepHours,
      sleepQuality,
      recoveryConcern,
      feedingStress,
      intrusiveThoughts,
      unwantedScaryThoughts: intrusiveThoughts,
      thoughtsFeelUncontrollable,
      harmConcern,
      notFeelingSafe,
      bonding,
      supportToday,
      safetyConcern: safetyConcern || harmConcern || notFeelingSafe,
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-indigo-50 px-5 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] dark:bg-indigo-950/20" data-scrollable="true">
      <div className="mx-auto w-full max-w-sm py-4">
        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500/70">Postpartum check-in</p>
          <h2 className="mt-2 font-serif text-2xl font-medium text-zinc-900 dark:text-zinc-100">How are you today?</h2>
        </div>

        <section className="mb-5">
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Mood right now</p>
          <div className="grid grid-cols-1 gap-2.5">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 py-3 transition-all ${
                  selectedMood === mood.value
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                    : "border-black/5 bg-white shadow-sm dark:border-white/5 dark:bg-zinc-900"
                }`}
              >
                <span className="font-medium">{mood.label}</span>
                {selectedMood === mood.value && <CheckCircle2 size={18} />}
              </button>
            ))}
          </div>
        </section>

        <SliderField label="Pain or physical discomfort" value={painLevel} onChange={setPainLevel} />
        <SliderField label="Anxiety" value={anxietyLevel} onChange={setAnxietyLevel} />
        <SliderField label="Overwhelm" value={overwhelmLevel} onChange={setOverwhelmLevel} />
        <SliderField label="Sleep in the last 24 hours" value={sleepHours} onChange={setSleepHours} min={0} max={12} suffix="hrs" icon={<Moon size={15} />} />

        <SegmentedField label="Sleep quality" value={sleepQuality} options={CONCERN_OPTIONS} onChange={setSleepQuality} />
        <SegmentedField label="Recovery concern" value={recoveryConcern} options={CONCERN_OPTIONS} onChange={setRecoveryConcern} />
        <SegmentedField label="Feeding stress" value={feedingStress} options={CONCERN_OPTIONS} onChange={setFeedingStress} />
        <SegmentedField label="Unwanted scary thoughts" value={intrusiveThoughts} options={CONCERN_OPTIONS} onChange={setIntrusiveThoughts} />

        <div className="mb-5 space-y-2">
          <SafetyToggle
            label="These thoughts feel hard to control."
            checked={thoughtsFeelUncontrollable}
            onChange={setThoughtsFeelUncontrollable}
          />
          <SafetyToggle
            label="I am afraid I may hurt myself or someone else."
            checked={harmConcern}
            onChange={setHarmConcern}
            urgent
          />
          <SafetyToggle
            label="I do not feel safe right now."
            checked={notFeelingSafe}
            onChange={setNotFeelingSafe}
            urgent
          />
        </div>

        <SegmentedField label="Connection with baby" value={bonding} options={BONDING_OPTIONS} onChange={setBonding} />
        <SegmentedField label="Support today" value={supportToday} options={SUPPORT_OPTIONS} onChange={setSupportToday} />

        <button
          type="button"
          onClick={() => setSafetyConcern((current) => !current)}
          className={`mb-5 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
            safetyConcern
              ? "border-red-400 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
              : "border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/5 dark:bg-zinc-900 dark:text-zinc-300"
          }`}
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="text-sm leading-relaxed">
            I need urgent support from a real person right now.
          </span>
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center rounded-full bg-indigo-600 py-4 font-medium text-white shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
          disabled={!selectedMood || isSubmitting}
          onClick={handleComplete}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Check-In"}
        </motion.button>

        {selectedMood && !isSubmitting && (
          <p className="mt-5 text-center text-sm text-zinc-500">
            Havyn will use this to reflect patterns, not diagnose you.
          </p>
        )}
      </div>

      <div className="pointer-events-none sticky bottom-[max(1rem,env(safe-area-inset-bottom))] flex flex-col items-center text-zinc-400 opacity-60">
        <ChevronDown size={20} className="animate-bounce" />
        <span className="mt-2 text-xs font-medium uppercase tracking-widest">Swipe Home</span>
      </div>
    </div>
  );
}

function SafetyToggle({
  label,
  checked,
  onChange,
  urgent,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  urgent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left text-sm transition-all ${
        checked
          ? urgent
            ? "border-red-400 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
            : "border-indigo-500 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200"
          : "border-black/5 bg-white text-zinc-700 shadow-sm dark:border-white/5 dark:bg-zinc-900 dark:text-zinc-300"
      }`}
    >
      <span className="leading-relaxed">{label}</span>
      <span className={`mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${checked ? urgent ? "bg-red-500" : "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-700"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  suffix = "/10",
  icon,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-zinc-900">
      <label className="mb-3 flex items-center justify-between gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <span className="flex items-center gap-2">{icon}{label}</span>
        <span className="font-bold text-indigo-600">{value}{suffix}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-indigo-200 accent-indigo-600"
      />
    </div>
  );
}

function SegmentedField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              value === option.value
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                : "border-black/5 bg-white text-zinc-600 shadow-sm dark:border-white/5 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
