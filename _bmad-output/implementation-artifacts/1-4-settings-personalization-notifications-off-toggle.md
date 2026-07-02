---
baseline_commit: 162182f40ff6756f6a09200a2b241dd94f30558b
---

# Story 1.4: Settings personalization & notifications-off toggle

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a builder,
I want to change my name, scheme, and creature later and control notifications,
So that depth lives in Settings while onboarding stays minimal.

## Acceptance Criteria

1. **Personalization persists + re-skins live.** Given the Settings surface, when I change name, scheme, or creature, then the change persists via `usePrefs` and the scheme re-skins every surface live. *(FR3, NFR9)*

2. **Notifications default OFF, user-only.** Given the notifications toggle, when Settings first renders, then the toggle is OFF by default and is only ever enabled by me. *(NFR7, AD-12)*

3. **Onboarding stays minimal; depth lives in Settings.** Given onboarding versus Settings, when compared, then onboarding exposes only the three first-run choices while Settings holds the fuller personalization depth. *(NFR9)*

## Tasks / Subtasks

- [x] **Task 1 — Extract the shared scheme + creature pickers (AC: 1, 3)**
  - [x] Created `src/components/settings/SchemePicker.jsx` — 7-scheme grid with the live per-scheme `data-scheme` swatch, active ring, `Check` marker. Props `value`/`onSelect`; reads `SCHEMES`.
  - [x] Created `src/components/settings/CreaturePicker.jsx` — creature grid from `CREATURES`. Props `value`/`onSelect`.
  - [x] Refactored `src/pages/Onboarding.jsx` to consume both (removed the inline picker markup + now-unused `Check`/`SCHEMES`/`CREATURES` imports). Single source of truth — resolves the code-review's duplicated-swatch finding.
- [x] **Task 2 — Add the Personalization section to Settings (AC: 1)**
  - [x] Added a **Personalization** `.surface-raised` card under Profile: name field (shadcn `Input` + `.input-glow`, local `nameInput` seeded from `usePrefs().name`, committed on blur via `setName` — store trims), `SchemePicker` (`onSelect={setScheme}`), `CreaturePicker` (`onSelect={setCreature}`).
  - [x] Scheme selection calls `setScheme` → `PrefsProvider` re-skins every surface live via `data-scheme` on `<html>`. (Static-verified; runtime tint deferred to /verify.)
  - [x] Shipped primitives only; no hardcoded hex.
- [x] **Task 3 — Notifications toggle, OFF by construction (AC: 2)**
  - [x] Added `notifications: false` to `DEFAULT_PREFS`, `Boolean(...)` coercion in `normalizePrefs`, and `setNotifications` in `usePrefs`. New Vitest cases (default false; boolean coercion; round-trip) — 25 prefs tests pass.
  - [x] Added a **Notifications** section with an accessible toggle: the whole row is a `button role="switch" aria-checked` (native keyboard Space/Enter, full-row ≥44 tap target), token-driven track (`bg-primary` on / `bg-muted` off) + `bg-primary-foreground` knob. Starts OFF; only the user flips it.
  - [x] Honest microcopy ("Off — Akha never notifies you by default"). **No** `Notification.requestPermission()` / push registration — persisted opt-in only (AD-12).
- [x] **Task 4 — Preserve the shipped Settings + verify (AC: 1–3)**
  - [x] Profile / `CalendarSync` / Archive link / Sign out / Delete-Account drawer untouched; no second overlay added. New sections placed after Profile (Personalization, then Notifications), before CalendarSync.
  - [x] Onboarding⇄Settings relationship holds: onboarding still exposes only name/scheme/creature; Settings holds those **plus** notifications. No new onboarding steps.
  - [x] `npm run lint` 0, `npm run build` exit 0, `npx vitest run` 72 pass (incl. new `notifications` tests). Clean dev-server boot (no render errors from the refactor/new sections; only env-gated Base44 404s).

## Dev Notes

