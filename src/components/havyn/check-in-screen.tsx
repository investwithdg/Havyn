"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Moon, ShieldAlert, X } from "lucide-react";
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
  onClose,
  isSubmitting
}: {
  onComplete: (mood: Mood, pain: number, postpartum: PostpartumSignals) => void;
  onClose?: () => void;
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
    <div className="relative flex h-full w-full flex-col overflow-y-auto bg-background px-5 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]" data-scrollable="true">
      <div className="mx-auto w-full max-w-sm py-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="w-9" aria-hidden="true" />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Postpartum check-in</p>
            <h2 className="mt-2 font-serif text-2xl font-medium text-foreground">How are you today?</h2>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close check-in"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm"
            >
              <X size={16} />
            </button>
          ) : (
            <div className="w-9" aria-hidden="true" />
          )}
        </div>

        <section className="mb-6">
          <p className="mb-2 text-sm font-medium text-foreground">Mood right now</p>
          <div className="grid grid-cols-1 gap-2.5">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex min-h-12 items-center justify-between rounded-2xl border px-4 py-3 transition-all ${
                  selectedMood === mood.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card"
                }`}
              >
                <span className="font-medium">{mood.label}</span>
                {selectedMood === mood.value && <CheckCircle2 size={18} />}
              </button>
            ))}
          </div>
        </section>

        <SectionLabel>Body</SectionLabel>
        <SliderField label="Pain or physical discomfort" value={painLevel} onChange={setPainLevel} />
        <SliderField label="Sleep in the last 24 hours" value={sleepHours} onChange={setSleepHours} min={0} max={12} suffix="hrs" icon={<Moon size={15} />} />
        <SegmentedField label="Sleep quality" value={sleepQuality} options={CONCERN_OPTIONS} onChange={setSleepQuality} />
        <SegmentedField label="Recovery concern" value={recoveryConcern} options={CONCERN_OPTIONS} onChange={setRecoveryConcern} />
        <SegmentedField label="Feeding stress" value={feedingStress} options={CONCERN_OPTIONS} onChange={setFeedingStress} />

        <SectionLabel>Mind</SectionLabel>
        <SliderField label="Anxiety" value={anxietyLevel} onChange={setAnxietyLevel} />
        <SliderField label="Overwhelm" value={overwhelmLevel} onChange={setOverwhelmLevel} />
        <SegmentedField label="Unwanted scary thoughts" value={intrusiveThoughts} options={CONCERN_OPTIONS} onChange={setIntrusiveThoughts} />

        <div className="mb-6 space-y-2">
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

        <SectionLabel>Connection</SectionLabel>
        <SegmentedField label="Connection with baby" value={bonding} options={BONDING_OPTIONS} onChange={setBonding} />
        <SegmentedField label="Support today" value={supportToday} options={SUPPORT_OPTIONS} onChange={setSupportToday} />

        <button
          type="button"
          onClick={() => setSafetyConcern((current) => !current)}
          className={`mb-6 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
            safetyConcern
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border bg-card text-foreground"
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
          className="flex w-full items-center justify-center rounded-full bg-primary py-4 font-medium text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
          disabled={!selectedMood || isSubmitting}
          onClick={handleComplete}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Check-In"}
        </motion.button>

        {selectedMood && !isSubmitting && (
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Havyn will use this to reflect patterns, not diagnose you.
          </p>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-1 text-xs font-semibold uppercase tracking-widest text-primary/60">{children}</p>
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
            ? "border-destructive/50 bg-destructive/10 text-destructive"
            : "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-foreground"
      }`}
    >
      <span className="leading-relaxed">{label}</span>
      <span className={`mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${checked ? urgent ? "bg-destructive" : "bg-primary" : "bg-muted"}`}>
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
    <div className="mb-4">
      <label className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-foreground">
        <span className="flex items-center gap-2">{icon}{label}</span>
        <span className="font-bold text-primary">{value}{suffix}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/15 accent-primary"
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
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              value === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground/80"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
