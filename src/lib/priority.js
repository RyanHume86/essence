// Task priority is an integer 1–5 (5 = most important). It is set during
// planning, drives task order silently (FR12), and is hidden on Focus — a quiet
// planning aid, never an alarm.
//
// Legacy rows shipped before the Story 2.5 dataset migration may still hold the
// old string priority ("normal" / "high"). `normalizePriority` maps those so
// reads never crash on an un-migrated row; the persisted migration happens in 2.5.

export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 5;
export const PRIORITY_DEFAULT = 3; // mid — an un-prioritised task sits in the middle

// Shipped string priority → integer. "high" maps to 4 (elevated band); the
// definitive dataset mapping is owned by Story 2.5.
const LEGACY_STRING = { normal: 3, high: 4 };

// Coerce any stored or user-supplied priority to a valid 1–5 integer.
// null/undefined/garbage → PRIORITY_DEFAULT; out-of-range numbers are clamped.
export function normalizePriority(value) {
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    const mapped = LEGACY_STRING[s];
    if (mapped !== undefined) return mapped;
    // Empty/whitespace-only is "garbage", not 0 — fall through to the default.
    value = s === "" ? NaN : Number(s);
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return PRIORITY_DEFAULT;
  return Math.min(PRIORITY_MAX, Math.max(PRIORITY_MIN, Math.round(value)));
}

// Descending comparator (highest priority first) that tolerates legacy string
// rows. Minimal ordering for the Plan list now; the canonical total ordering
// (priority → due → added → manual) lands in Story 2.4.
export function byPriorityDesc(a, b) {
  return normalizePriority(b.priority) - normalizePriority(a.priority);
}

// A task counts as "elevated" (4–5) — the band that earns a quiet flag on Plan.
export function isElevatedPriority(value) {
  return normalizePriority(value) >= 4;
}
