import { parseISO, isToday, isTomorrow, isPast } from "date-fns";

// Shared task predicates and grouping. Dates are stored as ISO date strings.

export function isOverdue(task) {
  if (!task.due_date || task.completed) return false;
  const d = parseISO(task.due_date);
  return isPast(d) && !isToday(d);
}

export function isDueToday(task) {
  return !!task.due_date && isToday(parseISO(task.due_date));
}

// The Today surface: anything overdue, due today, or flagged for today, and
// not yet complete. The `today` flag is set by the user (see Step 2).
export function inToday(task) {
  return !task.completed && (isOverdue(task) || isDueToday(task) || !!task.today);
}

// A task belongs to Upcoming when it is active and not already pulled into Today.
export function inUpcoming(task) {
  return !task.completed && !inToday(task);
}

// Label for an Upcoming task's date group.
export function upcomingGroupLabel(task) {
  if (!task.due_date) return "No Due Date";
  const d = parseISO(task.due_date);
  if (isTomorrow(d)) return "Tomorrow";
  return null; // a specific future date, formatted by the caller
}
