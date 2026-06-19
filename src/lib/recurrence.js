// Recurrence is the one piece of real domain logic. Keep it pure and tested.
//
// Due dates are plain ISO date strings ("YYYY-MM-DD"). All arithmetic is done at
// UTC midnight so we never drift across timezones or daylight-saving boundaries.

export const RECURRENCE_TYPES = ["daily", "weekdays", "weekly"];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function todayISO(now = new Date()) {
  return formatISODate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
}

function addDays(date, n) {
  return new Date(date.getTime() + n * MS_PER_DAY);
}

function isWeekend(date) {
  const day = date.getUTCDay(); // 0 = Sun, 6 = Sat
  return day === 0 || day === 6;
}

/**
 * Advance a due date by a recurrence keyword.
 *   daily    -> + 1 day
 *   weekdays -> the next Mon to Fri strictly after the base date
 *   weekly   -> + 7 days
 * When there is no due date we advance from `today`.
 */
export function getNextDueDate(currentDue, recurrence, today = todayISO()) {
  if (!RECURRENCE_TYPES.includes(recurrence)) {
    throw new Error(`Unknown recurrence: ${recurrence}`);
  }
  const base = parseISODate(currentDue || today);

  switch (recurrence) {
    case "daily":
      return formatISODate(addDays(base, 1));
    case "weekly":
      return formatISODate(addDays(base, 7));
    case "weekdays": {
      let next = addDays(base, 1);
      while (isWeekend(next)) next = addDays(next, 1);
      return formatISODate(next);
    }
    default:
      throw new Error(`Unknown recurrence: ${recurrence}`);
  }
}

/**
 * Build the field set for the next instance of a recurring task that was just
 * completed. Returns null when the task does not recur. The caller assigns the
 * id and inserts it.
 */
export function buildNextRecurringTask(task, today = todayISO()) {
  if (!task.recurrence || task.recurrence === "none") return null;
  return {
    title: task.title,
    category: task.category ?? null,
    comment: task.comment ?? null,
    due_date: getNextDueDate(task.due_date, task.recurrence, today),
    recurrence: task.recurrence,
    priority: task.priority ?? "normal",
    completed: false,
    today: false,
    subtasks: [],
  };
}
