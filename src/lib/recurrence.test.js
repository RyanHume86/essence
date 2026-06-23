// src/lib/recurrence.test.js
// Run: npx vitest run src/lib/recurrence.test.js
// Assertions are on "YYYY-MM-DD" strings, matching the Base44 due_date format.

import { describe, it, expect } from 'vitest';
import {
  computeNextDueDate,
  applyEnd,
  completeRecurringTask,
  createRecurrenceRule,
  firstOccurrenceOnOrAfter,
  previewOccurrences,
  bucketFor,
  ageInDays,
} from './recurrence';

const ruleOf = (p) => ({ anchor: 'fixed', unit: 'day', interval: 1, end: { type: 'never' }, ...p });

// --- edge-case table ---

describe('computeNextDueDate: edge-case table', () => {
  it('daily fixed, completed same day -> tomorrow', () => {
    expect(computeNextDueDate(ruleOf({ unit: 'day' }), '2026-06-18', '2026-06-18', '2026-06-18')).toBe('2026-06-19');
  });

  it('yearly Dec 10 fixed, 3 months late -> Dec 10 SAME year', () => {
    expect(computeNextDueDate(ruleOf({ unit: 'year' }), '2025-12-10', '2026-03-10', '2026-03-10')).toBe('2026-12-10');
  });

  it('monthly on the 31st fixed -> clamps to Feb 28', () => {
    const r = createRecurrenceRule('2026-01-31', { anchor: 'fixed', unit: 'month' });
    expect(computeNextDueDate(r, '2026-01-31', '2026-01-31', '2026-01-31')).toBe('2026-02-28');
  });

  it('monthly on the 31st fixed -> RETURNS to 31 the next long month', () => {
    const r = createRecurrenceRule('2026-01-31', { anchor: 'fixed', unit: 'month' });
    expect(computeNextDueDate(r, '2026-02-28', '2026-02-28', '2026-02-28')).toBe('2026-03-31');
  });

  it('every 4 weeks completion-anchored, done late -> completion + 4 weeks', () => {
    const r = ruleOf({ anchor: 'completion', unit: 'week', interval: 4 });
    expect(computeNextDueDate(r, '2026-05-01', '2026-06-20', '2026-06-20')).toBe('2026-07-18');
  });

  it('every 3 days completion-anchored -> completion + 3 days', () => {
    const r = ruleOf({ anchor: 'completion', unit: 'day', interval: 3 });
    expect(computeNextDueDate(r, '2026-06-18', '2026-06-18', '2026-06-18')).toBe('2026-06-21');
  });

  it('weekly Mon/Wed/Fri fixed, completed Tue -> next Wed', () => {
    const r = ruleOf({ unit: 'week', weekdays: [1, 3, 5] });
    expect(computeNextDueDate(r, '2026-06-15', '2026-06-16', '2026-06-16')).toBe('2026-06-17');
  });

  it('weekly Mon/Wed/Fri fixed, completed Fri -> next Mon', () => {
    const r = ruleOf({ unit: 'week', weekdays: [1, 3, 5] });
    expect(computeNextDueDate(r, '2026-06-19', '2026-06-19', '2026-06-19')).toBe('2026-06-22');
  });

  it('weekly fixed missed for weeks -> next future Monday, never a past date', () => {
    const r = ruleOf({ unit: 'week' });
    expect(computeNextDueDate(r, '2026-06-01', '2026-06-18', '2026-06-18')).toBe('2026-06-22');
  });
});

// --- end conditions ---

describe('applyEnd', () => {
  it('afterCount: ends at exactly count occurrences', () => {
    const r = ruleOf({ end: { type: 'afterCount', count: 2 } });
    expect(applyEnd('2026-07-01', r, 1)).not.toBeNull();
    expect(applyEnd('2026-07-01', r, 2)).toBeNull();
  });
  it('onDate: blocks occurrences after the end date', () => {
    const r = ruleOf({ end: { type: 'onDate', date: '2026-06-30' } });
    expect(applyEnd('2026-06-29', r, 5)).not.toBeNull();
    expect(applyEnd('2026-07-01', r, 5)).toBeNull();
  });
  it('onDate: an occurrence exactly on the end date is allowed', () => {
    const r = ruleOf({ end: { type: 'onDate', date: '2026-06-30' } });
    expect(applyEnd('2026-06-30', r, 5)).toBe('2026-06-30');
  });
  it('never: always passes', () => {
    expect(applyEnd('2026-12-31', ruleOf({}), 999)).not.toBeNull();
  });
});

// --- completion handler against the real Task shape ---

describe('completeRecurringTask', () => {
  it('non-recurring task -> { completed: true }', () => {
    const t = { title: 'x', completed: false, due_date: '2026-06-18' };
    expect(completeRecurringTask(t, '2026-06-18')).toEqual({ completed: true });
  });

  it('recurring task with no due_date -> treated as non-recurring', () => {
    const t = { title: 'x', completed: false, recurrence: ruleOf({ unit: 'day' }) };
    expect(completeRecurringTask(t, '2026-06-18')).toEqual({ completed: true });
  });

  it('recurring fixed daily -> rolls due_date, stays incomplete, bumps count', () => {
    const t = { title: 'x', completed: false, due_date: '2026-06-18', recurrence: ruleOf({ unit: 'day' }), occurrence_count: 0 };
    expect(completeRecurringTask(t, '2026-06-18')).toEqual({ completed: false, due_date: '2026-06-19', occurrence_count: 1 });
  });

  it('recurring series final occurrence -> completed, recurrence cleared', () => {
    const t = {
      title: 'x', completed: false, due_date: '2026-06-18',
      recurrence: ruleOf({ unit: 'day', end: { type: 'afterCount', count: 2 } }),
      occurrence_count: 1,
    };
    expect(completeRecurringTask(t, '2026-06-18')).toEqual({ completed: true, recurrence: null, occurrence_count: 2 });
  });
});

