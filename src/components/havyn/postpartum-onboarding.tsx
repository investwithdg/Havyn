"use client";

import React, { useMemo, useState } from "react";
import { Baby, CalendarDays, HeartHandshake, Loader2, PhoneCall, Stethoscope, UserRound } from "lucide-react";
import type { DeliveryType, FeedingMode, PostpartumProfile } from "@/lib/types";

type PostpartumOnboardingProps = {
  open: boolean;
  initialProfile?: PostpartumProfile | null;
  isSaving?: boolean;
  onSave: (profile: PostpartumProfile) => Promise<void> | void;
  onClose?: () => void;
  mode?: "onboarding" | "edit";
};

const DELIVERY_OPTIONS: Array<{ label: string; value: DeliveryType }> = [
  { label: "Vaginal", value: "vaginal" },
  { label: "C-section", value: "c_section" },
  { label: "VBAC", value: "vbac" },
  { label: "Assisted", value: "assisted" },
  { label: "Loss or other", value: "loss_or_other" },
];

const FEEDING_OPTIONS: Array<{ label: string; value: FeedingMode }> = [
  { label: "Breastfeeding", value: "breastfeeding" },
  { label: "Pumping", value: "pumping" },
  { label: "Formula", value: "formula" },
  { label: "Combo", value: "combo" },
  { label: "Not applicable", value: "not_applicable" },
];