### What this story is (and is NOT)
This is the **Settings depth** slice of Epic 1 (FR3, NFR7, NFR9). It surfaces the change-it-later controls for the three onboarding choices and adds the always-off notifications toggle. It **consumes** Story 1.1 (`usePrefs` + tokens) and **reuses** Story 1.3's picker patterns (extracting them so both surfaces share one implementation).

**NOT in this story:**
- **The PWA service worker / no-push construction** — Story 1.5 (AD-12). This story only adds the *toggle* (persisted, off); it must not register push or request permission.
- **New personalization axes** beyond name/scheme/creature/notifications (v1 scope is deliberate; no feature pile — restraint contract).
- **Per-scheme creature recolor** (Story 3.7) — the creature picker shows the shipped Deep-Sea-baked art, same as onboarding.

### Hard dependency on Stories 1.1 + 1.3
Reads `name`/`scheme`/`creature` and their setters from `usePrefs` (Story 1.1), and reuses the scheme/creature picker UI authored in `Onboarding.jsx` (Story 1.3). Both are implemented (working tree). [[1-1-the-7-scheme-token-system-local-prefs-store]] · [[1-3-first-run-onboarding-name-scheme-creature-welcome-beat]]

### Current Settings surface (what you're changing — precise)
[Source: current `src/pages/Settings.jsx`]
- Structure today: a centered `max-w-lg` column with — **Profile card** (`user.full_name`/`email` from `useAuth`), **`CalendarSync`** (integration), a **nav card** (Archive `Link to="/archive"` + Sign out), a **Danger Zone** (Delete-Account button → `vaul` `Drawer` with a typed-DELETE confirm), and a version line. No personalization exists yet.
- It imports `Drawer*` from `@/components/ui/drawer`, `useAuth`, `base44` (logout/deleteAccount). Preserve all of this. Add the Personalization + Notifications sections into the same `space-y-6` column.
- The Delete-Account drawer is the one overlay here — keep it single-level; the `destructive` token (`#e85d6e`) is the sanctioned fixed exception and only appears on this label (never the task loop).

### Reuse, don't reinvent — the pickers
[Source: `src/pages/Onboarding.jsx` (Story 1.3)]
- `Onboarding.jsx` already contains the exact scheme grid (live `data-scheme` swatches) and creature grid you need. **Extract both into `src/components/settings/SchemePicker.jsx` / `CreaturePicker.jsx` and have Onboarding import them** — do not hand-write a second copy in Settings. The scheme swatch technique (nested `data-scheme={key}` scoping tokens to the preview) is the intended pattern; keep it.
- The pickers are presentational: take `value` + `onSelect`, render from the `SCHEMES` / `CREATURES` catalogs in `@/lib/prefs`. Settings passes `setScheme`/`setCreature`; Onboarding passes the same. This makes the "single source of truth" concern the code-review raised go away.
- Reduced-motion: keep the `motion-reduce:transition-none` on animated bits (carried over from Onboarding).

