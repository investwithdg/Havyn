/**
 * Daily Check-In Service
 * Handles all business logic for daily check-ins
 * Pure functions - no UI dependencies
 */

import { collection, addDoc, serverTimestamp, doc, setDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { JournalEntry, Mood } from "@/lib/types";
import { analyzeEntryAction } from "@/app/actions";
import { getTodayStart, getTomorrowStart } from "@/lib/date-utils";

export interface CheckInData {
  mood: Mood;
  painLevel: number;
  entryText: string;
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
  checkInData: CheckInData
): Promise<CheckInResult> {
  try {
    const journalEntriesRef = collection(firestore, "users", userId, "journalEntries");
    const userRef = doc(firestore, "users", userId);

    // Analyze entry (graceful failure)
    let analysis = null;
    try {
      analysis = await analyzeEntryAction({ entryText: checkInData.entryText });
    } catch (error) {
      console.warn("Analysis failed, proceeding without it:", error);
    }

    // Create entry
    const entryData = {
      ...checkInData,
      date: serverTimestamp(),
      userId,
      analysis,
    };

    const docRef = await addDoc(journalEntriesRef, entryData);
    
    // Update user's last prompt date
    await setDoc(userRef, { lastPromptDate: new Date().toISOString() }, { merge: true });

    return {
      success: true,
      entry: { id: docRef.id, ...entryData } as JournalEntry,
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
