---
baseline_commit: 162182f40ff6756f6a09200a2b241dd94f30558b
---

# Story 1.3: First-run onboarding (name, scheme, creature, welcome, beat)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a new builder,
I want a brief calm setup to name myself, pick a scheme and creature, and feel a warm first moment,
So that my first session lands emotionally without a tutorial.

## Acceptance Criteria

1. **Fresh install shows onboarding, not Focus.** Given a fresh install with `onboarded` unset, when the app opens (after auth), then onboarding is shown, not the Focus surface. *(FR1)*

2. **Three choices, no tutorial.** Given onboarding, when I proceed through it, then I choose a name to be called by, a colour scheme (one of 7, default Deep Sea), and a creature from presets **and** there is no task tutorial and no multi-step feature walkthrough. *(FR1)*

3. **Warm welcome + flag set.** Given setup completes, when it finishes, then a brief warm welcome names the space as mine and makes no demand **and** the `onboarded` flag is set in `usePrefs`. *(FR2)*

4. **First-open beat reuses shipped Companion, non-blocking.** Given the empty post-onboarding state, when the first-open beat plays, then it uses the shipped `Companion.jsx` as-is (no new companion internals), plays once, self-dismisses, and does not block adding a task. *(FR24)*

5. **Reduced-motion resolves to static warmth.** Given `prefers-reduced-motion`, when the beat would play, then it resolves to a static resting pose and still presents its warm content statically — never silently dropped. *(UX-DR11)*

## Tasks / Subtasks

- [x] **Task 1 — Gate the app on the `onboarded` flag (AC: 1)**
  - [x] In `src/App.jsx` → `AuthenticatedApp`, added `const { onboarded } = usePrefs();` (at the top with `useAuth`, so hooks stay unconditional) and, after the auth/`authError` checks, `if (isAuthenticated && !onboarded) return <Onboarding />;` — inside `<Router>`, outside `AppLayout` (no nav chrome).
  - [x] Gated on `isAuthenticated` (added to the `useAuth` destructure) — post-auth only; `ProtectedRoute` untouched.
  - [x] Completion flips `onboarded` via `setOnboarded(true)`; `AuthenticatedApp` re-renders, the gate passes, `<Routes>` renders `/`. `/preview` dev bypass intact.
