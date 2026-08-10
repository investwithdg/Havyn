"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HomeScreen } from "@/components/havyn/home-screen";
import { CheckInScreen } from "@/components/havyn/check-in-screen";
import { EscalateScreen } from "@/components/havyn/escalate-screen";
import { JournalScreen } from "@/components/havyn/journal-screen";
import { JournalSidebar } from "@/components/havyn/journal-sidebar";
import { PostpartumOnboarding } from "@/components/havyn/postpartum-onboarding";
import type { JournalEntry, PostpartumProfile } from "@/lib/types";

const mockProfile: PostpartumProfile = {
  babyBirthDate: "2026-07-08",
  postpartumWeek: 4,
  deliveryType: "c_section",
  feedingMode: "combo",
  supportSystem: ["Partner", "Doula", "Mom"],
  careTeam: "OB, therapist, lactation consultant",
  emergencyContact: "Partner, 555-0100",
  emergencyContactName: "Partner",
  emergencyContactPhone: "555-0100",
  consent: { aiSupport: true },
};

const mockEntries: JournalEntry[] = [
  {
    id: "today",
    date: new Date(),
    mood: "Anxious",
    painLevel: 6,
    entryText: "I barely slept and feeding felt hard today. I need help making tonight less overwhelming.",
    userId: "preview",
    postpartum: {
      anxietyLevel: 7,
      overwhelmLevel: 8,
      sleepHours: 3,
      sleepQuality: "severe",
      recoveryConcern: "moderate",
      feedingStress: "severe",
      intrusiveThoughts: "mild",
      unwantedScaryThoughts: "mild",
      thoughtsFeelUncontrollable: false,
      harmConcern: false,
      notFeelingSafe: false,
      bonding: "mixed",
      supportToday: "limited",
      safetyConcern: false,
    },
    risk: {
      level: "elevated",
      flags: ["severe_recovery_concern"],
      escalationRecommended: true,
    },
  },
  {
    id: "yesterday",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    mood: "Okay",
    painLevel: 5,
    entryText: "The morning was manageable, but the evening felt lonely.",
    userId: "preview",
    postpartum: {
      anxietyLevel: 5,
      overwhelmLevel: 6,
      sleepHours: 4,
      sleepQuality: "moderate",
      recoveryConcern: "mild",
      feedingStress: "moderate",
      intrusiveThoughts: "none",
      unwantedScaryThoughts: "none",
      thoughtsFeelUncontrollable: false,
      harmConcern: false,
      notFeelingSafe: false,
      bonding: "connected",
      supportToday: "some",
      safetyConcern: false,
    },
    risk: { level: "low", flags: [], escalationRecommended: false },
  },
];

const tabs = ["onboarding", "today", "check-in", "journal", "support", "summary"] as const;
type Tab = (typeof tabs)[number];

export default function MobilePreviewPage() {
  const previewEnabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_MOBILE_PREVIEW === "true";

  if (!previewEnabled) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-zinc-950 px-6 text-center text-sm text-zinc-300">
        Mobile preview is disabled in production.
      </main>
    );
  }

  return (
    <Suspense fallback={null}>
      <MobilePreviewInner />
    </Suspense>
  );
}

function MobilePreviewInner() {
  const searchParams = useSearchParams();
  const initialTab = useMemo(() => {
    const value = searchParams.get("tab");
    return tabs.includes(value as Tab) ? (value as Tab) : "today";
  }, [searchParams]);
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <main className="fixed inset-0 bg-zinc-950 text-zinc-950">
      <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-background">
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-3 py-2 font-semibold capitalize ${tab === item ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {tab === "onboarding" && (
            <div className="relative h-full w-full bg-emerald-50 dark:bg-zinc-950">
              <PostpartumOnboarding
                open
                mode="onboarding"
                initialProfile={{
                  babyBirthDate: "2026-07-08",
                  deliveryType: "c_section",
                  feedingMode: "combo",
                  supportSystem: ["Partner", "Doula"],
                  careTeam: "OB, therapist, lactation consultant",
                  emergencyContactName: "Partner",
                  emergencyContactPhone: "555-0100",
                  consent: { aiSupport: false },
                }}
                onSave={() => setTab("today")}
              />
            </div>
          )}
          {tab === "today" && (
            <HomeScreen
              user={{ displayName: "Maya" }}
              onSignOut={() => undefined}
              prompt="What would make the next hour feel a little more supported?"
              encouragement="One small check-in is enough."
              journalEntries={mockEntries}
              postpartumProfile={mockProfile}
              isPremium
              onOpenProfile={() => setTab("check-in")}
              onOpenSupport={() => setTab("support")}
              onManageSubscription={() => undefined}
              foundingMemberCount={124}
            />
          )}
          {tab === "check-in" && <CheckInScreen onComplete={() => setTab("support")} />}
          {tab === "journal" && (
            <JournalScreen
              prompt="What would make the next hour feel a little more supported?"
              companionContext={{
                mood: "Anxious",
                painLevel: 6,
                postpartum: mockEntries[0].postpartum,
                risk: mockEntries[0].risk,
                profile: mockProfile,
              }}
              onOpenSupport={() => setTab("support")}
            />
          )}
          {tab === "support" && (
            <EscalateScreen
              variant="urgent"
              risk={{ level: "urgent", flags: ["high_distress_without_support"], escalationRecommended: true }}
              signals={mockEntries[0].postpartum}
              mood="Anxious"
              painLevel={6}
              profile={mockProfile}
              onDismiss={() => setTab("today")}
            />
          )}
          {tab === "summary" && <JournalSidebar entries={mockEntries} postpartumProfile={mockProfile} />}
        </div>
      </div>
    </main>
  );
}
