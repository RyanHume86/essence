// Recurrence — the only real domain logic in v1. Keep it here, keep it pure,
// keep it well-tested.
//
// Dates are handled as plain ISO date strings ("YYYY-MM-DD") to match how the
// local SQLite stores `due_date`. All arithmetic is done at UTC midnight so we
// never drift across timezones or daylight-saving boundaries.

export const RECURRENCE_TYPES = ['daily', 'weekdays', 'weekly'];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse a "YYYY-MM-DD" string into a Date at UTC midnight. */
function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a Date as a "YYYY-MM-DD" string (UTC). */
export function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

/** Today's date as a "YYYY-MM-DD" string (UTC). */
export function todayISO(now = new Date()) {
  return formatISODate(new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )));
}

function addDays(date, n) {
  return new Date(date.getTime() + n * MS_PER_DAY);
}

function isWeekend(date) {
  const day = date.getUTCDay(); // 0 = Sun, 6 = Sat
  return day === 0 || day === 6;
}

/**
 * Advance a due date according to a recurrence keyword.
 *
 *   daily    -> + 1 day
 *   weekdays -> the next Mon–Fri strictly after the base date
 *   weekly   -> + 7 days
 *
 * When a task has no due date we advance from `today`, so a recurring task
 * created without a date still produces a sensible next instance.
 *
 * @param {string|null|undefined} currentDue  ISO date string or null.
 * @param {'daily'|'weekdays'|'weekly'} recurrence
 * @param {string} [today]  ISO date string used when currentDue is missing.
 * @returns {string} the next due date as an ISO date string.
 */
export function getNextDueDate(currentDue, recurrence, today = todayISO()) {
  if (!RECURRENCE_TYPES.includes(recurrence)) {
    throw new Error(`Unknown recurrence: ${recurrence}`);
  }

  const base = parseISODate(currentDue || today);

  switch (recurrence) {
    case 'daily':
      return formatISODate(addDays(base, 1));

    case 'weekly':
      return formatISODate(addDays(base, 7));

    case 'weekdays': {
      // Step forward at least one day, then skip any weekend days.
      let next = addDays(base, 1);
      while (isWeekend(next)) {
        next = addDays(next, 1);
      }
      return formatISODate(next);
    }

    default:
      throw new Error(`Unknown recurrence: ${recurrence}`);
  }
}

/**
 * Build the field set for the next instance of a recurring task, given the task
 * that was just completed. Returns null when the task does not recur.
 *
 * The next instance is a fresh active task: same descriptive fields, advanced
 * due date, cleared completion. The caller is responsible for assigning a new
 * id / created_at and inserting it.
 *
 * @param {object} task   the task being completed.
 * @param {string} [today]
 */
export function buildNextRecurringTask(task, today = todayISO()) {
  if (!task.recurrence) return null;

  return {
    title: task.title,
    stream: task.stream ?? null,
    context: task.context ?? null,
    project_id: task.project_id ?? null,
    due_date: getNextDueDate(task.due_date, task.recurrence, today),
    status: 'active',
    recurrence: task.recurrence,
    sort_order: task.sort_order ?? null,
    completed_at: null,
  };
}
