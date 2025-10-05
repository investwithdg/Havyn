/**
 * Date Utilities
 * Centralized date handling functions to remove duplication
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Converts Firestore Timestamp or Date to Date object
 */
export function toDate(date: Date | Timestamp): Date {
  return date instanceof Date ? date : date.toDate();
}

/**
 * Normalizes date to start of day (00:00:00.000)
 */
export function normalizeToStartOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Checks if two dates are the same day
 */
export function isSameDay(date1: Date | Timestamp, date2: Date | Timestamp): boolean {
  const d1 = normalizeToStartOfDay(toDate(date1));
  const d2 = normalizeToStartOfDay(toDate(date2));
  return d1.getTime() === d2.getTime();
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date | Timestamp): boolean {
  return isSameDay(date, new Date());
}

/**
 * Gets today's date normalized to start of day
 */
export function getTodayStart(): Date {
  return normalizeToStartOfDay(new Date());
}

/**
 * Gets tomorrow's date normalized to start of day
 */
export function getTomorrowStart(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return normalizeToStartOfDay(tomorrow);
}

/**
 * Calculates days between two dates
 */
export function daysBetween(date1: Date | Timestamp, date2: Date | Timestamp): number {
  const d1 = normalizeToStartOfDay(toDate(date1));
  const d2 = normalizeToStartOfDay(toDate(date2));
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generates unique ID based on current timestamp
 */
export function generateTimeBasedId(): string {
  return Date.now().toString();
}
