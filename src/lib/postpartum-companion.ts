import type { Mood, PostpartumProfile, PostpartumSignals, RiskAssessment } from "@/lib/types";
import { buildPostpartumStatusReport, formatMood, formatSupportSignal, getPostpartumWeek } from "@/lib/postpartum-report";

type CompanionResponseInput = {
  mood?: Mood;
  painLevel?: number;
  postpartum?: PostpartumSignals | null;
  risk?: RiskAssessment | null;
  profile?: PostpartumProfile | null;
  prompt?: string;
};

export type CompanionResponse = {
  headline: string;
  reflection: string;
  nextStep: string;
  supportCue?: string;
  shareText: string;
};

export function buildCompanionResponse(input: CompanionResponseInput): CompanionResponse {
  const moodLabel = input.mood ? formatMood(input.mood)?.toLowerCase() : "present";
  const week = getPostpartumWeek(input.profile);
  const signals = input.postpartum;
  const riskLevel = input.risk?.level ?? "low";
  const supportSignals = input.risk?.flags?.map(formatSupportSignal) ?? [];

  const headline = riskLevel === "urgent"
    ? "Bring in real support now"
    : riskLevel === "elevated"
      ? "This check-in deserves extra support"
      : "You checked in with yourself";

  const reflectionParts = [`You marked this moment as ${moodLabel}`];
  if (week) reflectionParts.push(`in postpartum week ${week}`);
  if (typeof signals?.sleepHours === "number") reflectionParts.push(`after about ${signals.sleepHours} hours of sleep`);
  if (typeof signals?.anxietyLevel === "number" && signals.anxietyLevel >= 7) reflectionParts.push(`with anxiety running high`);
  if (typeof signals?.overwhelmLevel === "number" && signals.overwhelmLevel >= 7) reflectionParts.push(`and overwhelm asking for attention`);

  const reflection = `${reflectionParts.join(" ")}. Havyn is noticing signals, not diagnosing them.`;
  const nextStep = chooseNextStep(signals, riskLevel);
  const supportCue = buildSupportCue(input.profile, riskLevel, supportSignals);
  const shareText = buildShareText({ ...input, headline, reflection, nextStep, supportCue, supportSignals });

  return { headline, reflection, nextStep, supportCue, shareText };
}

function chooseNextStep(signals: PostpartumSignals | null | undefined, riskLevel: RiskAssessment["level"]) {
  if (riskLevel === "urgent") {
    return "Pause journaling and contact a real person now: emergency services, 988, the maternal hotline, your emergency contact, or your care team.";
  }
  if (signals?.supportToday === "none_today" || signals?.supportToday === "limited") {
    return "Send one specific request for the next hour: sleep coverage, food, feeding help, or someone to sit with you.";
  }
  if ((signals?.sleepHours ?? 24) <= 3) {
    return "Protect one sleep block today by asking a support person to take a defined shift.";
  }
  if (signals?.feedingStress === "moderate" || signals?.feedingStress === "severe") {
    return "Write down one feeding question and send it to your lactation, pediatric, or care contact.";
  }
  if (signals?.recoveryConcern === "moderate" || signals?.recoveryConcern === "severe") {
    return "Track the recovery concern in plain words and ask your OB or midwife whether you should be seen sooner.";
  }
  return "Choose one small care action for the next hour: water, food, rest, a shower, or texting someone who can help.";
}

function buildSupportCue(profile: PostpartumProfile | null | undefined, riskLevel: RiskAssessment["level"], supportSignals: string[]) {
  if (riskLevel === "urgent") return "If there is immediate danger, call local emergency services now.";
  if (supportSignals.length) return `Signals to discuss: ${supportSignals.join(", ")}.`;
  if (profile?.careTeam) return `Care team noted: ${profile.careTeam}.`;
  return undefined;
}

function buildShareText(input: CompanionResponseInput & Pick<CompanionResponse, "headline" | "reflection" | "nextStep" | "supportCue"> & { supportSignals: string[] }) {
  return buildPostpartumStatusReport({
    title: "Havyn postpartum check-in",
    headline: input.headline,
    note: [input.reflection, input.supportCue].filter(Boolean).join(" "),
    nextStep: input.nextStep,
    profile: input.profile,
    mood: input.mood,
    painLevel: input.painLevel,
    signals: input.postpartum,
    risk: input.risk,
  });
}
