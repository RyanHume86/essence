// src/lib/winMoment.js
// Win-moment progress store: a per-day completion counter persisted in
// localStorage, plus a tiny module-level event emitter so the UI can react to
// completions without coupling to the task hook.
//
// Frontend-only by design (see spec): there is NO Base44 entity for this. The
// count is keyed by local calendar day, so a new day naturally reads 0 and a
// stale key is simply ignored (never decremented, never cleaned up here).
//
// Contract:
//   recordCompletion(today?) -> number  // increments today's count, persists, emits
//   getTodayCount(today?)     -> number  // reads today's count (0 if absent / unknown)
//   subscribe(fn)             -> () => void  // returns an unsubscribe function
//
// `today` is injectable as a "YYYY-MM-DD" string (defaults to local today) so
// tests can simulate day boundaries without mocking the clock. date-fns format
// reads the date in local time, matching the recurrence engine's convention.

import { format } from 'date-fns';

/** localStorage key prefix; the day is appended as YYYY-MM-DD. */
const KEY_PREFIX = 'essence_win_';

/** @returns {string} today as YYYY-MM-DD in local time */
const todayKey = () => format(new Date(), 'yyyy-MM-dd');

/** @param {string} day YYYY-MM-DD @returns {string} the localStorage key for that day */
const storageKey = (day) => `${KEY_PREFIX}${day}`;

/** @type {Set<(count: number) => void>} module-level subscribers */
const listeners = new Set();

/**
 * Reads the stored completion count for a given day.
 * Guards against SSR / non-browser environments and any non-integer junk.
 * @param {string} [today] YYYY-MM-DD; defaults to local today
 * @returns {number} the count for that day, or 0
 */
export function getTodayCount(today = todayKey()) {
  if (typeof window === 'undefined' || !window.localStorage) return 0;
  const raw = window.localStorage.getItem(storageKey(today));
  const n = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Increments today's completion count, persists it, and emits the new value to
 * all subscribers. Call this on a genuine not-completed -> completed transition.
 * @param {string} [today] YYYY-MM-DD; defaults to local today
 * @returns {number} the new count
 */
/**
 * Best-effort persist; never throws. localStorage.setItem can throw in private
 * mode or on quota — swallow it so callers (e.g. an optimistic toggle) are never
 * broken by storage being unavailable; the in-memory emit still fires.
 * @param {string} day YYYY-MM-DD @param {number} value
 */
function persist(day, value) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey(day), String(value));
  } catch {
    /* storage unavailable (private mode / quota) — ignore */
  }
}

export function recordCompletion(today = todayKey()) {
  const next = getTodayCount(today) + 1;
  persist(today, next);
  for (const fn of listeners) fn(next);
  return next;
}

/**
 * Reverses one recorded completion (floored at 0). Used to compensate when an
 * optimistic task completion is rolled back after a failed save, so the count
 * never drifts above the number of completions that actually stuck.
 * @param {string} [today] YYYY-MM-DD; defaults to local today
 * @returns {number} the new count
 */
export function undoCompletion(today = todayKey()) {
  const next = Math.max(0, getTodayCount(today) - 1);
  persist(today, next);
  for (const fn of listeners) fn(next);
  return next;
}

/**
 * Subscribes to win events. The callback receives the new count on each
 * completion.
 * @param {(count: number) => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
