# Deferred work

Surfaced during review but intentionally out of scope for the current change. Not bugs that block the win-moment prototype.

## From win-moment-loop review (2026-06-24)

- **Midnight rollover display** — if the app stays open across midnight, the companion's displayed count keeps yesterday's value until the next completion (which then snaps to 1). Fix later: re-read `getTodayCount()` on window focus / a day-change check. Severity: low (display only).
- **Rapid double-tap double-count** — a fast double-tap or swipe+tap can fire `toggleM` twice with the same stale `task.completed === false`, recording two completions for one action. Fix later: read the task's current cached `completed` inside `onMutate`, or disable/debounce the control while pending. Severity: low.
- **Count semantics: events vs. distinct tasks** — the counter measures completion *events*, so toggling a task off then on again increments it. This is the spec'd/approved behavior for the prototype; revisit if the count should represent distinct tasks completed today (e.g. track a per-day Set of task IDs). Severity: design choice, not a bug.

## Deferred from: code review of Epic 1 stories 1.1–1.3 (2026-07-01)

- **[1.2] AC-4 focus-return Escape-only** (not blur-with-no-pending-input) — Epic 2 (Story 2.1) rebuilds the capture input and owns the robust version.
- **[1.2] AC-5 Android/browser-back overlay dismissal** — deferred to the Epic-2 capture rebuild; modal-depth ≤1 already holds.
- **[1.3] Onboarding gate outside <Routes>** — authed-not-onboarded can't reach public auth routes; deep-link destination lost (always lands `/`). Niche for single-user; revisit if it bites.
- **[1.3] AC-4 "plays once" not explicitly enforced** — Companion greets on every Focus mount (FR18 by-design); welcome step adds a 2nd instance. Owner sign-off recommended.
- **[1.3] Onboarding step-focus lands on first choice button** (scheme/creature) — minor a11y; revisit with Settings pass (1.4).
- **[1.1] Light-scheme structural-border contrast unmeasured** — carry to /verify.
- **[1.1] Cosmetic per-scheme token nits** — light-scheme skeleton shimmer inversion; secondary==accent; subtask-card==surface-top; swatch depends on SCHEMES↔CSS sync. Verify visually.
- **[1.1] AC-2 Companion/progress-wheel hardcoded hex** — consciously deferred to Epic 3 (3.4/3.7).

## Deferred from: code review of story 1.4 (2026-07-01)

- **[1.4] No maxLength on the name field** — long names flow into the greeting; single-user, low risk.
- **[1.4] Notifications knob contrast (off state, light schemes)** — bg-primary-foreground on bg-muted; eyeball at /verify.
- **[1.4] Scheme↔CSS coupling** — swatch relies on SCHEMES keys matching [data-scheme] blocks; no parity test.
- **[1.4] Runtime unverified** — live re-skin, reload persistence, toggle-no-permission — confirm at /verify.

## Deferred from: code review of story 1.5 (2026-07-01)

- **[1.5] autoUpdate mid-session shell swap → chunk-load error** — only if React.lazy/dynamic imports are added (routes static today). Future watch-item; consider a reload-on-chunk-error boundary then.
- **[1.5] Offline: authError 'unknown' has no branch in App.jsx** (pre-existing) → installed shell loads offline but data calls fail. Offline out of v1 scope (NFR11); add a calm offline message later.
- **[1.5] OAuth callback served precached shell** — benign (token read from query at runtime); confirm login works with SW active at /verify.
- **[1.5] Maskable icon = standard 512 (no padded safe-zone art); apple-touch-icon may clip on iOS** — cosmetic; purpose-built maskable art later.
