// Pure recurrence tests. Run with the Node built-in runner (no extra deps):
//   node --test src/lib/recurrence.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { getNextDueDate, buildNextRecurringTask } from "./recurrence.js";

test("daily advances by one day, across month and year ends", () => {
  assert.equal(getNextDueDate("2026-06-10", "daily"), "2026-06-11");
  assert.equal(getNextDueDate("2026-06-30", "daily"), "2026-07-01");
  assert.equal(getNextDueDate("2026-12-31", "daily"), "2027-01-01");
});

test("weekly advances by seven days", () => {
  assert.equal(getNextDueDate("2026-06-10", "weekly"), "2026-06-17");
});

test("weekdays skips the weekend", () => {
  assert.equal(getNextDueDate("2026-06-10", "weekdays"), "2026-06-11"); // Wed -> Thu
  assert.equal(getNextDueDate("2026-06-12", "weekdays"), "2026-06-15"); // Fri -> Mon
  assert.equal(getNextDueDate("2026-06-13", "weekdays"), "2026-06-15"); // Sat -> Mon
  assert.equal(getNextDueDate("2026-06-14", "weekdays"), "2026-06-15"); // Sun -> Mon
});

test("missing due date advances from today", () => {
  assert.equal(getNextDueDate(null, "daily", "2026-06-10"), "2026-06-11");
});

test("unknown recurrence throws", () => {
  assert.throws(() => getNextDueDate("2026-06-10", "monthly"));
});

test("buildNextRecurringTask returns null when not recurring", () => {
  assert.equal(buildNextRecurringTask({ title: "x", recurrence: "none" }), null);
  assert.equal(buildNextRecurringTask({ title: "x" }), null);
});

test("buildNextRecurringTask copies fields, advances date, clears completion", () => {
  const next = buildNextRecurringTask({
    id: "abc", title: "Run", category: "Health", comment: "5k",
    due_date: "2026-06-10", due_time: "07:00", recurrence: "daily", priority: "high",
    completed: true, today: true, subtasks: [{ id: "s", title: "warm up", completed: true }],
  });
  assert.equal(next.title, "Run");
  assert.equal(next.category, "Health");
  assert.equal(next.due_date, "2026-06-11");
  assert.equal(next.due_time, "07:00");
  assert.equal(next.recurrence, "daily");
  assert.equal(next.priority, "high");
  assert.equal(next.completed, false);
  assert.equal(next.today, false);
  assert.deepEqual(next.subtasks, []);
  assert.equal(next.id, undefined);
});
