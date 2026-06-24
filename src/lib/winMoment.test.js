// src/lib/winMoment.test.js
// Run: npx vitest run src/lib/winMoment.test.js
// The day is injected as a "YYYY-MM-DD" string so day-boundary behaviour can be
// asserted without mocking the clock.
//
// Tests run in Vitest's default `node` environment (no jsdom dependency in this
// repo), so we install a tiny in-memory `window.localStorage` shim — the same
// surface winMoment.js guards on at runtime — and clear it between tests.

import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { recordCompletion, undoCompletion, getTodayCount, subscribe } from './winMoment';

const DAY = '2026-06-24';
const OTHER_DAY = '2026-06-25';

beforeAll(() => {
  const store = new Map();
  /** @type {Pick<Storage, 'getItem'|'setItem'|'removeItem'|'clear'>} */
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
  globalThis.window = globalThis.window ?? {};
  globalThis.window.localStorage = localStorage;
});

beforeEach(() => {
  globalThis.window.localStorage.clear();
});

describe('getTodayCount', () => {
  it('reads 0 when nothing is stored for the day', () => {
    expect(getTodayCount(DAY)).toBe(0);
  });
});

describe('recordCompletion', () => {
  it('increments and returns the new count', () => {
    expect(recordCompletion(DAY)).toBe(1);
    expect(recordCompletion(DAY)).toBe(2);
    expect(recordCompletion(DAY)).toBe(3);
  });

  it('raises the count that getTodayCount reads back', () => {
    recordCompletion(DAY);
    recordCompletion(DAY);
    expect(getTodayCount(DAY)).toBe(2);
  });
});

describe('new-day reset', () => {
  it('a different injected day reads 0 even after completions on another day', () => {
    recordCompletion(DAY);
    recordCompletion(DAY);
    expect(getTodayCount(DAY)).toBe(2);
    expect(getTodayCount(OTHER_DAY)).toBe(0);
  });
});

describe('undoCompletion', () => {
  it('reverses one completion (used on a rolled-back save)', () => {
    recordCompletion(DAY);
    recordCompletion(DAY);
    expect(undoCompletion(DAY)).toBe(1);
    expect(getTodayCount(DAY)).toBe(1);
  });

  it('floors at 0 and never goes negative', () => {
    expect(undoCompletion(DAY)).toBe(0);
    expect(getTodayCount(DAY)).toBe(0);
  });

  it('emits the decremented count to subscribers', () => {
    const received = [];
    const unsubscribe = subscribe((count) => received.push(count));
    recordCompletion(DAY);
    undoCompletion(DAY);
    unsubscribe();
    expect(received).toEqual([1, 0]);
  });
});

describe('subscribe', () => {
  it('receives the emitted count on each completion', () => {
    const received = [];
    const unsubscribe = subscribe((count) => received.push(count));
    recordCompletion(DAY);
    recordCompletion(DAY);
    unsubscribe();
    expect(received).toEqual([1, 2]);
  });

  it('stops receiving after unsubscribe', () => {
    const received = [];
    const unsubscribe = subscribe((count) => received.push(count));
    recordCompletion(DAY);
    unsubscribe();
    recordCompletion(DAY);
    expect(received).toEqual([1]);
  });

  it('supports multiple independent subscribers', () => {
    const a = [];
    const b = [];
    const unsubA = subscribe((count) => a.push(count));
    const unsubB = subscribe((count) => b.push(count));
    recordCompletion(DAY);
    unsubA();
    unsubB();
    expect(a).toEqual([1]);
    expect(b).toEqual([1]);
  });
});
