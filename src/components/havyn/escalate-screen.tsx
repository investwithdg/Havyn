"use client";

import React, { useMemo, useState } from "react";
import { PhoneCall, AlertTriangle, ShieldCheck, ChevronUp, Heart, ExternalLink, X, Copy, Check, UserRound, Stethoscope, MessageCircle } from "lucide-react";
import type { Mood, PostpartumProfile, PostpartumSignals, RiskAssessment } from "@/lib/types";
import { buildPostpartumStatusReport, formatEmergencyContact } from "@/lib/postpartum-report";

const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", contact: "Call 988", url: "tel:988" },
  { name: "Maternal Mental Health Hotline", contact: "Call 1-833-943-5746", url: "tel:18339435746" },
  { name: "Crisis Text Line", contact: "Text HOME to 741741", url: "sms:741741?body=HOME" },
];

const FLAG_LABELS: Record<string, string> = {
  safety_concern: "Safety concern was selected",
  severe_intrusive_thoughts: "Intrusive thoughts marked severe",
  distressing_intrusive_thoughts: "Unwanted scary thoughts are intense",
  uncontrollable_intrusive_thoughts: "Scary thoughts feel hard to control",
  harm_concern: "Fear of hurting self or someone else",
  severe_overwhelm: "Overwhelm is very high",
  severe_anxiety: "Anxiety is very high",
  high_distress_without_support: "High distress with no support today",
  severe_recovery_concern: "Recovery concern marked severe",
  bonding_distress: "Connection with baby feels distressing",
};

type EscalateScreenProps = {
  risk?: RiskAssessment | null;
  signals?: PostpartumSignals | null;
  profile?: PostpartumProfile | null;
  mood?: Mood;
  painLevel?: number;
  onDismiss?: () => void;
  variant?: "screen" | "sheet" | "urgent";
};

