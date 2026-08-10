import type { JournalEntry, PostpartumProfile, RiskAssessment } from "@/lib/types";
import { toDate } from "@/lib/date-utils";
import { formatEmergencyContact, formatMood, formatSupportSignal } from "@/lib/postpartum-report";

type WeeklySummary = {
  entries: JournalEntry[];
  daysTracked: number;
  mostCommonMood?: string;
  avgPain?: number;
  avgAnxiety?: number;
  avgOverwhelm?: number;
  avgSleep?: number;
  riskLevel: RiskAssessment["level"];
  riskFlags: string[];
  supportNeeds: string[];
  careQuestions: string[];
  text: string;
};

export function buildWeeklyPostpartumSummary(
  allEntries: JournalEntry[],
  profile?: PostpartumProfile | null,
  now = new Date()
): WeeklySummary {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);

  const entries = [...allEntries]
    .filter((entry) => toDate(entry.date) >= cutoff && toDate(entry.date) <= now)
    .sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());

  const riskFlags = Array.from(new Set(entries.flatMap((entry) => entry.risk?.flags ?? [])));
  const riskLevel = getHighestRisk(entries);
  const supportNeeds = buildSupportNeeds(entries);
  const careQuestions = buildCareQuestions(entries, riskFlags);

  const summary: Omit<WeeklySummary, "text"> = {
    entries,
    daysTracked: new Set(entries.map((entry) => toDate(entry.date).toDateString())).size,
    mostCommonMood: mostCommon(entries.map((entry) => entry.mood)),
    avgPain: average(entries.map((entry) => entry.painLevel)),
    avgAnxiety: average(entries.map((entry) => entry.postpartum?.anxietyLevel)),
    avgOverwhelm: average(entries.map((entry) => entry.postpartum?.overwhelmLevel)),
    avgSleep: average(entries.map((entry) => entry.postpartum?.sleepHours)),
    riskLevel,
    riskFlags,
    supportNeeds,
    careQuestions,
  };

  return {
    ...summary,
    text: renderWeeklySummaryText(summary, profile),
  };
}

function renderWeeklySummaryText(summary: Omit<WeeklySummary, "text">, profile?: PostpartumProfile | null) {
  const lines = ["Havyn 7-day postpartum summary"];

  const postpartumWeek = getCurrentPostpartumWeek(profile);
  if (postpartumWeek) lines.push(`Postpartum week: ${postpartumWeek}`);
  if (profile?.feedingMode) lines.push(`Feeding mode: ${profile.feedingMode.replace("_", " ")}`);
  if (profile?.deliveryType) lines.push(`Delivery context: ${profile.deliveryType.replace("_", " ")}`);

  lines.push(`Days tracked: ${summary.daysTracked}/7`);
  if (summary.mostCommonMood) lines.push(`Most common mood: ${formatMood(summary.mostCommonMood)}`);
  if (summary.avgPain !== undefined) lines.push(`Average pain/discomfort: ${summary.avgPain}/10`);
  if (summary.avgAnxiety !== undefined) lines.push(`Average anxiety: ${summary.avgAnxiety}/10`);
  if (summary.avgOverwhelm !== undefined) lines.push(`Average overwhelm: ${summary.avgOverwhelm}/10`);
  if (summary.avgSleep !== undefined) lines.push(`Average sleep: ${summary.avgSleep} hours`);

  lines.push(`Support level Havyn noticed: ${summary.riskLevel}`);
  if (summary.riskFlags.length) {
    lines.push(`Signals to discuss: ${summary.riskFlags.map(formatSupportSignal).join(", ")}`);
  }

  if (summary.supportNeeds.length) {
    lines.push(`Support needs noticed: ${summary.supportNeeds.join(", ")}`);
  }

  if (summary.careQuestions.length) {
    lines.push("Questions to ask care team/support person:");
    summary.careQuestions.forEach((question) => lines.push(`- ${question}`));
  }

  if (profile?.careTeam) lines.push(`Care team noted: ${profile.careTeam}`);
  const emergencyContact = formatEmergencyContact(profile);
  if (emergencyContact) lines.push(`Emergency contact noted: ${emergencyContact}`);
  lines.push("This summary is not a diagnosis or medical advice. Urgent safety or physical concerns need immediate human support.");

  return lines.join("\n");
}

function getHighestRisk(entries: JournalEntry[]): RiskAssessment["level"] {
  if (entries.some((entry) => entry.risk?.level === "urgent")) return "urgent";
  if (entries.some((entry) => entry.risk?.level === "elevated")) return "elevated";
  return "low";
}

function buildSupportNeeds(entries: JournalEntry[]) {
  const needs = new Set<string>();
  if (entries.some((entry) => entry.postpartum?.supportToday === "none_today" || entry.postpartum?.supportToday === "limited")) {
    needs.add("more reliable support coverage");
  }
  if (entries.some((entry) => (entry.postpartum?.sleepHours ?? 24) <= 3)) {
    needs.add("sleep protection");
  }
  if (entries.some((entry) => entry.postpartum?.feedingStress === "moderate" || entry.postpartum?.feedingStress === "severe")) {
    needs.add("feeding support");
  }
  if (entries.some((entry) => entry.postpartum?.recoveryConcern === "moderate" || entry.postpartum?.recoveryConcern === "severe")) {
    needs.add("physical recovery follow-up");
  }
  if (entries.some((entry) => entry.postpartum?.bonding === "distressed" || entry.postpartum?.bonding === "distant")) {
    needs.add("bonding and emotional support");
  }
  return Array.from(needs);
}

function buildCareQuestions(entries: JournalEntry[], riskFlags: string[]) {
  const questions = new Set<string>();

  if (riskFlags.length) {
    questions.add("What support should I use now based on these signals?");
  }
  if (entries.some((entry) => entry.postpartum?.recoveryConcern === "moderate" || entry.postpartum?.recoveryConcern === "severe" || entry.painLevel >= 7)) {
    questions.add("Are my pain or recovery symptoms expected, or should I be seen sooner?");
  }
  if (entries.some((entry) => entry.postpartum?.feedingStress === "moderate" || entry.postpartum?.feedingStress === "severe")) {
    questions.add("What feeding support options should I use this week?");
  }
  if (entries.some((entry) => (entry.postpartum?.sleepHours ?? 24) <= 3)) {
    questions.add("How can we protect a longer sleep block safely?");
  }
  if (entries.some((entry) => (entry.postpartum?.anxietyLevel ?? 0) >= 7 || (entry.postpartum?.overwhelmLevel ?? 0) >= 7)) {
    questions.add("What mental health support is appropriate for this level of anxiety or overwhelm?");
  }

  if (!questions.size) {
    questions.add("What is one thing I should watch or change this week based on these check-ins?");
  }

  return Array.from(questions).slice(0, 4);
}

function average(values: Array<number | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number");
  if (!numbers.length) return undefined;
  return Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10;
}

function mostCommon(values: string[]) {
  if (!values.length) return undefined;
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function getCurrentPostpartumWeek(profile?: PostpartumProfile | null) {
  if (profile?.babyBirthDate) {
    const birthDate = new Date(`${profile.babyBirthDate}T00:00:00`);
    if (!Number.isNaN(birthDate.getTime())) {
      return Math.max(1, Math.floor((Date.now() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
    }
  }

  return profile?.postpartumWeek;
}
