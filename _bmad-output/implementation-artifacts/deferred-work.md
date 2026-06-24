# Deferred work

Surfaced during review but intentionally out of scope for the current change. Not bugs that block the win-moment prototype.

## From win-moment-loop review (2026-06-24)

- **Midnight rollover display** — if the app stays open across midnight, the companion's displayed count keeps yesterday's value until the next completion (which then snaps to 1). Fix later: re-read `getTodayCount()` on window focus / a day-change check. Severity: low (display only).
- **Rapid double-tap double-count** — a fast double-tap or swipe+tap can fire `toggleM` twice with the same stale `task.completed === false`, recording two completions for one action. Fix later: read the task's current cached `completed` inside `onMutate`, or disable/debounce the control while pending. Severity: low.
- **Count semantics: events vs. distinct tasks** — the counter measures completion *events*, so toggling a task off then on again increments it. This is the spec'd/approved behavior for the prototype; revisit if the count should represent distinct tasks completed today (e.g. track a per-day Set of task IDs). Severity: design choice, not a bug.
