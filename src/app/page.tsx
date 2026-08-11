"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Firebase & Types
import { useAuth, useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import type { JournalEntry, Mood, PostpartumProfile, PostpartumSignals, RiskAssessment } from "@/lib/types";
import { assessPostpartumRisk } from "@/lib/postpartum-risk";

// Navigation
import { SwipeContainer, type ScreenKey } from "@/components/havyn/swipe-container";
import { BottomNav } from "@/components/havyn/bottom-nav";
import { HomeScreen } from "@/components/havyn/home-screen";
import { JournalScreen } from "@/components/havyn/journal-screen";
import { JournalSidebar } from "@/components/havyn/journal-sidebar";
import { CalendarView } from "@/components/havyn/calendar-view";
import { CheckInScreen } from "@/components/havyn/check-in-screen";
import { EscalateScreen } from "@/components/havyn/escalate-screen";
import { AnimatePresence, motion } from "framer-motion";

// Business Logic Hooks
import { useDailyCheckIn } from "@/hooks/use-daily-check-in";
import { useDynamicCTA } from "@/hooks/use-dynamic-cta";
import { useReflectionPrompts } from "@/hooks/use-reflection-prompts";
import { useSubscription } from "@/hooks/use-subscription";
import { canGeneratePrompt, incrementPromptUsage } from "@/services/prompt-service";
import { Paywall } from "@/components/havyn/paywall";
import { PostpartumOnboarding } from "@/components/havyn/postpartum-onboarding";
import { InstallAppPrompt } from "@/components/havyn/install-app-prompt";
import { ServiceWorkerRegistration } from "@/components/havyn/service-worker-registration";

export default function HavynAppPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  // Firebase Collections
  const userRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const journalEntriesRef = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "journalEntries");
  }, [firestore, user]);

  const appStatsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, "app", "stats");
  }, [firestore]);

  const { data: userProfile, loading: profileLoading } = useDoc(userRef);
  const { data: journalEntries, loading: entriesLoading } = useCollection<JournalEntry>(journalEntriesRef);
  const { data: appStats } = useDoc(appStatsRef);
  // Dev-preview mock session has no Firestore backend (see useFirestore); local
  // state stands in for the saved profile so onboarding can complete.
  const [mockPostpartumProfile, setMockPostpartumProfile] = useState<PostpartumProfile | null>(null);
  const postpartumProfile = (mockPostpartumProfile ?? userProfile?.postpartumProfile ?? null) as PostpartumProfile | null;

  // Subscription
  const sub = useSubscription(userProfile, profileLoading);

  // Business Logic Hooks
  const dailyCheckIn = useDailyCheckIn();
  const dynamicCTA = useDynamicCTA(journalEntries || []);
  const reflectionPrompts = useReflectionPrompts(
    journalEntries || [], 
    userProfile?.lastPromptDate
  );

  // Navigation: bottom nav + horizontal swipe both drive the same screen state.
  // Check-in and Escalate are separate full-screen overlays, not swipe destinations —
  // crisis support in particular must never be gesture-gated.
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("home");
  const [checkInOpen, setCheckInOpen] = useState(false);

  // State to bridge Check In and Journal
  const [pendingMood, setPendingMood] = useState<Mood>("Okay");
  const [pendingPain, setPendingPain] = useState<number>(0);
  const [pendingPostpartum, setPendingPostpartum] = useState<PostpartumSignals | null>(null);
  const [activeRisk, setActiveRisk] = useState<RiskAssessment | null>(null);
  const [supportSheetOpen, setSupportSheetOpen] = useState(false);
  const [urgentSupportOpen, setUrgentSupportOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && firestore) {
      dailyCheckIn.checkTodayStatus();
    }
  }, [user, firestore]);

  useEffect(() => {
    if (!profileLoading && user && !postpartumProfile?.consent?.aiSupport) {
      setProfileSheetOpen(true);
    }
  }, [profileLoading, user, postpartumProfile?.consent?.aiSupport]);

  const handleSavePostpartumProfile = async (profile: PostpartumProfile) => {
    if (!userRef) {
      setMockPostpartumProfile(profile);
      setProfileSheetOpen(false);
      return;
    }

    setIsSavingProfile(true);
    try {
      await setDoc(userRef, { postpartumProfile: profile }, { merge: true });
      setProfileSheetOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };


  const handleSignOut = async () => {
    localStorage.removeItem("havyn_dev_mock_user");
    if (auth) {
      await auth.signOut();
    }
    router.push('/login');
  };

  const handleManageSubscription = async () => {
    if (!user || !auth) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Failed to open subscription portal:", error);
    }
  };

  const handleCheckInComplete = async (mood: Mood, painLevel: number, postpartum: PostpartumSignals) => {
    const formattedMood = mood;
    setPendingMood(formattedMood);
    setPendingPain(painLevel);
    setPendingPostpartum(postpartum);
    const risk = assessPostpartumRisk(postpartum);
    setActiveRisk(risk);
    setUrgentSupportOpen(risk.level === "urgent");
    setSupportSheetOpen(risk.escalationRecommended && risk.level !== "urgent");
    setCheckInOpen(false);
    if (risk.level !== "urgent") {
      setActiveScreen("journal");
    }

    // We can save a placeholder check-in if user doesn't journal, or wait for the journal.
    // For this flow, we pre-log the check-in to satisfy "hasCheckedInToday" and then the journal will log *another* comprehensive entry, or this is sufficient.
    await dailyCheckIn.submitCheckIn({
      mood: formattedMood,
      painLevel,
      entryText: "",
      postpartum
    }, sub.tier);
    
    // Generate prompt for the journal (gated for free users)
    if (firestore && user) {
      const canGenerate = await canGeneratePrompt(firestore, user.uid, sub.tier);
      if (canGenerate) {
        reflectionPrompts.generateNewPrompt({ postpartum, risk, profile: postpartumProfile ?? undefined });
        await incrementPromptUsage(firestore, user.uid);
      } else {
        // Don't interrupt — give them a fallback prompt so they can still journal
        reflectionPrompts.getQuickPrompt();
      }
    }
    dynamicCTA.refreshCTA();
  };

  const handleJournalSubmit = async (text: string) => {
    await dailyCheckIn.submitCheckIn({
      mood: pendingMood,
      painLevel: pendingPain,
      entryText: text,
      ...(pendingPostpartum ? { postpartum: pendingPostpartum } : {})
    }, sub.tier);
    reflectionPrompts.clearCurrentPrompt();
  };

  if (userLoading || entriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) return null; // Wait for redirect

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] bg-background text-foreground overflow-hidden overscroll-none">
      <SwipeContainer
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        homeScreen={
          <HomeScreen
            user={user}
            onSignOut={handleSignOut}
            encouragement={dynamicCTA.encouragement}
            prompt={reflectionPrompts.currentPrompt}
            journalEntries={journalEntries || []}
            postpartumProfile={postpartumProfile}
            isPremium={sub.isPremium}
            triggerPaywall={sub.triggerPaywall}
            subscription={sub}
            onManageSubscription={handleManageSubscription}
            onOpenProfile={() => setProfileSheetOpen(true)}
            onOpenSupport={() => setSupportSheetOpen(true)}
            onOpenCheckIn={() => setCheckInOpen(true)}
            foundingMemberCount={appStats?.foundingMembersCount ?? 0}
          />
        }
        journalScreen={
          <JournalScreen
            prompt={reflectionPrompts.currentPrompt}
            isSubmitting={dailyCheckIn.isSubmitting}
            onSubmit={handleJournalSubmit}
            companionContext={{
              mood: pendingMood,
              painLevel: pendingPain,
              postpartum: pendingPostpartum,
              risk: activeRisk,
              profile: postpartumProfile,
            }}
            onOpenSupport={() => setSupportSheetOpen(true)}
          />
        }
        journalSidebar={<JournalSidebar entries={journalEntries || []} postpartumProfile={postpartumProfile} />}
        calendarScreen={
          <CalendarView
            entries={journalEntries || []}
            isPremium={sub.isPremium}
            triggerPaywall={sub.triggerPaywall}
          />
        }
      />
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onOpenCheckIn={() => setCheckInOpen(true)}
        onOpenSupport={() => setSupportSheetOpen(true)}
      />
      <AnimatePresence>
        {checkInOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <CheckInScreen
              onComplete={handleCheckInComplete}
              onClose={() => setCheckInOpen(false)}
              isSubmitting={dailyCheckIn.isSubmitting}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {supportSheetOpen && (
        <EscalateScreen
          variant="sheet"
          risk={activeRisk}
          signals={pendingPostpartum}
          mood={pendingMood}
          painLevel={pendingPain}
          profile={postpartumProfile}
          onDismiss={() => setSupportSheetOpen(false)}
        />
      )}
      {urgentSupportOpen && (
        <EscalateScreen
          variant="urgent"
          risk={activeRisk}
          signals={pendingPostpartum}
          mood={pendingMood}
          painLevel={pendingPain}
          profile={postpartumProfile}
          onDismiss={() => setUrgentSupportOpen(false)}
        />
      )}
      <ServiceWorkerRegistration />
      {!profileSheetOpen && !supportSheetOpen && !urgentSupportOpen && <InstallAppPrompt />}
      <PostpartumOnboarding
        open={profileSheetOpen}
        initialProfile={postpartumProfile}
        isSaving={isSavingProfile}
        onSave={handleSavePostpartumProfile}
        onClose={() => setProfileSheetOpen(false)}
        mode={postpartumProfile?.consent?.aiSupport ? "edit" : "onboarding"}
      />
      <Paywall
        feature={sub.paywallFeature}
        isOpen={sub.paywallOpen}
        onClose={sub.closePaywall}
      />
    </div>
  );
}