// --- construction and preview ---

describe('createRecurrenceRule', () => {
  it('sets monthAnchorDay from the seed for fixed monthly', () => {
    expect(createRecurrenceRule('2026-01-31', { anchor: 'fixed', unit: 'month' }).monthAnchorDay).toBe(31);
  });
  it('does NOT set monthAnchorDay for completion-anchored monthly', () => {
    expect(createRecurrenceRule('2026-01-31', { anchor: 'completion', unit: 'month' }).monthAnchorDay).toBeUndefined();
  });
  it('sorts weekdays', () => {
    expect(createRecurrenceRule('2026-06-15', { anchor: 'fixed', unit: 'week', weekdays: [5, 1, 3] }).weekdays).toEqual([1, 3, 5]);
  });
  it('throws on multi-weekday with interval > 1', () => {
    expect(() => createRecurrenceRule('2026-06-15', { anchor: 'fixed', unit: 'week', interval: 2, weekdays: [1, 3] })).toThrow();
  });
  it('defaults interval to 1 and end to never', () => {
    const r = createRecurrenceRule('2026-06-18', { anchor: 'fixed', unit: 'day' });
    expect(r.interval).toBe(1);
    expect(r.end).toEqual({ type: 'never' });
  });
});

describe('firstOccurrenceOnOrAfter', () => {
  it('advances a Tuesday seed to the next selected weekday (Wed)', () => {
    const r = createRecurrenceRule('2026-06-16', { anchor: 'fixed', unit: 'week', weekdays: [1, 3, 5] });
    expect(firstOccurrenceOnOrAfter(r, '2026-06-16')).toBe('2026-06-17');
  });
  it('keeps a seed already on a selected weekday', () => {
    const r = createRecurrenceRule('2026-06-15', { anchor: 'fixed', unit: 'week', weekdays: [1, 3, 5] });
    expect(firstOccurrenceOnOrAfter(r, '2026-06-15')).toBe('2026-06-15');
  });
  it('returns the seed unchanged for non-weekly rules', () => {
    const r = createRecurrenceRule('2026-06-18', { anchor: 'fixed', unit: 'day' });
    expect(firstOccurrenceOnOrAfter(r, '2026-06-18')).toBe('2026-06-18');
  });
});

describe('previewOccurrences', () => {
  it('daily fixed: next 3 consecutive days', () => {
    const r = createRecurrenceRule('2026-06-18', { anchor: 'fixed', unit: 'day' });
    expect(previewOccurrences(r, '2026-06-18', 3)).toEqual(['2026-06-18', '2026-06-19', '2026-06-20']);
  });
  it('monthly on the 31st: clamps then returns to 31', () => {
    const r = createRecurrenceRule('2026-01-31', { anchor: 'fixed', unit: 'month' });
    expect(previewOccurrences(r, '2026-01-31', 4)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30']);
  });
  it('weekly Mon/Wed/Fri from Monday: Mon, Wed, Fri, Mon', () => {
    const r = createRecurrenceRule('2026-06-15', { anchor: 'fixed', unit: 'week', weekdays: [1, 3, 5] });
    expect(previewOccurrences(r, '2026-06-15', 4)).toEqual(['2026-06-15', '2026-06-17', '2026-06-19', '2026-06-22']);
  });
  it('completion-anchored every 3 days: each step is +3 days', () => {
    const r = createRecurrenceRule('2026-06-18', { anchor: 'completion', unit: 'day', interval: 3 });
    expect(previewOccurrences(r, '2026-06-18', 3)).toEqual(['2026-06-18', '2026-06-21', '2026-06-24']);
  });
  it('afterCount truncates the preview to the series length', () => {
    const r = createRecurrenceRule('2026-06-18', { anchor: 'fixed', unit: 'day', end: { type: 'afterCount', count: 2 } });
    expect(previewOccurrences(r, '2026-06-18', 5)).toHaveLength(2);
  });
  it('returns empty for n <= 0', () => {
    const r = createRecurrenceRule('2026-06-18', { anchor: 'fixed', unit: 'day' });
    expect(previewOccurrences(r, '2026-06-18', 0)).toEqual([]);
  });
});

// --- display helpers on the real Task shape ---

describe('bucketFor', () => {
  const today = '2026-06-18';
  it('past -> earlier', () => expect(bucketFor({ due_date: '2026-06-16' }, today)).toBe('earlier'));
  it('today -> today', () => expect(bucketFor({ due_date: '2026-06-18' }, today)).toBe('today'));
  it('future -> upcoming', () => expect(bucketFor({ due_date: '2026-06-20' }, today)).toBe('upcoming'));
  it('no date -> someday', () => expect(bucketFor({}, today)).toBe('someday'));
});

describe('ageInDays', () => {
  it('counts whole days since the due date', () => {
    expect(ageInDays({ due_date: '2026-06-16' }, '2026-06-18')).toBe(2);
  });
  it('is zero for an undated task', () => {
    expect(ageInDays({}, '2026-06-18')).toBe(0);
  });
});
