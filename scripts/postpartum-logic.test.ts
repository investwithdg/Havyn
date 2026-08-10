import assert from "node:assert/strict";
import { assessPostpartumRisk } from "../src/lib/postpartum-risk";
import { buildCompanionResponse } from "../src/lib/postpartum-companion";
import { buildPostpartumStatusReport, formatEmergencyContact, formatMood, formatSupportSignal } from "../src/lib/postpartum-report";
import { buildWeeklyPostpartumSummary } from "../src/lib/weekly-summary";
import type { JournalEntry, PostpartumSignals } from "../src/lib/types";

const baseSignals: PostpartumSignals = {
  anxietyLevel: 2,
  overwhelmLevel: 2,
  sleepHours: 6,
  sleepQuality: "mild",
  recoveryConcern: "none",
  feedingStress: "none",
  intrusiveThoughts: "none",
  unwantedScaryThoughts: "none",
  thoughtsFeelUncontrollable: false,
  harmConcern: false,
  notFeelingSafe: false,
  bonding: "connected",
  supportToday: "strong",
  safetyConcern: false,
};

function withSignals(overrides: Partial<PostpartumSignals>): PostpartumSignals {
  return { ...baseSignals, ...overrides };
}

function entry(overrides: Partial<JournalEntry>): JournalEntry {
  return {
    id: overrides.id ?? "entry",
    date: overrides.date ?? new Date("2026-08-03T12:00:00Z"),
    mood: overrides.mood ?? "Okay",
    painLevel: overrides.painLevel ?? 2,
    entryText: overrides.entryText ?? "A postpartum check-in.",
    userId: "tester",
    postpartum: overrides.postpartum,
    risk: overrides.risk,
    analysis: overrides.analysis,
  };
}

function runRiskTests() {
  assert.deepEqual(assessPostpartumRisk(), {
    level: "low",
    flags: [],
    escalationRecommended: false,
  });

  assert.deepEqual(assessPostpartumRisk(baseSignals), {
    level: "low",
    flags: [],
    escalationRecommended: false,
  });

  const distressingThoughts = assessPostpartumRisk(withSignals({ unwantedScaryThoughts: "severe", intrusiveThoughts: "severe" }));
  assert.equal(distressingThoughts.level, "elevated");
  assert.equal(distressingThoughts.escalationRecommended, true);
  assert.deepEqual(distressingThoughts.flags, ["distressing_intrusive_thoughts"]);

  const uncontrollableThoughts = assessPostpartumRisk(withSignals({ unwantedScaryThoughts: "severe", thoughtsFeelUncontrollable: true }));
  assert.equal(uncontrollableThoughts.level, "urgent");
  assert.ok(uncontrollableThoughts.flags.includes("uncontrollable_intrusive_thoughts"));

  const harmConcern = assessPostpartumRisk(withSignals({ harmConcern: true }));
  assert.equal(harmConcern.level, "urgent");
  assert.ok(harmConcern.flags.includes("harm_concern"));

  const notSafe = assessPostpartumRisk(withSignals({ notFeelingSafe: true }));
  assert.equal(notSafe.level, "urgent");
  assert.ok(notSafe.flags.includes("safety_concern"));

  const unsupportedDistress = assessPostpartumRisk(withSignals({ anxietyLevel: 8, supportToday: "none_today" }));
  assert.equal(unsupportedDistress.level, "urgent");
  assert.ok(unsupportedDistress.flags.includes("high_distress_without_support"));

  const severeRecovery = assessPostpartumRisk(withSignals({ recoveryConcern: "severe" }));
  assert.equal(severeRecovery.level, "elevated");
  assert.ok(severeRecovery.flags.includes("severe_recovery_concern"));
}

function runStatusReportTests() {
  assert.equal(formatMood("Sad"), "Tender");
  assert.equal(formatSupportSignal("harm_concern"), "fear of hurting self or someone else");
  assert.equal(
    formatEmergencyContact({ emergencyContactName: "Alex", emergencyContactPhone: "555-0100" }),
    "Alex, 555-0100"
  );

  const report = buildPostpartumStatusReport({
    title: "Havyn share report",
    headline: "This check-in deserves extra support",
    profile: {
      babyBirthDate: "2026-07-08",
      feedingMode: "combo",
      deliveryType: "c_section",
      careTeam: "OB and therapist",
      emergencyContactName: "Alex",
      emergencyContactPhone: "555-0100",
    },
    mood: "Sad",
    painLevel: 5,
    signals: withSignals({ unwantedScaryThoughts: "moderate", supportToday: "limited" }),
    risk: { level: "elevated", flags: ["harm_concern"], escalationRecommended: true },
    nextStep: "Ask for a support shift.",
    now: new Date("2026-08-03T12:00:00Z"),
  });

  assert.match(report, /Havyn share report/);
  assert.match(report, /Postpartum week: 4/);
  assert.match(report, /Emergency contact: Alex, 555-0100/);
  assert.match(report, /Signals: fear of hurting self or someone else/);
  assert.match(report, /Mood: Tender/);
  assert.match(report, /Unwanted scary thoughts: moderate/);
  assert.match(report, /Havyn is not medical care/);
}

