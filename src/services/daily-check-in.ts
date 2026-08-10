/**
 * Daily Check-In Service
 * Handles all business logic for daily check-ins
 * Pure functions - no UI dependencies
 */

import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { JournalEntry, Mood, PostpartumSignals } from "@/lib/types";
import { assessPostpartumRisk } from "@/lib/postpartum-risk";
import type { SubscriptionTier } from "@/services/subscription-service";
import { analyzeEntryAction, deepAnalyzeEntryAction } from "@/app/actions";
import { getTodayStart, getTomorrowStart } from "@/lib/date-utils";

export interface CheckInData {
  mood: Mood;
  painLevel: number;
  entryText: string;
  postpartum?: PostpartumSignals;
}

export interface CheckInResult {
  success: boolean;
  error?: string;
  entry?: JournalEntry;
}

/**
 * Records a daily check-in entry
 */
export async function recordDailyCheckIn(
  firestore: Firestore,
  userId: string,
  checkInData: CheckInData,
  tier: SubscriptionTier = "free"
): Promise<CheckInResult> {
  try {
    const journalEntriesRef = collection(firestore, "users", userId, "journalEntries");
    const userRef = doc(firestore, "users", userId);

    // Look for today's entry to upsert
    const today = getTodayStart();
    const tomorrow = getTomorrowStart();
    const todayQuery = query(journalEntriesRef, where("date", ">=", today), where("date", "<", tomorrow), limit(1));
    const snapshot = await getDocs(todayQuery);

    const risk = checkInData.postpartum ? assessPostpartumRisk(checkInData.postpartum) : null;

    let analysis = null;
    try {
      if (checkInData.entryText && checkInData.entryText.trim().length > 10) {
        if (tier === "premium") {
          // Premium: use deep analysis with recent entries for context
          const recentQuery = query(journalEntriesRef, orderBy("date", "desc"), limit(7));
          const recentSnap = await getDocs(recentQuery);
          const recentEntries = recentSnap.docs.map((d) => {
            const data = d.data();
            const entryDate = data.date?.toDate?.() ?? new Date(data.date);
            return {
              mood: data.mood || "Okay",
              painLevel: data.painLevel ?? 0,
              date: entryDate.toISOString(),
              text: data.entryText || undefined,
            };
          });

          analysis = await deepAnalyzeEntryAction({
            entryText: checkInData.entryText,
            recentEntries,
          });
        } else {
          analysis = await analyzeEntryAction({ entryText: checkInData.entryText });
        }
      }
    } catch (error) {
      console.warn("Analysis failed, proceeding without it:", error);
    }

    const entryData = {
      ...checkInData,
      ...(risk ? { risk } : {}),
      userId,
      ...(analysis ? { analysis } : {})
    };

    let docId = "";

    if (!snapshot.empty) {
      // Upsert existing document
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();
      
      const mergedEntry = {
        ...existingData,
        mood: checkInData.mood || existingData.mood,
        painLevel: checkInData.painLevel !== undefined ? checkInData.painLevel : existingData.painLevel,
        entryText: checkInData.entryText || existingData.entryText, // Do not wipe text if empty
        ...(checkInData.postpartum ? { postpartum: checkInData.postpartum } : {}),
        ...(risk ? { risk } : {}),
        ...((analysis || existingData.analysis) ? { analysis: analysis || existingData.analysis } : {})
      };
      
      await setDoc(doc(firestore, "users", userId, "journalEntries", existingDoc.id), mergedEntry, { merge: true });
      docId = existingDoc.id;
    } else {
      // Create new document
      const finalEntry = {
        ...entryData,
        date: serverTimestamp()
      };
      const docRef = await addDoc(journalEntriesRef, finalEntry);
      docId = docRef.id;
    }
    
    // Update user's last prompt date
    await setDoc(userRef, { lastPromptDate: new Date().toISOString() }, { merge: true });

    return {
      success: true,
      entry: { id: docId, ...entryData } as JournalEntry,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save check-in",
    };
  }
}

/**
 * Checks if user has completed today's check-in
 */
export async function hasTodayCheckIn(
  firestore: Firestore,
  userId: string
): Promise<boolean> {
  try {
    const today = getTodayStart();
    const tomorrow = getTomorrowStart();

    const journalEntriesRef = collection(firestore, "users", userId, "journalEntries");
    const todayQuery = query(
      journalEntriesRef,
      where("date", ">=", today),
      where("date", "<", tomorrow),
      limit(1)
    );

    const snapshot = await getDocs(todayQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking today's entry:", error);
    return false;
  }
}

/**
 * Gets the most recent check-in entry
 */
export async function getRecentCheckIn(
  firestore: Firestore,
  userId: string
): Promise<JournalEntry | null> {
  try {
    const journalEntriesRef = collection(firestore, "users", userId, "journalEntries");
    const recentQuery = query(journalEntriesRef, orderBy("date", "desc"), limit(1));
    
    const snapshot = await getDocs(recentQuery);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as JournalEntry;
  } catch (error) {
    console.error("Error getting recent check-in:", error);
    return null;
  }
}
