// Tests run in Vitest's default `node` environment (no jsdom in this repo), so
// we install a tiny in-memory `localStorage` shim — the same surface prefs.js
// guards on at runtime — and clear it between tests.
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import {
  SCHEMES,
  CREATURES,
  DEFAULT_PREFS,
  STORAGE_KEY,
  isValidScheme,
  isValidCreature,
  normalizePrefs,
  readPrefs,
  writePrefs,
} from './prefs';

beforeAll(() => {
  const store = new Map();
  /** @type {Pick<Storage, 'getItem'|'setItem'|'removeItem'|'clear'>} */
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
});

beforeEach(() => {
  localStorage.clear();
});

describe('SCHEMES catalog', () => {
  it('has exactly 7 schemes with 4 dark + 3 light', () => {
    expect(SCHEMES).toHaveLength(7);
    expect(SCHEMES.filter((s) => s.mode === 'dark')).toHaveLength(4);
    expect(SCHEMES.filter((s) => s.mode === 'light')).toHaveLength(3);
  });

  it('includes deep-sea as the default scheme key', () => {
    expect(SCHEMES.map((s) => s.key)).toContain('deep-sea');
    expect(DEFAULT_PREFS.scheme).toBe('deep-sea');
  });

  it('every scheme has a key, a label and a mode', () => {
    for (const s of SCHEMES) {
      expect(typeof s.key).toBe('string');
      expect(typeof s.label).toBe('string');
      expect(['dark', 'light']).toContain(s.mode);
    }
  });
});

describe('CREATURES catalog', () => {
  it('has at least one preset, all with key/label/art', () => {
    expect(CREATURES.length).toBeGreaterThanOrEqual(1);
    for (const c of CREATURES) {
      expect(typeof c.key).toBe('string');
      expect(typeof c.label).toBe('string');
      expect(typeof c.art).toBe('string');
    }
  });
  it('includes the default creature key', () => {
    expect(CREATURES.map((c) => c.key)).toContain('default');
    expect(DEFAULT_PREFS.creature).toBe('default');
  });
});

describe('isValidCreature', () => {
  it('accepts known creature keys and rejects the rest', () => {
    expect(isValidCreature('default')).toBe(true);
    expect(isValidCreature('dragon')).toBe(false);
    expect(isValidCreature(undefined)).toBe(false);
  });
});

describe('isValidScheme', () => {
  it('accepts known scheme keys', () => {
    expect(isValidScheme('deep-sea')).toBe(true);
    expect(isValidScheme('sky-blue')).toBe(true);
  });
  it('rejects unknown / malformed values', () => {
    expect(isValidScheme('not-a-scheme')).toBe(false);
    expect(isValidScheme(undefined)).toBe(false);
    expect(isValidScheme(42)).toBe(false);
  });
});

describe('normalizePrefs', () => {
  it('fills all defaults from an empty object', () => {
    expect(normalizePrefs({})).toEqual(DEFAULT_PREFS);
  });

  it('coerces an unknown scheme to deep-sea', () => {
    expect(normalizePrefs({ scheme: 'chartreuse' }).scheme).toBe('deep-sea');
  });

  it('keeps a valid scheme', () => {
    expect(normalizePrefs({ scheme: 'twilight' }).scheme).toBe('twilight');
  });

  it('defaults onboarded to false and coerces to boolean', () => {
    expect(normalizePrefs({}).onboarded).toBe(false);
    expect(normalizePrefs({ onboarded: 'yes' }).onboarded).toBe(true);
    expect(normalizePrefs({ onboarded: 0 }).onboarded).toBe(false);
  });

  it('trims name and defaults it to empty string', () => {
    expect(normalizePrefs({}).name).toBe('');
    expect(normalizePrefs({ name: '  Ryan  ' }).name).toBe('Ryan');
  });

  it('defaults notifications to false and coerces to boolean', () => {
    expect(normalizePrefs({}).notifications).toBe(false);
    expect(normalizePrefs({ notifications: 'yes' }).notifications).toBe(true);
    expect(normalizePrefs({ notifications: 0 }).notifications).toBe(false);
  });

  it('coerces an unknown creature to the default', () => {
    expect(normalizePrefs({ creature: 'dragon' }).creature).toBe('default');
    expect(normalizePrefs({ creature: '' }).creature).toBe('default');
  });

  it('keeps a valid creature', () => {
    expect(normalizePrefs({ creature: 'default' }).creature).toBe('default');
  });

  it('tolerates null / non-object input', () => {
    expect(normalizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(normalizePrefs('garbage')).toEqual(DEFAULT_PREFS);
  });
});

describe('readPrefs', () => {
  it('returns defaults when storage is empty', () => {
    expect(readPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('returns defaults (never throws) when storage holds malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(readPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('returns a fresh copy, not the shared DEFAULT_PREFS reference', () => {
    expect(readPrefs()).not.toBe(DEFAULT_PREFS);
  });
});

describe('writePrefs', () => {
  it('round-trips a scheme choice through localStorage', () => {
    writePrefs({ scheme: 'forest-sage' });
    expect(readPrefs().scheme).toBe('forest-sage');
  });

  it('merges patches without dropping earlier fields', () => {
    writePrefs({ name: 'Ryan' });
    writePrefs({ scheme: 'soft-pink' });
    const prefs = readPrefs();
    expect(prefs.name).toBe('Ryan');
    expect(prefs.scheme).toBe('soft-pink');
  });

  it('normalizes on write (unknown scheme stored as deep-sea)', () => {
    writePrefs({ scheme: 'bogus' });
    expect(readPrefs().scheme).toBe('deep-sea');
  });

  it('returns the merged, normalized prefs', () => {
    const result = writePrefs({ onboarded: true });
    expect(result.onboarded).toBe(true);
    expect(result.scheme).toBe('deep-sea');
  });

  it('round-trips the notifications flag', () => {
    expect(readPrefs().notifications).toBe(false);
    writePrefs({ notifications: true });
    expect(readPrefs().notifications).toBe(true);
  });
});
