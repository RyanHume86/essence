// src/lib/recurrence.js
// Recurrence engine for Akha, reconciled to the real Base44 Task entity.
//
// Contract differences from the earlier TypeScript draft (deliberate, to match the repo):
//   - Dates are date-only "YYYY-MM-DD" strings (Base44 `due_date`, format: date),
//     not full ISO datetimes. All public functions take and return these strings.
//   - Completion is the boolean `completed`, not a timestamp. The completion DATE
//     used for completion-anchored recurrence is "today" at the moment of toggling.
//   - New entity fields this relies on: `recurrence` (object|null) and
//     `occurrence_count` (integer). See base44/entities/Task.jsonc.
//   - Uses date-fns (already a dependency) instead of hand-rolled date maths.
//
// Timezone safety: date-fns parseISO interprets a date-only string as LOCAL
// midnight, and format(..., 'yyyy-MM-dd') reads it back in local time, so the
// string round-trips without UTC drift. Tests confirm this across UTC-8/+2/+14.

import {
  parseISO,
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  getDaysInMonth,
  startOfMonth,
  setDate,
  differenceInCalendarDays,
} from 'date-fns';

/**
 * @typedef {Object} RecurrenceEnd
 * @property {'never'|'onDate'|'afterCount'} type
 * @property {string} [date]  YYYY-MM-DD, when type === 'onDate'
 * @property {number} [count] total occurrences in the series, when type === 'afterCount'
 */

/**
 * @typedef {Object} RecurrenceRule
 * @property {'fixed'|'completion'} anchor
 * @property {'day'|'week'|'month'|'year'} unit
 * @property {number} interval  every N units, >= 1
 * @property {number[]} [weekdays]      0 (Sun) to 6 (Sat). Fixed weekly only. v1: interval must be 1 if set.
 * @property {number} [monthAnchorDay]  1 to 31. Fixed monthly only. Preserves "the 31st".
 * @property {RecurrenceEnd} end
 */

/**
 * @typedef {Object} Task   The Base44 Task entity (plus the two new recurrence fields).
 * @property {string} [id]
 * @property {string} title
 * @property {boolean} completed
 * @property {string} [category]
 * @property {string} [due_date]          YYYY-MM-DD
 * @property {string} [comment]
 * @property {Array} [subtasks]
 * @property {RecurrenceRule|null} [recurrence]
 * @property {number} [occurrence_count]
 */

/** @param {string} dateStr YYYY-MM-DD @returns {Date} local-midnight Date */
const fromISO = (dateStr) => parseISO(dateStr);
/** @param {Date} d @returns {string} YYYY-MM-DD */
const toISO = (d) => format(d, 'yyyy-MM-dd');
/** @returns {string} today as YYYY-MM-DD in local time */
export const todayISO = () => format(new Date(), 'yyyy-MM-dd');

/**
 * Adds n months, clamping from a fixed anchor day rather than the input day,
 * so a "monthly on the 31st" task returns to 31 after a short month.
 * @param {Date} date @param {number} n @param {number} anchorDay @returns {Date}
 */
function addMonthsAnchored(date, n, anchorDay) {
  const target = addMonths(startOfMonth(date), n);
  return setDate(target, Math.min(anchorDay, getDaysInMonth(target)));
}

/** @param {Date} date @param {RecurrenceRule['unit']} unit @param {number} interval @returns {Date} */
function addInterval(date, unit, interval) {
  switch (unit) {
    case 'day':   return addDays(date, interval);
    case 'week':  return addWeeks(date, interval);
    case 'month': return addMonths(date, interval); // clamps Jan 31 -> Feb 28/29
    case 'year':  return addYears(date, interval);  // clamps Feb 29 -> Feb 28
    default:      return date;
  }
}

/** @param {RecurrenceRule} rule @param {Date} currentDate @param {Date} todayDate @returns {Date} */
function nextWeekdayOccurrence(rule, currentDate, todayDate) {
  const days = [...rule.weekdays].sort((a, b) => a - b);
  let from = addDays(currentDate, 1);
  if (isBefore(from, todayDate)) from = todayDate;
  for (let i = 0; i < 14; i++) {
    const cand = addDays(from, i);
    if (days.includes(cand.getDay())) return cand;
  }
  return from; // unreachable for a non-empty weekday set
}

/**
 * Computes the next due date for a recurring task.
 * @param {RecurrenceRule} rule
 * @param {string} currentDueDate  YYYY-MM-DD, the occurrence being completed
 * @param {string} completionDate  YYYY-MM-DD, when it was actually completed
 * @param {string} today           YYYY-MM-DD
 * @returns {string} next due date, YYYY-MM-DD
 */
export function computeNextDueDate(rule, currentDueDate, completionDate, today) {
  if (rule.anchor === 'completion') {
    return toISO(addInterval(fromISO(completionDate), rule.unit, rule.interval));
  }

  const cur = fromISO(currentDueDate);
  const floor = fromISO(today);

  if (rule.unit === 'week' && rule.weekdays && rule.weekdays.length > 0) {
    return toISO(nextWeekdayOccurrence(rule, cur, floor));
  }

  if (rule.unit === 'month') {
    const anchor = rule.monthAnchorDay ?? cur.getDate();
    let next = addMonthsAnchored(cur, rule.interval, anchor);
    while (isBefore(next, floor)) next = addMonthsAnchored(next, rule.interval, anchor);
    return toISO(next);
  }

  // Fixed day / weekly-cadence / year: advance from the schedule, then roll
  // forward to the next slot not in the past. Anchoring to the schedule (not the
  // completion date) is what prevents the "skip an extra cycle" bug.
  let next = addInterval(cur, rule.unit, rule.interval);
  while (isBefore(next, floor)) next = addInterval(next, rule.unit, rule.interval);
  return toISO(next);
}