export function EscalateScreen({
  risk,
  signals,
  profile,
  mood,
  painLevel,
  onDismiss,
  variant = "screen",
}: EscalateScreenProps) {
  const [copied, setCopied] = useState(false);
  const isUrgent = variant === "urgent" || risk?.level === "urgent";
  const supportSummary = useMemo(
    () => buildSupportSummary({ risk, signals, profile, mood, painLevel }),
    [risk, signals, profile, mood, painLevel]
  );
  const emergencyContactLabel = getEmergencyContactLabel(profile);
  const emergencyContactHref = getEmergencyContactHref(profile);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(supportSummary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy support summary:", error);
    }
  };

  const containerClass = variant === "sheet"
    ? "fixed inset-0 z-[80] flex items-end justify-center bg-black/35 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm"
    : variant === "urgent"
      ? "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-red-950 px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      : "relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-background p-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]";

  const panelClass = variant === "sheet"
    ? "max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-[1.75rem] border border-destructive/15 bg-card p-6 shadow-2xl"
    : variant === "urgent"
      ? "max-h-[96dvh] w-full max-w-sm overflow-y-auto rounded-[1.75rem] border border-red-300 bg-white p-6 shadow-2xl"
      : "w-full max-w-sm rounded-3xl border border-destructive/15 bg-card p-8 shadow-xl";

  return (
    <div className={containerClass} data-scrollable="true">
      {variant === "screen" && (
        <div className="absolute top-[max(2rem,env(safe-area-inset-top))] flex flex-col items-center text-zinc-400 opacity-60">
          <span className="mb-2 text-xs font-medium uppercase tracking-widest">Swipe Home</span>
          <ChevronUp size={20} className="animate-bounce" />
        </div>
      )}

      <div className={panelClass}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className={isUrgent ? "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-600 text-white" : "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"}>
            <AlertTriangle size={isUrgent ? 34 : 28} />
          </div>
          {onDismiss && !isUrgent && (
            <button
              type="button"
              onClick={onDismiss}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
              aria-label="Close support panel"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <h2 className="mb-3 text-2xl font-semibold text-foreground">
          {isUrgent ? "Get a real person involved now" : "You deserve human support"}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {isUrgent
            ? "Your check-in included urgent safety signals. Do not stay alone with this. Call or text a crisis resource, contact your emergency contact, or call local emergency services if there is immediate danger."
            : "Your check-in suggests today may need more support than journaling alone. Havyn can help summarize what is happening, but concerning postpartum symptoms deserve a real person."}
        </p>

        {risk?.flags?.length ? (
          <div className="mb-5 rounded-2xl bg-red-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">What Havyn noticed</p>
            <div className="space-y-1.5">
              {risk.flags.map((flag) => (
                <p key={flag} className="text-xs leading-relaxed text-red-800">
                  {FLAG_LABELS[flag] ?? flag.replaceAll("_", " ")}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {(emergencyContactLabel || profile?.careTeam) && (
          <div className="mb-5 space-y-2 rounded-2xl border border-border bg-muted p-4">
            {emergencyContactLabel && (
              <div className="flex gap-3">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emergency contact</p>
                  <p className="mt-1 text-sm text-foreground">{emergencyContactLabel}</p>
                </div>
              </div>
            )}
            {profile?.careTeam && (
              <div className="flex gap-3">
                <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Care team</p>
                  <p className="mt-1 text-sm text-foreground">{profile.careTeam}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {isUrgent && (
            <>
              <a
                href="tel:911"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-700 py-4 font-semibold text-white transition-colors hover:bg-red-800"
              >
                <PhoneCall size={18} />
                <span>Call 911 if in immediate danger</span>
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:988"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-600 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  <PhoneCall size={17} />
                  <span>Call 988</span>
                </a>
                <a
                  href="sms:988"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-100 px-3 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200"
                >
                  <MessageCircle size={17} />
                  <span>Text 988</span>
                </a>
              </div>
            </>
          )}
          {emergencyContactHref && (
            <a
              href={emergencyContactHref}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-foreground py-4 font-medium text-background transition-colors hover:bg-foreground/90"
            >
              <PhoneCall size={18} />
              <span>Call Emergency Contact</span>
            </a>
          )}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:18339435746"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-500 px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              <PhoneCall size={17} />
              <span>Call Hotline</span>
            </a>
            <a
              href="sms:18339435746"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <MessageCircle size={17} />
              <span>Text Hotline</span>
            </a>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-muted py-4 font-medium text-foreground transition-colors hover:bg-muted/70"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? "Summary Copied" : "Copy Status Summary"}</span>
          </button>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Heart size={14} className="text-destructive/70" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Immediate Help
            </span>
          </div>
          <div className="space-y-2">
            {CRISIS_RESOURCES.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                className="group flex items-center justify-between rounded-xl bg-destructive/5 px-3 py-2.5 transition-colors hover:bg-destructive/10"
              >
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {resource.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {resource.contact}
                  </p>
                </div>
                <ExternalLink size={12} className="shrink-0 text-muted-foreground transition-colors group-hover:text-destructive" />
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopySummary}
          className="mt-5 flex w-full items-start gap-3 rounded-2xl border border-border bg-muted p-3 text-left transition-colors hover:bg-muted/70"
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-[11px] leading-relaxed text-muted-foreground">
            {supportSummary}
          </span>
        </button>

        {isUrgent && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="mt-4 w-full rounded-full border border-border py-3 text-sm font-medium text-foreground"
          >
            I have contacted support
          </button>
        )}

        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          Havyn is not emergency care. If there is immediate danger, call local emergency services.
        </p>
      </div>
    </div>
  );
}

function buildSupportSummary({
  risk,
  signals,
  profile,
  mood,
  painLevel,
}: {
  risk?: RiskAssessment | null;
  signals?: PostpartumSignals | null;
  profile?: PostpartumProfile | null;
  mood?: Mood;
  painLevel?: number;
}) {
  return buildPostpartumStatusReport({
    title: "Havyn postpartum check-in summary",
    profile,
    mood,
    painLevel,
    signals,
    risk,
  });
}

function getEmergencyContactLabel(profile?: PostpartumProfile | null) {
  return formatEmergencyContact(profile);
}

function getEmergencyContactHref(profile?: PostpartumProfile | null) {
  return getPhoneHref(profile?.emergencyContactPhone || profile?.emergencyContact);
}

function getPhoneHref(value?: string) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length < 7) return undefined;
  return `tel:${digits}`;
}
