import { parseISO, isToday, isTomorrow, isPast } from "date-fns";

// Shared task predicates and grouping. Dates are stored as ISO date strings.

export function isOverdue(task) {
  if (!task.due_date || task.completed) return false;
  const d = parseISO(task.due_date);
  if (isPast(d) && !isToday(d)) return true;
  // Same-day task with a time that has already passed counts as overdue.
  if (isToday(d) && task.due_time) {
    return isPast(parseISO(`${task.due_date}T${task.due_time}`));
  }
  return false;
}

export function isDueToday(task) {
  return !!task.due_date && isToday(parseISO(task.due_date));
}

// The Today surface: anything overdue or due today, and not yet complete. The
// old manual "pin to Today" flag is dropped — "what's next" is derived from
// effective order (AD-3/AD-8), rebuilt as the Focus surface in Epic 3.
export function inToday(task) {
  return !task.completed && (isOverdue(task) || isDueToday(task));
}

// A task belongs to Upcoming when it is active and not already pulled into Today.
export function inUpcoming(task) {
  return !task.completed && !inToday(task);
}

// Case-insensitive title match for search. An empty query matches everything.
export function matchesQuery(task, q) {
  if (!q) return true;
  return (task.title || "").toLowerCase().includes(q);
}

// Label for an Upcoming task's date group.
export function upcomingGroupLabel(task) {
  if (!task.due_date) return "No Due Date";
  const d = parseISO(task.due_date);
  if (isTomorrow(d)) return "Tomorrow";
  return null; // a specific future date, formatted by the caller
}