function runCompanionResponseTests() {
  const elevated = buildCompanionResponse({
    mood: "Anxious",
    painLevel: 6,
    postpartum: withSignals({ anxietyLevel: 8, overwhelmLevel: 8, sleepHours: 3, supportToday: "limited" }),
    risk: { level: "elevated", flags: ["severe_recovery_concern"], escalationRecommended: true },
    profile: { postpartumWeek: 4, careTeam: "OB and therapist" },
  });

  assert.equal(elevated.headline, "This check-in deserves extra support");
  assert.match(elevated.reflection, /postpartum week 4/);
  assert.match(elevated.nextStep, /Send one specific request/);
  assert.match(elevated.supportCue ?? "", /severe recovery concern/);
  assert.match(elevated.shareText, /Support level: elevated/);
  assert.match(elevated.shareText, /Havyn is not medical care/);

  const urgent = buildCompanionResponse({
    mood: "Sad",
    painLevel: 2,
    postpartum: withSignals({ harmConcern: true }),
    risk: { level: "urgent", flags: ["harm_concern"], escalationRecommended: true },
  });

  assert.equal(urgent.headline, "Bring in real support now");
  assert.match(urgent.nextStep, /Pause journaling/);
  assert.match(urgent.supportCue ?? "", /immediate danger/);
}

function runWeeklySummaryTests() {
  const now = new Date("2026-08-03T12:00:00Z");
  const summary = buildWeeklyPostpartumSummary(
    [
      entry({
        id: "today",
        date: now,
        mood: "Sad",
        painLevel: 7,
        postpartum: withSignals({
          anxietyLevel: 8,
          overwhelmLevel: 7,
          sleepHours: 3,
          feedingStress: "severe",
          recoveryConcern: "moderate",
          supportToday: "limited",
        }),
        risk: { level: "elevated", flags: ["severe_recovery_concern"], escalationRecommended: true },
      }),
      entry({
        id: "yesterday",
        date: new Date("2026-08-02T12:00:00Z"),
        mood: "Okay",
        painLevel: 3,
        postpartum: withSignals({ anxietyLevel: 4, overwhelmLevel: 5, sleepHours: 5 }),
        risk: { level: "low", flags: [], escalationRecommended: false },
      }),
      entry({
        id: "old",
        date: new Date("2026-07-20T12:00:00Z"),
        mood: "Happy",
        painLevel: 1,
        postpartum: withSignals({ anxietyLevel: 1, overwhelmLevel: 1, sleepHours: 8 }),
        risk: { level: "low", flags: [], escalationRecommended: false },
      }),
    ],
    {
      babyBirthDate: "2026-07-08",
      feedingMode: "combo",
      deliveryType: "c_section",
      careTeam: "OB and therapist",
      emergencyContactName: "Alex",
      emergencyContactPhone: "555-0100",
    },
    now
  );

  assert.equal(summary.entries.length, 2);
  assert.equal(summary.daysTracked, 2);
  assert.equal(summary.avgPain, 5);
  assert.equal(summary.avgAnxiety, 6);
  assert.equal(summary.avgOverwhelm, 6);
  assert.equal(summary.avgSleep, 4);
  assert.equal(summary.riskLevel, "elevated");
  assert.deepEqual(summary.riskFlags, ["severe_recovery_concern"]);
  assert.ok(summary.supportNeeds.includes("more reliable support coverage"));
  assert.ok(summary.supportNeeds.includes("sleep protection"));
  assert.ok(summary.supportNeeds.includes("feeding support"));
  assert.ok(summary.supportNeeds.includes("physical recovery follow-up"));
  assert.match(summary.text, /Most common mood: Tender|Most common mood: Okay/);
  assert.match(summary.text, /Support level Havyn noticed: elevated/);
  assert.match(summary.text, /Signals to discuss: severe recovery concern/);
  assert.match(summary.text, /Emergency contact noted: Alex, 555-0100/);
  assert.doesNotMatch(summary.text, /Highest risk level flagged/);
}

runRiskTests();
runStatusReportTests();
runCompanionResponseTests();
runWeeklySummaryTests();
console.log("postpartum logic tests passed");
