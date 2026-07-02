// Local preferences store — the pure, tested core of `usePrefs`.
//
// Persists the user's onboarding/personalization choices on-device only
// (localStorage), never Base44 (AD-6). This module owns the storage shape and
// the normalization rules; `src/hooks/usePrefs.js` wraps it with React context
// and applies the active scheme to the document root. No React, no backend here.

/**
 * @typedef {Object} Scheme
 * @property {string} key   - stable id used in `data-scheme` and storage
 * @property {string} label - human-facing name
 * @property {'dark'|'light'} mode
 */

/** The 7 colour schemes — 4 dark, 3 light. Deep Sea is the default. */
export const SCHEMES = /** @type {Scheme[]} */ ([
  { key: 'deep-sea', label: 'Deep Sea', mode: 'dark' },
  { key: 'forest-sage', label: 'Forest / Sage', mode: 'dark' },
  { key: 'twilight', label: 'Twilight', mode: 'dark' },
  { key: 'accessible', label: 'Accessible', mode: 'dark' },
  { key: 'soft-paper', label: 'Soft Paper', mode: 'light' },
  { key: 'soft-pink', label: 'Soft Pink', mode: 'light' },
  { key: 'sky-blue', label: 'Sky Blue', mode: 'light' },
]);

/**
 * The creature presets offered at onboarding. v1 ships one (the shipped art
 * set); the list is structured so adding presets later is a data change, not a
 * rewrite. Create-your-own is an explicit non-goal. Per-scheme recolor is Story
 * 3.7 — the `art` here is the Deep-Sea-baked resting pose used for the picker.
 * @typedef {Object} Creature
 * @property {string} key
 * @property {string} label
 * @property {string} art  - public path to the preview pose
 */
export const CREATURES = /** @type {Creature[]} */ ([
  { key: 'default', label: 'Companion', art: '/companion/creature_soft.svg' },
]);

/** localStorage key. Follows the shipped `akha_*` convention. */
export const STORAGE_KEY = 'akha_prefs';

/** The default preferences for a fresh install. */
export const DEFAULT_PREFS = Object.freeze({
  name: '',
  scheme: 'deep-sea',
  creature: 'default',
  onboarded: false,
  // Notifications are off by construction (AD-12 / NFR7). v1 registers no push;
  // this is a persisted opt-in preference that only the user ever turns on.
  notifications: false,
});

/** @param {unknown} key */
export function isValidScheme(key) {
  return SCHEMES.some((s) => s.key === key);
}

/** @param {unknown} key */
export function isValidCreature(key) {
  return CREATURES.some((c) => c.key === key);
}

/** Look up a scheme's mode ('dark' by default for unknown keys). */
export function schemeMode(key) {
  return SCHEMES.find((s) => s.key === key)?.mode ?? 'dark';
}

/**
 * Coerce arbitrary stored/partial data into a complete, valid prefs object.
 * Unknown or missing scheme falls back to deep-sea; every field gets a default.
 * @param {unknown} raw
 */
export function normalizePrefs(raw) {
  const src = raw && typeof raw === 'object' ? /** @type {Record<string, unknown>} */ (raw) : {};
  return {
    name: typeof src.name === 'string' ? src.name.trim() : DEFAULT_PREFS.name,
    scheme: isValidScheme(src.scheme) ? /** @type {string} */ (src.scheme) : DEFAULT_PREFS.scheme,
    creature: isValidCreature(src.creature) ? /** @type {string} */ (src.creature) : DEFAULT_PREFS.creature,
    onboarded: Boolean(src.onboarded),
    notifications: Boolean(src.notifications),
  };
}

function hasStorage() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Read the current prefs from localStorage. Never throws and never hits the
 * network; returns a fresh defaults object if absent or malformed.
 */
export function readPrefs() {
  if (!hasStorage()) return { ...DEFAULT_PREFS };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PREFS };
    return normalizePrefs(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/**
 * Merge a partial patch into the stored prefs, normalize, persist, and return
 * the result. The single write path for the prefs domain.
 * @param {Partial<typeof DEFAULT_PREFS>} patch
 */
export function writePrefs(patch) {
  const next = normalizePrefs({ ...readPrefs(), ...patch });
  if (hasStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full / disabled — keep the in-memory value, never throw */
    }
  }
  return next;
}
