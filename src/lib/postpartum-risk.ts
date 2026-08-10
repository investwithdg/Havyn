import type { PostpartumSignals, RiskAssessment } from "@/lib/types";

export function assessPostpartumRisk(signals?: PostpartumSignals): RiskAssessment {
  if (!signals) {
    return { level: "low", flags: [], escalationRecommended: false };
  }

  const flags: string[] = [];

  if (signals.safetyConcern || signals.notFeelingSafe) {
    flags.push("safety_concern");
  }

  if (signals.harmConcern) {
    flags.push("harm_concern");
  }

  if (signals.intrusiveThoughts === "severe" || signals.unwantedScaryThoughts === "severe") {
    flags.push(signals.thoughtsFeelUncontrollable ? "uncontrollable_intrusive_thoughts" : "distressing_intrusive_thoughts");
  }

  if (signals.overwhelmLevel >= 9) {
    flags.push("severe_overwhelm");
  }

  if (signals.anxietyLevel >= 9) {
    flags.push("severe_anxiety");
  }

  if (signals.supportToday === "none_today" && (signals.overwhelmLevel >= 8 || signals.anxietyLevel >= 8)) {
    flags.push("high_distress_without_support");
  }

  if (signals.recoveryConcern === "severe") {
    flags.push("severe_recovery_concern");
  }

  if (signals.bonding === "distressed") {
    flags.push("bonding_distress");
  }

  const urgentFlags = new Set([
    "safety_concern",
    "harm_concern",
    "uncontrollable_intrusive_thoughts",
    "high_distress_without_support",
  ]);

  const hasUrgentFlag = flags.some((flag) => urgentFlags.has(flag));

  if (hasUrgentFlag) {
    return { level: "urgent", flags, escalationRecommended: true };
  }

  if (flags.length > 0) {
    return { level: "elevated", flags, escalationRecommended: true };
  }

  return { level: "low", flags, escalationRecommended: false };
}