### The notifications toggle — off by construction
[Source: ARCHITECTURE-SPINE.md#AD-12; SPEC.md#Constraints "Notifications off by construction"; NFR7]
- AD-12 / NFR7: **no push in v1**; if a toggle is offered it is opt-in and **always starts off**, and is only ever enabled by the user. The service worker (Story 1.5) never registers push regardless of this toggle.
- Implementation: a `notifications` pref (localStorage via `usePrefs`, default `false`). The toggle reflects/sets it. **Never** auto-enable it, and **never** call `Notification.requestPermission()` / `registration.pushManager.subscribe()` in this story. The toggle is persisted intent only in v1.
- No shadcn `Switch` component ships in `src/components/ui/**` (only drawer/input/label/button/toast/input-otp). Build a small accessible toggle yourself (`button role="switch" aria-checked`, keyboard `Space/Enter`, ≥44/48 hit area, accent fill when on, all token-driven). Do not add a dependency (NFR1).

### Extending the prefs store (mirror the shipped pattern)
[Source: `src/lib/prefs.js`, `src/hooks/usePrefs.js` (Stories 1.1/1.3)]
- Add `notifications: false` to `DEFAULT_PREFS`; in `normalizePrefs`, `notifications: Boolean(src.notifications)`. Add `setNotifications: (v) => updatePrefs({ notifications: v })` to the `usePrefs` value. Add tests to `src/lib/prefs.test.js` (default false; `normalizePrefs({notifications:'yes'}).notifications === true`; round-trip). `src/lib` is Vitest-only — tests are the safety net (NFR12).
- The prefs domain stays the single funnel (AD-1/AD-6); Settings never touches `localStorage` directly.

### Previous-story intelligence (Stories 1.1–1.3 code review, 2026-07-01)
- The token system is live: `text-highlight`, `bg-primary/10`, `bg-surface`, etc. all re-skin per scheme. Use those classes; **no hardcoded hex**.
- Scheme changes re-skin via `PrefsProvider`'s `useLayoutEffect` — nothing else needed to make Settings re-tint live.
- The code review flagged the onboarding **swatch as a duplicated source of truth** — extracting the shared picker (Task 1) is the fix, so do it rather than copy-pasting.
- `usePrefs` throws if used outside `PrefsProvider` — Settings renders inside `AppLayout` inside the provider tree, so it's fine.

### Project Structure Notes
- New: `src/components/settings/SchemePicker.jsx`, `src/components/settings/CreaturePicker.jsx`. Updated: `src/pages/Settings.jsx`, `src/pages/Onboarding.jsx` (consume the shared pickers), `src/lib/prefs.js` (+`notifications`), `src/lib/prefs.test.js`, `src/hooks/usePrefs.js` (+`setNotifications`).
- `src/components/settings/` already exists (`CalendarSync.jsx`) — the pickers belong there. Naming/`@/`-alias/JS-JSX per `project-context.md`. `src/components/ui/**` is shadcn vendor — don't edit. No new runtime dependency.

### References
- [Source: epics.md#Story 1.4] — the three ACs (personalization persists + live re-skin; notifications off by default, user-only; onboarding-minimal vs Settings-depth).
- [Source: ARCHITECTURE-SPINE.md#AD-6] — prefs local via `usePrefs`; #AD-12 — notifications off by construction, SW never registers push, opt-in toggle starts off.
- [Source: ARCHITECTURE-SPINE.md#AD-1/AD-2] — prefs domain is the single funnel; no direct localStorage in components.
- [Source: SPEC.md#CAP-9] — name/scheme/creature + notifications toggle editable after onboarding; push toggle always starts off; changing scheme re-skins every surface live.
- [Source: PRD NFR7] — no push by default; opt-in toggle only user-enabled. NFR9 — extensively customizable from Settings; onboarding minimal, depth in Settings.
- [Source: DESIGN.md#Components] — reuse `.surface-raised`, `.input-glow`; single-accent; no hardcoded hex.
- Current code: `src/pages/Settings.jsx` (Profile/CalendarSync/nav/Danger-Zone), `src/pages/Onboarding.jsx` (scheme + creature pickers to extract), `src/lib/prefs.js` / `src/hooks/usePrefs.js` (prefs store to extend), `src/components/settings/CalendarSync.jsx` (sibling location + existing `localStorage` pattern to NOT copy — go through `usePrefs`).
- [Source: implementation-readiness-report-2026-07-01.md] — Epic 1 front-loaded foundation; FR3 → Story 1.4.

## Review Findings (code review 2026-07-01)

- [x] [Review][Patch] Settings name edits can be lost on navigation before blur; local `nameInput` never re-syncs to the store [src/pages/Settings.jsx] — **FIXED**: added Enter-to-commit, a `useEffect` reconciling `nameInput`→`name` (also snaps to the trimmed stored value), and a commit-on-unmount via a ref so a pending edit is never dropped on navigation.
- [x] [Review][Patch] Single-select pickers use `aria-pressed` instead of radiogroup [SchemePicker.jsx, CreaturePicker.jsx] — **FIXED**: containers are now `role="radiogroup"` with an `aria-label`, options are `role="radio"` + `aria-checked`, and `onSelect?.(key)` guards a missing handler. Improves both Settings and Onboarding.
- [x] [Review][Defer] No `maxLength` on the name field — long names flow into the companion greeting; single-user, low risk.
- [x] [Review][Defer] Notifications knob contrast in the off state on light schemes (`bg-primary-foreground` knob on `bg-muted` track) — eyeball at /verify.
- [x] [Review][Defer] Scheme↔CSS coupling — the swatch relies on `SCHEMES` keys matching `[data-scheme]` blocks in `index.css`; no test asserts parity (carried from the 1.1 review).
- [x] [Review][Defer] Runtime unverified (Base44 auth-gate) — confirm live re-skin, reload persistence, and toggle-triggers-no-permission at /verify.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.8) — bmad-dev-story workflow

### Debug Log References

- `npx vitest run` → **72 pass** (2 new `notifications` cases in `prefs.test.js`; 0 regressions).
- `npm run lint` → **0**; `npm run build` → **exit 0**.
- Dev-server boot: only env-gated Base44 404s — no render/import errors from the picker extraction, the Onboarding refactor, or the new Settings sections.

### Completion Notes List

**Shared pickers (Task 1):** extracted `SchemePicker` / `CreaturePicker` into `src/components/settings/` and refactored `Onboarding.jsx` to import them (dropping its inline markup + unused `Check`/`SCHEMES`/`CREATURES` imports). Both surfaces now share one implementation of the live `data-scheme` swatch — this directly resolves the code-review's "swatch duplicated source of truth" finding. Net −duplication.

**Settings personalization (Task 2):** a Personalization card under Profile with a name field (local `nameInput`, committed on blur → `setName`), the scheme picker, and the creature picker. Scheme changes re-skin every surface live through 1.1's `PrefsProvider` effect — no reload, no extra wiring.

**Notifications, off by construction (Task 3):** added a `notifications` boolean to the prefs store (default `false`, `Boolean` coercion, `setNotifications`) with tests. The Settings toggle is a full-row `button role="switch"` (accessible, keyboard-operable, large tap target) with a token-driven track/knob. It starts OFF and only the user turns it on; **nothing registers push or requests Notification permission** (AD-12 / NFR7) — it's persisted opt-in intent only, honestly labelled.

**Preserved:** Profile, CalendarSync, Archive/Sign-out nav, and the Delete-Account drawer are untouched; no second overlay layer. The onboarding⇄Settings split holds (onboarding = 3 choices; Settings = those + notifications).

**⚠️ Verification scope / handoff to /verify + /code-review:** static gates pass and boot is clean, but — as with 1.1–1.3 — the **Settings UI was not exercised interactively** (Base44 auth-gate, no local creds; preview screenshotting unreliable this session). **Recommended at /verify (real browser + creds):** change name/scheme/creature in Settings and confirm live re-skin + persistence across reload; confirm the notifications toggle starts OFF, flips only on user action, survives reload, and triggers no permission prompt; confirm the extracted pickers still render/behave identically in onboarding.

### Change Log

- 2026-07-01 — Implemented Story 1.4: Settings personalization (name/scheme/creature via shared `SchemePicker`/`CreaturePicker`, extracted from Onboarding) + an off-by-construction notifications toggle (new `notifications` pref, no push). Refactored `Onboarding.jsx` onto the shared pickers. 72 tests pass, lint/build clean. Status → review.

### File List

**New:**
- `src/components/settings/SchemePicker.jsx` — shared 7-scheme picker (live per-scheme swatches)
- `src/components/settings/CreaturePicker.jsx` — shared creature picker

**Modified:**
- `src/pages/Settings.jsx` — Personalization card + Notifications toggle
- `src/pages/Onboarding.jsx` — consume the shared pickers (removed inline markup)
- `src/lib/prefs.js` — `notifications` default + normalization
- `src/lib/prefs.test.js` — 2 new `notifications` tests
- `src/hooks/usePrefs.js` — `setNotifications` (+ JSDoc)
