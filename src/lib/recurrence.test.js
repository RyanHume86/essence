// Tests for the recurrence logic. Runnable with the Node built-in test runner
// (`node --test src/lib/recurrence.test.js`) so it needs no extra dependencies,
// and is also compatible with vitest if the project adopts it later.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getNextDueDate,
  buildNextRecurringTask,
  todayISO,
  formatISODate,
} from './recurrence.js';

test('daily advances by one day', () => {
  assert.equal(getNextDueDate('2026-06-10', 'daily'), '2026-06-11');
});

test('daily rolls over month boundaries', () => {
  assert.equal(getNextDueDate('2026-06-30', 'daily'), '2026-07-01');
});

test('daily rolls over year boundaries', () => {
  assert.equal(getNextDueDate('2026-12-31', 'daily'), '2027-01-01');
});

test('weekly advances by seven days', () => {
  assert.equal(getNextDueDate('2026-06-10', 'weekly'), '2026-06-17');
});

test('weekdays from a mid-week day goes to the next day', () => {
  // 2026-06-10 is a Wednesday -> Thursday.
  assert.equal(getNextDueDate('2026-06-10', 'weekdays'), '2026-06-11');
});

test('weekdays from Friday skips the weekend to Monday', () => {
  // 2026-06-12 is a Friday -> Monday 2026-06-15.
  assert.equal(getNextDueDate('2026-06-12', 'weekdays'), '2026-06-15');
});

test('weekdays from Saturday goes to Monday', () => {
  // 2026-06-13 is a Saturday -> Monday 2026-06-15.
  assert.equal(getNextDueDate('2026-06-13', 'weekdays'), '2026-06-15');
});

test('weekdays from Sunday goes to Monday', () => {
  // 2026-06-14 is a Sunday -> Monday 2026-06-15.
  assert.equal(getNextDueDate('2026-06-14', 'weekdays'), '2026-06-15');
});

test('missing due date advances from today', () => {
  assert.equal(getNextDueDate(null, 'daily', '2026-06-10'), '2026-06-11');
});

test('unknown recurrence throws', () => {
  assert.throws(() => getNextDueDate('2026-06-10', 'monthly'));
});

test('buildNextRecurringTask returns null for non-recurring task', () => {
  assert.equal(buildNextRecurringTask({ title: 'x', recurrence: null }), null);
});

test('buildNextRecurringTask copies fields, advances date, clears completion', () => {
  const completed = {
    id: 'abc',
    title: 'Morning run',
    stream: 'health',
    context: 'errand',
    project_id: null,
    due_date: '2026-06-10',
    status: 'done',
    recurrence: 'daily',
    sort_order: 5,
    completed_at: '2026-06-10T07:00:00Z',
  };
  const next = buildNextRecurringTask(completed);
  assert.equal(next.title, 'Morning run');
  assert.equal(next.stream, 'health');
  assert.equal(next.context, 'errand');
  assert.equal(next.due_date, '2026-06-11');
  assert.equal(next.status, 'active');
  assert.equal(next.recurrence, 'daily');
  assert.equal(next.sort_order, 5);
  assert.equal(next.completed_at, null);
  // It must not carry over identity fields.
  assert.equal(next.id, undefined);
});

test('todayISO / formatISODate produce YYYY-MM-DD', () => {
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(formatISODate(new Date(Date.UTC(2026, 5, 10))), '2026-06-10');
});