/**
 * Gates a computed next date against the rule's end condition.
 * Returns null when the series has finished.
 * @param {string|null} next  YYYY-MM-DD or null
 * @param {RecurrenceRule} rule
 * @param {number} nextCount  occurrence_count AFTER incrementing for this completion
 * @returns {string|null}
 */
export function applyEnd(next, rule, nextCount) {
  if (!next) return null;
  if (rule.end.type === 'onDate' && rule.end.date) {
    // stop when next is after the end date
    return isBefore(fromISO(rule.end.date), fromISO(next)) ? null : next;
  }
  if (rule.end.type === 'afterCount' && rule.end.count != null) {
    return nextCount >= rule.end.count ? null : next; // end at exactly `count` occurrences
  }
  return next;
}

/**
 * Returns the fields to persist via base44.entities.Task.update(id, fields)
 * when a task is completed. Replaces a plain `completed` toggle for recurring tasks.
 *   - non-recurring        -> { completed: true }
 *   - recurring, continuing -> { completed: false, due_date, occurrence_count }
 *   - recurring, series end -> { completed: true, recurrence: null, occurrence_count }
 * @param {Task} task
 * @param {string} [today]  YYYY-MM-DD completion date; defaults to local today
 * @returns {Partial<Task>}
 */
export function completeRecurringTask(task, today = todayISO()) {
  if (!task.recurrence || !task.due_date) {
    return { completed: true };
  }
  const nextCount = (task.occurrence_count ?? 0) + 1;
  const raw = computeNextDueDate(task.recurrence, task.due_date, today, today);
  const next = applyEnd(raw, task.recurrence, nextCount);

  if (!next) {
    return { completed: true, recurrence: null, occurrence_count: nextCount };
  }
  return { completed: false, due_date: next, occurrence_count: nextCount };
}

// --- Construction and preview (call these from the recurrence editor) ---

/**
 * Builds a RecurrenceRule and populates derived fields so the editor cannot
 * forget them. Always use this instead of writing a rule literal by hand.
 * @param {string} seedDueDate  YYYY-MM-DD the user picked as the first occurrence
 * @param {{anchor: RecurrenceRule['anchor'], unit: RecurrenceRule['unit'], interval?: number, weekdays?: number[], end?: RecurrenceEnd}} opts
 * @returns {RecurrenceRule}
 */
export function createRecurrenceRule(seedDueDate, opts) {
  const interval = opts.interval ?? 1;
  if (interval < 1) throw new Error('interval must be >= 1');

  const hasWeekdays = opts.unit === 'week' && !!opts.weekdays && opts.weekdays.length > 0;
  if (hasWeekdays && interval > 1) {
    throw new Error('Multi-weekday recurrence with interval > 1 is not supported in v1');
  }

  /** @type {RecurrenceRule} */
  const rule = {
    anchor: opts.anchor,
    unit: opts.unit,
    interval,
    end: opts.end ?? { type: 'never' },
  };
  if (hasWeekdays) rule.weekdays = [...opts.weekdays].sort((a, b) => a - b);
  if (opts.unit === 'month' && opts.anchor === 'fixed') {
    rule.monthAnchorDay = fromISO(seedDueDate).getDate();
  }
  return rule;
}

/**
 * First occurrence on or after `fromDueDate`. Use to seed a task's due_date,
 * especially for weekly-by-weekday rules where the chosen start may not land
 * on a selected weekday.
 * @param {RecurrenceRule} rule @param {string} fromDueDate YYYY-MM-DD @returns {string}
 */
export function firstOccurrenceOnOrAfter(rule, fromDueDate) {
  const start = fromISO(fromDueDate);
  if (rule.unit === 'week' && rule.weekdays && rule.weekdays.length > 0) {
    const days = [...rule.weekdays].sort((a, b) => a - b);
    for (let i = 0; i < 7; i++) {
      const cand = addDays(start, i);
      if (days.includes(cand.getDay())) return toISO(cand);
    }
  }
  return toISO(start);
}

/**
 * The next `n` occurrence dates assuming on-time completion, for the live
 * "Next 3: ..." preview. Respects end conditions, so may return fewer than n.
 * @param {RecurrenceRule} rule @param {string} seedDueDate YYYY-MM-DD @param {number} n @returns {string[]}
 */
export function previewOccurrences(rule, seedDueDate, n) {
  if (n <= 0) return [];
  /** @type {string[]} */
  const out = [];
  let current = firstOccurrenceOnOrAfter(rule, seedDueDate);
  let completed = 0;
  for (let i = 0; i < n; i++) {
    out.push(current);
    completed += 1;
    const next = applyEnd(computeNextDueDate(rule, current, current, current), rule, completed);
    if (!next) break;
    current = next;
  }
  return out;
}

// --- Derived display helpers (calm overdue handling, optional) ---

/**
 * @param {Task} task @param {string} [today] YYYY-MM-DD
 * @returns {'earlier'|'today'|'upcoming'|'someday'}
 */
export function bucketFor(task, today = todayISO()) {
  if (!task.due_date) return 'someday';
  if (isBefore(fromISO(task.due_date), fromISO(today))) return 'earlier';
  if (task.due_date === today) return 'today';
  return 'upcoming';
}

/** @param {Task} task @param {string} [today] YYYY-MM-DD @returns {number} */
export function ageInDays(task, today = todayISO()) {
  if (!task.due_date) return 0;
  return differenceInCalendarDays(fromISO(today), fromISO(task.due_date));
}