export function PostpartumOnboarding({
  open,
  initialProfile,
  isSaving,
  onSave,
  onClose,
  mode = "onboarding",
}: PostpartumOnboardingProps) {
  const [babyBirthDate, setBabyBirthDate] = useState(initialProfile?.babyBirthDate ?? "");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(initialProfile?.deliveryType ?? "vaginal");
  const [feedingMode, setFeedingMode] = useState<FeedingMode>(initialProfile?.feedingMode ?? "combo");
  const [supportSystem, setSupportSystem] = useState((initialProfile?.supportSystem ?? []).join(", "));
  const legacyEmergencyContact = initialProfile?.emergencyContact ?? "";
  const [careTeam, setCareTeam] = useState(initialProfile?.careTeam ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    initialProfile?.emergencyContactName ?? parseLegacyEmergencyContact(legacyEmergencyContact).name
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    initialProfile?.emergencyContactPhone ?? parseLegacyEmergencyContact(legacyEmergencyContact).phone
  );
  const [aiConsent, setAiConsent] = useState(initialProfile?.consent?.aiSupport ?? false);
  const [formError, setFormError] = useState<string | null>(null);
  const [history, setHistory] = useState({
    depression: initialProfile?.history?.depression ?? false,
    anxiety: initialProfile?.history?.anxiety ?? false,
    bipolarDisorder: initialProfile?.history?.bipolarDisorder ?? false,
    birthTrauma: initialProfile?.history?.birthTrauma ?? false,
    pregnancyComplications: initialProfile?.history?.pregnancyComplications ?? false,
  });

  const birthDateStatus = useMemo(() => {
    if (!babyBirthDate) return { week: undefined, state: "missing" as const };
    const birthDate = new Date(`${babyBirthDate}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return { week: undefined, state: "invalid" as const };
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (birthDate > today) return { week: undefined, state: "future" as const };
    const diffMs = Date.now() - birthDate.getTime();
    const week = Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1);
    return { week, state: week <= 12 ? "active" as const : "transition" as const };
  }, [babyBirthDate]);

  const postpartumWeek = birthDateStatus.week;

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!aiConsent) {
      setFormError("Confirm AI support consent to continue.");
      return;
    }

    if (birthDateStatus.state === "future" || birthDateStatus.state === "invalid") {
      setFormError("Enter a valid birth date that is not in the future.");
      return;
    }

    setFormError(null);
    await onSave({
      babyBirthDate: babyBirthDate || undefined,
      postpartumWeek,
      deliveryType,
      feedingMode,
      supportSystem: supportSystem
        .split(",")
        .map((support) => support.trim())
        .filter(Boolean),
      careTeam: careTeam.trim() || undefined,
      emergencyContact: formatEmergencyContact(emergencyContactName, emergencyContactPhone),
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      history,
      consent: {
        aiSupport: aiConsent,
        reminders: initialProfile?.consent?.reminders ?? false,
        shareReports: initialProfile?.consent?.shareReports ?? false,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[94dvh] w-full max-w-sm overflow-y-auto rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-2xl dark:border-emerald-900/30 dark:bg-zinc-900"
        data-scrollable="true"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600/80">Postpartum profile</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
              {mode === "edit" ? "Update your care context" : "Set up Havyn for you"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Havyn uses this to personalize check-ins, summaries, and support prompts. It is not a medical record.
            </p>
          </div>
          {onClose && mode === "edit" && (
            <button type="button" onClick={onClose} className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              Close
            </button>
          )}
        </div>

        <div className="space-y-4">
          <label className="block rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-950">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <CalendarDays size={16} /> Baby birth date
            </span>
            <input
              type="date"
              value={babyBirthDate}
              onChange={(event) => setBabyBirthDate(event.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
            />
            {birthDateStatus.state === "active" && postpartumWeek && (
              <span className="mt-2 block text-xs text-emerald-700 dark:text-emerald-300">Approx. postpartum week {postpartumWeek} of 12</span>
            )}
            {birthDateStatus.state === "transition" && postpartumWeek && (
              <span className="mt-2 block text-xs text-amber-700 dark:text-amber-300">Approx. week {postpartumWeek}. Havyn will frame this as transition support beyond the first 12 weeks.</span>
            )}
            {(birthDateStatus.state === "future" || birthDateStatus.state === "invalid") && (
              <span className="mt-2 block text-xs text-red-600">Enter a valid birth date that is not in the future.</span>
            )}
          </label>

          <SegmentedField label="Delivery" icon={<Baby size={16} />} value={deliveryType} options={DELIVERY_OPTIONS} onChange={setDeliveryType} />
          <SegmentedField label="Feeding" icon={<HeartHandshake size={16} />} value={feedingMode} options={FEEDING_OPTIONS} onChange={setFeedingMode} />

          <label className="block rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-950">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <HeartHandshake size={16} /> Support people
            </span>
            <textarea
              value={supportSystem}
              onChange={(event) => setSupportSystem(event.target.value)}
              placeholder="Partner, mom, doula, friend"
              rows={2}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="block rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-950">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <Stethoscope size={16} /> Care team
            </span>
            <textarea
              value={careTeam}
              onChange={(event) => setCareTeam(event.target.value)}
              placeholder="OB, midwife, therapist, pediatrician"
              rows={2}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <div className="rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-950">
            <span className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              <UserRound size={16} /> Emergency contact
            </span>
            <div className="space-y-2">
              <label className="block">
                <span className="sr-only">Emergency contact name</span>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(event) => setEmergencyContactName(event.target.value)}
                  placeholder="Name"
                  autoComplete="name"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
                />
              </label>
              <label className="block">
                <span className="sr-only">Emergency contact phone</span>
                <div className="relative">
                  <PhoneCall className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(event) => setEmergencyContactPhone(event.target.value)}
                    placeholder="Phone number"
                    autoComplete="tel"
                    inputMode="tel"
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              </label>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-left dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(event) => setAiConsent(event.target.checked)}
              className="mt-1 h-5 w-5 rounded border-emerald-300 text-emerald-600"
            />
            <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              I understand Havyn uses AI to offer postpartum reflection and planning support. It is not medical care, a diagnosis, or emergency support.
            </span>
          </label>

          {formError && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}

          <div className="rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-950">
            <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">Important history</p>
            <div className="space-y-2">
              <ToggleField label="Depression" checked={history.depression} onChange={(value) => setHistory((current) => ({ ...current, depression: value }))} />
              <ToggleField label="Anxiety" checked={history.anxiety} onChange={(value) => setHistory((current) => ({ ...current, anxiety: value }))} />
              <ToggleField label="Bipolar disorder" checked={history.bipolarDisorder} onChange={(value) => setHistory((current) => ({ ...current, bipolarDisorder: value }))} />
              <ToggleField label="Birth trauma" checked={history.birthTrauma} onChange={(value) => setHistory((current) => ({ ...current, birthTrauma: value }))} />
              <ToggleField label="Pregnancy complications" checked={history.pregnancyComplications} onChange={(value) => setHistory((current) => ({ ...current, pregnancyComplications: value }))} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || !aiConsent || birthDateStatus.state === "future" || birthDateStatus.state === "invalid"}
          className="mt-5 flex w-full items-center justify-center rounded-full bg-emerald-600 py-4 font-medium text-white shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:shadow-none"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : mode === "edit" ? "Save Profile" : "Start With Havyn"}
        </button>
      </form>
    </div>
  );
}

function SegmentedField<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-950">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">{icon}{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              value === option.value
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
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

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left text-sm dark:bg-zinc-900"
    >
      <span>{label}</span>
      <span className={`h-6 w-11 rounded-full p-0.5 transition-colors ${checked ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

function parseLegacyEmergencyContact(value: string) {
  const parts = value.split(",");
  const phone = extractPhone(value);
  const name = parts.length > 1 ? parts[0]?.trim() ?? "" : phone ? value.replace(phone, "").replace(/[,() -]+$/g, "").trim() : value.trim();
  return { name, phone };
}

function extractPhone(value: string) {
  const match = value.match(/[+]?[(]?[0-9][0-9() .-]{6,}[0-9]/);
  return match?.[0]?.trim() ?? "";
}

function formatEmergencyContact(name: string, phone: string) {
  const cleanName = name.trim();
  const cleanPhone = phone.trim();
  if (cleanName && cleanPhone) return `${cleanName}, ${cleanPhone}`;
  return cleanName || cleanPhone || undefined;
}
