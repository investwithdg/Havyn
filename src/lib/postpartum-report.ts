import type { Mood, PostpartumProfile, PostpartumSignals, RiskAssessment } from "@/lib/types";

export const MOOD_LABELS: Record<Mood, string> = {
  Happy: "Good",
  Calm: "Steady",
  Okay: "Okay",
  Anxious: "Anxious",
  Sad: "Tender",
};

const SUPPORT_SIGNAL_LABELS: Record<string, string> = {
  safety_concern: "safety concern",
  severe_intrusive_thoughts: "intense unwanted thoughts",
  distressing_intrusive_thoughts: "intense unwanted scary thoughts",
  uncontrollable_intrusive_thoughts: "scary thoughts felt hard to control",
  harm_concern: "fear of hurting self or someone else",
  severe_overwhelm: "very high overwhelm",
  severe_anxiety: "very high anxiety",
  high_distress_without_support: "high distress without support",
  severe_recovery_concern: "severe recovery concern",
  bonding_distress: "distress around connection with baby",
};

type StatusReportInput = {
  title?: string;
  headline?: string;
  profile?: PostpartumProfile | null;
  mood?: Mood;
  painLevel?: number;
  signals?: PostpartumSignals | null;
  risk?: RiskAssessment | null;
  nextStep?: string;
  note?: string;
  now?: Date;
};

export function formatMood(value?: Mood | string) {
  if (!value) return undefined;
  return MOOD_LABELS[value as Mood] ?? value;
}

export function formatSupportSignal(flag: string) {
  return SUPPORT_SIGNAL_LABELS[flag] ?? flag.replaceAll("_", " ");
}

export function formatEmergencyContact(profile?: PostpartumProfile | null) {
  if (!profile) return undefined;
  const name = profile.emergencyContactName?.trim();
  const phone = profile.emergencyContactPhone?.trim();
  if (name && phone) return `${name}, ${phone}`;
  return name || phone || profile.emergencyContact;
}

export function getPostpartumWeek(profile?: PostpartumProfile | null, now = new Date()) {
  if (profile?.babyBirthDate) {
    const birthDate = new Date(`${profile.babyBirthDate}T00:00:00`);
    if (!Number.isNaN(birthDate.getTime()) && birthDate <= now) {
      return Math.max(1, Math.floor((now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
    }
  }

  return profile?.postpartumWeek;
}

export function buildPostpartumStatusReport({
  title = "Havyn postpartum check-in",
  headline,
  profile,
  mood,
  painLevel,
  signals,
  risk,
  nextStep,
  note,
  now,
}: StatusReportInput) {
  const lines = [title];
  if (headline) lines.push(headline);
  if (note) lines.push(note);
  if (nextStep) lines.push(`Next step: ${nextStep}`);

  const postpartumWeek = getPostpartumWeek(profile, now);
  if (postpartumWeek) lines.push(`Postpartum week: ${postpartumWeek}`);
  if (profile?.feedingMode) lines.push(`Feeding mode: ${profile.feedingMode.replace("_", " ")}`);
  if (profile?.deliveryType) lines.push(`Delivery context: ${profile.deliveryType.replace("_", " ")}`);
  if (profile?.careTeam) lines.push(`Care team: ${profile.careTeam}`);

  const emergencyContact = formatEmergencyContact(profile);
  if (emergencyContact) lines.push(`Emergency contact: ${emergencyContact}`);

  if (risk) lines.push(`Support level: ${risk.level}`);
  if (risk?.flags?.length) lines.push(`Signals: ${risk.flags.map(formatSupportSignal).join(", ")}`);
  if (mood) lines.push(`Mood: ${formatMood(mood)}`);
  if (typeof painLevel === "number") lines.push(`Pain/discomfort: ${painLevel}/10`);

  if (signals) {
    lines.push(`Anxiety: ${signals.anxietyLevel}/10`);
    lines.push(`Overwhelm: ${signals.overwhelmLevel}/10`);
    lines.push(`Sleep: ${signals.sleepHours} hours, quality ${signals.sleepQuality}`);
    lines.push(`Recovery concern: ${signals.recoveryConcern}`);
    lines.push(`Feeding stress: ${signals.feedingStress}`);
    lines.push(`Unwanted scary thoughts: ${signals.unwantedScaryThoughts ?? signals.intrusiveThoughts}`);
    lines.push(`Connection with baby: ${signals.bonding}`);
    lines.push(`Support today: ${signals.supportToday.replace("_", " ")}`);
    lines.push(`Safety concern selected: ${signals.safetyConcern || signals.harmConcern || signals.notFeelingSafe ? "yes" : "no"}`);
  }

  lines.push("Havyn is not medical care. Urgent safety or physical concerns need immediate human support.");
  return lines.join("\n");
}
