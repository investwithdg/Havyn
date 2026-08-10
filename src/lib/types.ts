import type { AnalyzeJournalEntryOutput } from "@/ai/flows/analyze-journal-entry";
import type { Timestamp } from "firebase/firestore";

export type Mood = "Happy" | "Calm" | "Okay" | "Anxious" | "Sad";

export type DeliveryType = "vaginal" | "c_section" | "vbac" | "assisted" | "loss_or_other";
export type FeedingMode = "breastfeeding" | "pumping" | "formula" | "combo" | "not_applicable";
export type SupportLevel = "strong" | "some" | "limited" | "none_today";
export type ConcernLevel = "none" | "mild" | "moderate" | "severe";
export type BondingLevel = "connected" | "mixed" | "distant" | "distressed";

export type PostpartumProfile = {
  babyBirthDate?: string;
  postpartumWeek?: number;
  deliveryType?: DeliveryType;
  feedingMode?: FeedingMode;
  sleepBaselineHours?: number;
  supportSystem?: string[];
  careTeam?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  history?: {
    depression?: boolean;
    anxiety?: boolean;
    bipolarDisorder?: boolean;
    birthTrauma?: boolean;
    pregnancyComplications?: boolean;
  };
  consent?: {
    aiSupport?: boolean;
    reminders?: boolean;
    shareReports?: boolean;
  };
};

export type PostpartumSignals = {
  anxietyLevel: number;
  overwhelmLevel: number;
  sleepHours: number;
  sleepQuality: ConcernLevel;
  recoveryConcern: ConcernLevel;
  feedingStress: ConcernLevel;
  intrusiveThoughts: ConcernLevel;
  unwantedScaryThoughts?: ConcernLevel;
  thoughtsFeelUncontrollable?: boolean;
  harmConcern?: boolean;
  notFeelingSafe?: boolean;
  bonding: BondingLevel;
  supportToday: SupportLevel;
  safetyConcern: boolean;
};

export type RiskLevel = "low" | "elevated" | "urgent";

export type RiskAssessment = {
  level: RiskLevel;
  flags: string[];
  escalationRecommended: boolean;
};

export type JournalEntry = {
  id: string;
  date: Date | Timestamp;
  mood: Mood;
  painLevel: number;
  entryText: string;
  postpartum?: PostpartumSignals;
  risk?: RiskAssessment;
  analysis?: AnalyzeJournalEntryOutput | null;
  userId: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string | { prompt: string };
  isLoading?: boolean;
};
