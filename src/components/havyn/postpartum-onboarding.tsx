"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Baby, CalendarDays, ChevronLeft, HeartHandshake, Loader2, PhoneCall, Sparkles, Stethoscope, UserRound, X } from "lucide-react";
import type { DeliveryType, FeedingMode, PostpartumProfile } from "@/lib/types";
import { CaterpillarMark } from "@/components/havyn/logo";

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

const STEP_KEYS = ["basics", "feeding", "support", "emergency", "history", "consent"] as const;
type StepKey = (typeof STEP_KEYS)[number];

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

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const step = STEP_KEYS[stepIndex];
  const isLastStep = stepIndex === STEP_KEYS.length - 1;

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
  const birthDateBlocking = birthDateStatus.state === "future" || birthDateStatus.state === "invalid";

  if (!open) return null;

  const goTo = (index: number, dir: 1 | -1) => {
    setFormError(null);
    setDirection(dir);
    setStepIndex(Math.max(0, Math.min(STEP_KEYS.length - 1, index)));
  };

  const handleNext = () => {
    if (step === "basics" && birthDateBlocking) {
      setFormError("Enter a valid birth date that is not in the future, or leave it blank.");
      return;
    }
    goTo(stepIndex + 1, 1);
  };

  const handleBack = () => goTo(stepIndex - 1, -1);

  const handleSubmit = async () => {
    if (!aiConsent) {
      setFormError("Confirm AI support consent to continue.");
      return;
    }
    if (birthDateBlocking) {
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
      <div className="flex max-h-[92dvh] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border border-primary/10 bg-card shadow-2xl">
        {/* Header: progress + back/close */}
        <div className="flex shrink-0 items-center gap-3 px-5 pt-5">
          {stepIndex > 0 ? (
            <button type="button" onClick={handleBack} aria-label="Back" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div className="h-9 w-9 shrink-0" aria-hidden="true" />
          )}
          <div className="flex flex-1 items-center justify-center gap-1.5">
            {STEP_KEYS.map((key, index) => (
              <button
                key={key}
                type="button"
                aria-label={`Go to step ${index + 1}`}
                onClick={() => goTo(index, index > stepIndex ? 1 : -1)}
                className="rounded-full p-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    index === stepIndex ? "w-6 bg-primary" : index < stepIndex ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted"
                  }`}
                />
              </button>
            ))}
          </div>
          {onClose && mode === "edit" ? (
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <X size={16} />
            </button>
          ) : (
            <div className="h-9 w-9 shrink-0" aria-hidden="true" />
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5" data-scrollable="true">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {step === "basics" && (
                <StepShell
                  icon={<CalendarDays size={20} />}
                  eyebrow="Step 1 of 6"
                  title={mode === "edit" ? "Update the basics" : "Let's start with the basics"}
                  subtitle="Havyn uses this to personalize check-ins. Nothing here is a medical record."
                >
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">Baby's birth date</span>
                    <input
                      type="date"
                      value={babyBirthDate}
                      onChange={(event) => setBabyBirthDate(event.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base"
                    />
                    {birthDateStatus.state === "active" && postpartumWeek && (
                      <span className="mt-2 block text-xs text-primary">Approx. postpartum week {postpartumWeek} of 12</span>
                    )}
                    {birthDateStatus.state === "transition" && postpartumWeek && (
                      <span className="mt-2 block text-xs text-accent">Approx. week {postpartumWeek}. Havyn will frame this as transition support beyond the first 12 weeks.</span>
                    )}
                    {birthDateBlocking && (
                      <span className="mt-2 block text-xs text-destructive">Enter a valid birth date that is not in the future.</span>
                    )}
                    <span className="mt-2 block text-xs text-muted-foreground">Not sure yet? Skip it — you can add this later.</span>
                  </label>

                  <TileField label="Delivery" icon={<Baby size={16} />} value={deliveryType} options={DELIVERY_OPTIONS} onChange={setDeliveryType} />
                </StepShell>
              )}

              {step === "feeding" && (
                <StepShell
                  icon={<HeartHandshake size={20} />}
                  eyebrow="Step 2 of 6"
                  title="How are you feeding baby?"
                  subtitle="This helps Havyn ask the right follow-up questions."
                >
                  <TileField label="Feeding" icon={<HeartHandshake size={16} />} value={feedingMode} options={FEEDING_OPTIONS} onChange={setFeedingMode} hideLabel />
                </StepShell>
              )}

              {step === "support" && (
                <StepShell
                  icon={<HeartHandshake size={20} />}
                  eyebrow="Step 3 of 6"
                  title="Who's around you?"
                  subtitle="A few names is plenty — this just shapes how Havyn talks about support."
                >
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">Support people</span>
                    <textarea
                      value={supportSystem}
                      onChange={(event) => setSupportSystem(event.target.value)}
                      placeholder="Partner, mom, doula, friend"
                      rows={2}
                      className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-base"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Stethoscope size={16} /> Care team
                    </span>
                    <textarea
                      value={careTeam}
                      onChange={(event) => setCareTeam(event.target.value)}
                      placeholder="OB, midwife, therapist, pediatrician"
                      rows={2}
                      className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-base"
                    />
                  </label>
                </StepShell>
              )}

              {step === "emergency" && (
                <StepShell
                  icon={<UserRound size={20} />}
                  eyebrow="Step 4 of 6"
                  title="Who should we reach in an emergency?"
                  subtitle="Only used if Havyn ever needs to help you find support fast."
                >
                  <label className="block">
                    <span className="sr-only">Emergency contact name</span>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(event) => setEmergencyContactName(event.target.value)}
                      placeholder="Name"
                      autoComplete="name"
                      className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Emergency contact phone</span>
                    <div className="relative">
                      <PhoneCall className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(event) => setEmergencyContactPhone(event.target.value)}
                        placeholder="Phone number"
                        autoComplete="tel"
                        inputMode="tel"
                        className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-base"
                      />
                    </div>
                  </label>
                </StepShell>
              )}

              {step === "history" && (
                <StepShell
                  icon={<Sparkles size={20} />}
                  eyebrow="Step 5 of 6 · optional"
                  title="Anything from your history Havyn should be gentle about?"
                  subtitle="Totally optional — skip this if you'd rather not say."
                >
                  <div className="space-y-2">
                    <ToggleField label="Depression" checked={history.depression} onChange={(value) => setHistory((current) => ({ ...current, depression: value }))} />
                    <ToggleField label="Anxiety" checked={history.anxiety} onChange={(value) => setHistory((current) => ({ ...current, anxiety: value }))} />
                    <ToggleField label="Bipolar disorder" checked={history.bipolarDisorder} onChange={(value) => setHistory((current) => ({ ...current, bipolarDisorder: value }))} />
                    <ToggleField label="Birth trauma" checked={history.birthTrauma} onChange={(value) => setHistory((current) => ({ ...current, birthTrauma: value }))} />
                    <ToggleField label="Pregnancy complications" checked={history.pregnancyComplications} onChange={(value) => setHistory((current) => ({ ...current, pregnancyComplications: value }))} />
                  </div>
                </StepShell>
              )}

              {step === "consent" && (
                <StepShell
                  icon={<CaterpillarMark size={20} className="text-primary" />}
                  eyebrow="Step 6 of 6"
                  title="Last thing"
                  subtitle="Confirm this and you're set."
                >
                  <label className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left">
                    <input
                      type="checkbox"
                      checked={aiConsent}
                      onChange={(event) => setAiConsent(event.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-primary/40 text-primary"
                    />
                    <span className="text-sm leading-relaxed text-foreground">
                      I understand Havyn uses AI to offer postpartum reflection and planning support. It is not medical care, a diagnosis, or emergency support.
                    </span>
                  </label>
                </StepShell>
              )}

              {formError && <p className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="shrink-0 px-5 pb-5 pt-2">
          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !aiConsent || birthDateBlocking}
              className="flex w-full items-center justify-center rounded-full bg-primary py-4 font-medium text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60 disabled:shadow-none"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : mode === "edit" ? "Save Profile" : "Start With Havyn"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {step === "history" && (
                <button
                  type="button"
                  onClick={() => goTo(stepIndex + 1, 1)}
                  className="flex-1 rounded-full bg-muted py-4 text-sm font-medium text-muted-foreground"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] rounded-full bg-primary py-4 font-medium text-primary-foreground shadow-lg shadow-primary/20"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepShell({
  icon,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TileField<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  hideLabel,
}: {
  label: string;
  icon: React.ReactNode;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
  hideLabel?: boolean;
}) {
  return (
    <div>
      {!hideLabel && (
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          {icon}
          {label}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-14 rounded-2xl border px-3 py-2 text-sm font-medium transition-all ${
              value === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground/80"
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
      className="flex min-h-12 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-left text-sm"
    >
      <span className="text-foreground">{label}</span>
      <span className={`h-6 w-11 rounded-full p-0.5 transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
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