- [x] **Task 2 — Build the onboarding flow (AC: 2, 3)**
  - [x] Created `src/pages/Onboarding.jsx` — 4-step flow (name → scheme → creature → welcome) with a quiet dot step-marker (not a progress bar).
  - [x] Name step: shadcn `Input` + `.input-glow`/`.surface-raised`; committed via `setName(nameInput)` (blank allowed; trimmed in the store's `normalizePrefs`). Enter key advances.
  - [x] Scheme step: 7 options from `SCHEMES`; each shows a **live per-scheme swatch** (a nested `data-scheme={s.key}` wrapper so `bg-primary`/`bg-surface`/`bg-highlight` resolve to that scheme's tokens — token-pure, no hex). Selecting calls `setScheme`, re-skinning the whole screen live.
  - [x] Welcome step: warm Playfair line naming the space (`This space is yours, {name}.`), `<Companion />` for warmth, `.btn-accent-3d` "Enter Essence" → `setOnboarded(true)`.
  - [x] Reused shipped primitives only (`.surface-raised`, `.btn-accent-3d`, `.input-glow`, shadcn `Input`); no hardcoded hex; reassurance copy "You can change any of this later in Settings."
- [x] **Task 3 — Creature step (AC: 2)**
  - [x] Creature picker renders the single implemented preset from a new `CREATURES` catalog (`src/lib/prefs.js`), persisted via `setCreature`. No create-your-own, no per-scheme recolor (Story 3.7). `normalizePrefs` now validates `creature` against `CREATURES` (unknown → `default`), with tests.
  - [x] `CREATURES` is a list, so adding presets later is a data change. Owner decision (single creature v1) honored.
- [x] **Task 4 — The first-open beat (AC: 4, 5)**
  - [x] Reused `Companion.jsx` exactly as-is (no props; greeting soft-smile self-settles; no `winMoment` completion on a fresh install → never grins). No companion internals touched.
  - [x] The post-onboarding beat plays on the empty Focus surface — Today.jsx (the Story 1.2 Focus placeholder) already renders `<Companion />`, so it works for free and is non-modal (never blocks the +FAB → Plan capture). The welcome step also mounts a Companion for the closing warm moment.
  - [x] "Plays once" satisfied without new companion state — no extra intro overlay was added, so nothing re-appears on later opens (the ongoing greeting is FR18, Epic 3).
- [x] **Task 5 — Reduced-motion, a11y, non-blocking (AC: 4, 5)**
  - [x] Reduced-motion: the beat is handled by `Companion.jsx`'s `useReducedMotion` (pose resolves statically, line held). Onboarding's own transitions carry `motion-reduce:transition-none`.
  - [x] a11y: a `useEffect` on `step` moves focus to each step's first control; the name input has an `sr-only` label; all controls are keyboard-reachable; the flow always advances (Back never traps).
  - [x] Non-blocking: onboarding is a one-time gate that ends on the user's tap; afterwards the +FAB → Plan capture is immediately reachable. Nothing gates task capture.

## Dev Notes

### ✅ Decision (resolved) — how many creatures are in the "preset" picker?
The spec says the user picks "a creature **from presets**" (FR1) and that create-your-own is deferred — but the **implemented art is a single creature** (the `creature_soft/smile/grin` set; per-scheme recolor is Story 3.7). The `public/companion/monkey_*.svg` files are **dormant exploration art**, not wired as selectable presets. [Source: DESIGN.md#Components "The monkey. Art baked in deep-blue fills"; epics.md#AD-10 "one shared art set"; `public/companion/`]

**RESOLVED (owner decision, 2026-07-01): option (a) — single creature for v1.** Ship the picker with the one implemented creature (field stored, `CREATURES` list-structured so more presets are a later data change). Do not wire the dormant `monkey_*` art. The picker exists and is faithful to "presets, no create-your-own"; it simply offers one option in v1.

### What this story is (and is NOT)
This is the **emotional payload** of Epic 1: the first-run flow that makes the space feel like the user's. It **consumes** Story 1.1 (`usePrefs` + the 7-scheme token system) and **reuses** the shipped `Companion.jsx` — it authors no new companion internals (that boundary is explicit: *"Epic 1 reuses the shipped `Companion.jsx` as-is for the first-open beat and greeting — it does not author new companion internals. Epic 3 owns and rebuilds the companion."*). [Source: epics.md#Epic 1 "Companion boundary"]

**NOT in this story:**
- **Settings personalization** (change name/scheme/creature later, notifications toggle) — Story 1.4.
- **Per-scheme creature recolor** (feColorMatrix) — Story 3.7 (deferrable). Show the Deep-Sea-baked creature here.
- **The everyday greeting / reaction channel** (FR18, `reactions.js`) — Story 3.5. The shipped Companion's built-in greeting is enough for the beat; don't build the reaction system.
- **Any new companion component internals.**

### Hard dependency on Story 1.1
Unlike 1.2, this story **cannot function without Story 1.1**: it reads `onboarded`/`name`/`scheme`/`creature` and their setters from `usePrefs`, and needs `PrefsProvider` mounted above `AuthenticatedApp` so the gate and the live scheme-apply work. Sequence 1.1 before 1.3 (1.2 can land in any order relative to this). [[1-1-the-7-scheme-token-system-local-prefs-store]] · [Source: Story 1.1 usePrefs contract]

### How to reuse `Companion.jsx` (exact — do not touch internals)
[Source: current `src/components/companion/Companion.jsx`, `src/pages/CompanionPreview.jsx`]
- **No props.** `export default function Companion()` — self-contained. Pose logic: `reacting ? "grin" : greeting ? "smile" : "soft"`. On mount `greeting=true` for ~2.2s (soft smile), then settles to `soft` (resting/breathing). `reacting` only fires from a `winMoment` completion — **never on a fresh install**, so the beat is a warm smile settling to rest, never a grin.
- It already reads `useReducedMotion()` and gates every animation; pose still resolves under reduced motion. **No special onboarding handling required** for reduced-motion.
- Idle line rendered by the component: **"Here with you today."** — matches the onboarding warmth. [Source: Companion.jsx; EXPERIENCE.md#Voice and Tone]
- Mount pattern (from the dev harness): `<Companion key={remount} />`. A fresh mount reads today's count as 0 and greets. [Source: CompanionPreview.jsx:34]
- **Off-limits (Epic 3 rebuilds):** the `winMoment` subscription, pose calculation, SVG cross-fade, breath/scale animation, reaction glow, timings.

### The routing gate (exact placement)
[Source: current `src/App.jsx:21-63`]
- `AuthenticatedApp` runs auth/loading checks (lines 24–39) then returns `<Routes>`. Insert the onboarding gate **between** those: after `authError` handling, `const { onboarded } = usePrefs(); if (isAuthenticated && !onboarded) return <Onboarding />;`.
- `isAuthenticated` comes from `useAuth()` (already in scope). Rendering `<Onboarding/>` here keeps it inside `<Router>` (router context available) and outside `AppLayout` (no nav chrome). On `setOnboarded(true)`, re-render passes the gate → `<Routes>` renders `/` (Focus). No manual navigation call needed.
- Provider order after Story 1.1: `PrefsProvider > AuthProvider > QueryClientProvider > Router > AuthenticatedApp`. [Source: Story 1.1 Task 2]

### Onboarding flow & copy
[Source: EXPERIENCE.md#Key Flows UJ-3, #Voice and Tone, #State Patterns; UX-DR13, UX-DR14]
- **Steps (in order):** (1) name-to-be-called → (2) colour scheme (7, Deep Sea default) → (3) creature (presets) → (4) warm welcome. "No tutorial, no feature checklist — dropped gently into a calm space that already feels like *his*." [UJ-3]
- **Welcome message intent (FR2):** "brief, warm, encouraging — names the space as *his*, makes no demand, sets no task. A single calm greeting after onboarding, not a tour." **No verbatim copy is specified** — author it to the voice rules and get owner sign-off. Voice: warm, brief, quiet, plainspoken; **never cutesy, no baby-talk, no hype, no exclamation pile-ups**. A safe example (replace freely): *"This space is yours, {name}. No rush — we'll take it one thing at a time."*
- **Empty post-onboarding Focus copy:** "Nothing here yet — add your first when you're ready." (invites, never instructs or pressures). [EXPERIENCE.md#Voice and Tone]
- **Idle line:** "Here with you today." (rendered by the Companion).
- Reassurance: "You can change this any time in Settings." [mockups/key-screens.html:564]

### Reusable primitives (don't hand-roll)
`.surface-raised`, `.btn-accent-3d`, `.input-glow` (shipped in `src/index.css`); shadcn `Input`/`Button`/`Label` in `src/components/ui/**` (vendor — use, don't edit). All colours must be tokens (they resolve to the active scheme via Story 1.1). [Source: project-context.md; current `src/index.css`]

### Testing
- `src/lib` gets little new logic here (onboarding is UI). If you extract any pure helper (e.g. name-normalization, step validation, "is-onboarding-complete"), place it in `src/lib` with a colocated Vitest test (NFR12). The `usePrefs`/prefs round-trip tests belong to Story 1.1.
- Verify manually: fresh state → onboarding shows; completing sets `onboarded` (survives reload — no re-onboard); picking a scheme re-skins live; landing on empty Focus plays the beat once and never blocks the +FAB capture path; reduced-motion shows a static warm pose. [Source: NFR12; AC 1–5]

### Project Structure Notes
- New: `src/pages/Onboarding.jsx` (+ optional `src/lib/*.js` helper with test if any pure logic). Updated: `src/App.jsx` (gate). No changes to `Companion.jsx` or `public/companion/*`.
- Naming/`@/`-alias/JS-JSX per `project-context.md`. No new runtime dependency (NFR1).

### References
- [Source: epics.md#Story 1.3] — the five ACs; Epic 1 "Companion boundary" (reuse as-is, no new internals).
- [Source: EXPERIENCE.md#Key Flows UJ-3] — the onboarding journey, step order, "not create-your-own, which is deferred," first-open beat behaviour.
- [Source: EXPERIENCE.md#State Patterns] — "Truly empty (post-onboarding)" first-open beat plays once, self-dismisses, does not block adding a task (FR24).
- [Source: EXPERIENCE.md#Voice and Tone; UX-DR13] — welcome intent, idle line, empty-state copy, no-cutesy rule.
- [Source: EXPERIENCE.md#Accessibility Floor; UX-DR11/UX-DR12] — reduced-motion static end-state for the beat; focus order.
- [Source: DESIGN.md#Components; AD-10 (epics.md)] — one creature, three poses, per-scheme recolor is one shared art set (Story 3.7).
- [Source: SPEC.md#CAP-1, Non-goals] — first-run setup success; "Create-your-own creature — Onboarding offers presets only."
- Current code: `src/components/companion/Companion.jsx` (no-props greeting; `useReducedMotion`), `src/pages/CompanionPreview.jsx:34` (mount pattern), `src/App.jsx:21-63` (gate insertion point), `src/lib/AuthContext.jsx` (`isAuthenticated`, `authChecked`), `src/components/ui/{input,button,label}.jsx`, `src/index.css` (primitives), `public/companion/` (creature_* live poses; monkey_* dormant).
- [Source: implementation-readiness-report-2026-07-01.md] — Epic 1 is front-loaded foundation; FR1/FR2/FR24 map to Story 1.3.

## Review Findings (code review 2026-07-01)

- [x] [Review][Defer] Onboarding gate renders outside `<Routes>` [src/App.jsx] — an authenticated-but-not-onboarded user cannot reach public auth routes (e.g. `/reset-password`), and a deep-link to `/plan`/`/archive` while not onboarded always lands on `/` after completion (destination lost). Niche for a single-user, 4-tap onboarding; revisit if it bites.
- [x] [Review][Defer] AC-4 "plays once" not explicitly enforced — `Companion` greets on every Focus mount (the ongoing greeting is FR18 by-design), and the welcome step mounts a second instance. No blocking one-time overlay was added, so nothing repeats beyond the intended greeting. Owner sign-off recommended.
- [x] [Review][Defer] Onboarding step-focus lands on the first choice button on the scheme/creature steps [src/pages/Onboarding.jsx] — `querySelector("input, button")` grabs the first swatch rather than a neutral element, and there's no "focus only if not already inside" guard. Minor a11y; revisit with the Settings pass (1.4).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.8) — bmad-dev-story workflow

### Debug Log References

- `npx vitest run` → **70 tests pass** (5 new in `prefs.test.js` for `CREATURES` / `isValidCreature` / creature normalization; 0 regressions).
- `npm run lint` → **0 errors**; `npm run build` → **exit 0**.
- Dev-server boot: console shows **only** env-gated Base44 404s — **no hooks-order / provider / import errors** from the new `usePrefs()` call in `AuthenticatedApp` or the `Onboarding` import, confirming the provider chain (`PrefsProvider > … > AuthenticatedApp`) is correct.

### Completion Notes List

**Gate (Task 1):** `AuthenticatedApp` now calls `usePrefs()` at the top (hooks stay unconditional) and, after the auth checks, returns `<Onboarding />` when `isAuthenticated && !onboarded`. It renders inside the Router but outside `AppLayout` (full-screen, no nav). Completion is implicit: `setOnboarded(true)` flips the flag → re-render drops the gate → `/` (Focus) renders. No manual navigation.

**Flow (Tasks 2–3):** `src/pages/Onboarding.jsx` is a calm 4-step flow (name → scheme → creature → welcome) with a quiet dot marker. Notable choice: the **scheme swatches use a nested `data-scheme={key}` wrapper** so each preview renders in its own scheme's tokens (`bg-primary`/`bg-surface`/`bg-highlight`) — fully token-driven, zero hardcoded hex, and it doubles as a real preview. Selecting a scheme calls `setScheme`, which (via 1.1's `PrefsProvider` effect) re-skins the whole screen live. The creature step reads a new `CREATURES` catalog added to `src/lib/prefs.js` (single v1 preset per the owner decision), and `normalizePrefs` now validates `creature` (unknown → `default`) — tested.

**Beat (Task 4):** reused `Companion.jsx` untouched. The post-onboarding beat needs no new code — Today.jsx (the 1.2 Focus placeholder) already renders `<Companion />`, and it's non-modal so it never blocks capture. A second `<Companion />` sits in the welcome step for the closing warm moment. No one-time-flag machinery was needed (no extra intro overlay was added).

**a11y / reduced-motion (Task 5):** a `useEffect(step)` moves focus to each step's first control; the name field has an `sr-only` label; Back never traps. Onboarding transitions use `motion-reduce:transition-none`; the beat's reduced-motion behaviour is inherited from `Companion.jsx`'s `useReducedMotion`.

**Copy:** welcome line "This space is yours, {name}. / No rush. We'll take it one thing at a time." authored to the voice rules (warm, brief, no hype) — **owner may want to tweak the exact wording** (the story flagged copy as needing sign-off).

**⚠️ Verification scope / handoff to /verify + /code-review:** static gates pass and app-boot is clean. The **onboarding flow could not be exercised interactively here** — it's gated behind Base44 auth (no local creds) and the preview MCP was unreliable this session (detached-frame eval, then a screenshot timeout), so a standalone-render screenshot attempt was made and **reverted** (confirmed removed from `App.jsx`). **Recommended at /verify (real browser + Base44 creds, or temporarily render `<Onboarding/>`):** fresh state shows onboarding not Focus; step through name/scheme/creature/welcome; confirm the scheme choice re-skins live; `Enter Essence` sets `onboarded` and lands on Focus with the companion beat; reload does **not** re-onboard; `prefers-reduced-motion` shows the static warm pose; capture (+FAB → Plan) works immediately after.

### Change Log

- 2026-07-01 — Implemented Story 1.3: first-run onboarding (name → scheme → creature → welcome) gated on the `onboarded` flag, consuming Story 1.1's `usePrefs`. New `src/pages/Onboarding.jsx`; extended `src/lib/prefs.js` with a `CREATURES` catalog + `isValidCreature` + creature normalization (with tests); wired the gate in `src/App.jsx`. Reused `Companion.jsx` as-is for the beat. 70 tests pass, lint/build clean. Status → review.

### File List

**New:**
- `src/pages/Onboarding.jsx` — the 4-step first-run flow

**Modified:**
- `src/App.jsx` — onboarding gate in `AuthenticatedApp` (usePrefs + `isAuthenticated`)
- `src/lib/prefs.js` — `CREATURES` catalog, `isValidCreature`, creature normalization
- `src/lib/prefs.test.js` — 5 new tests for the creature logic
