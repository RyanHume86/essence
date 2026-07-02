---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - prds/prd-essence-2026-06-29/prd.md
  - prds/prd-essence-2026-06-29/addendum.md
  - architecture/architecture-essence-2026-06-30/ARCHITECTURE-SPINE.md
  - ux-designs/ux-essence-2026-06-30/DESIGN.md
  - ux-designs/ux-essence-2026-06-30/EXPERIENCE.md
  - ../specs/spec-essence/SPEC.md
  - ../project-context.md
---

# essence - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for essence, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories. The SPEC kernel's nine capabilities (CAP-1…9) are the organizing spine for the epics; the architecture invariants (AD-1…12) govern *how* each story is built.

## Requirements Inventory

### Functional Requirements

FR1: First run collects three choices — name to be called by, colour scheme, creature (from presets) — as a brief calm setup; no task tutorial, no multi-step walkthrough.
FR2: After setup, the creature shows a brief, warm, encouraging welcome message.
FR3: Name, colour scheme, and creature can be changed later from a Settings surface.
FR4: The user can create tasks at any time — planned ahead or added on the fly.
FR5: Every task carries a priority of 1–5 (5 = most important).
FR6: A task can be broken into subtasks (one level deep); added at capture or later, editable anytime.
FR7: During capture, Essence gently nudges decomposition up front (encouraged, not required).
FR8: The capture/Plan surface is a neutral utility — the full list may be visible; the creature sits passively without reacting.
FR9: A task carries a due date (date-only, YYYY-MM-DD); time-of-day is out of scope.
FR10: Tasks and subtasks can be edited and deleted.
FR11: During execution, Essence shows one task at a time — the highest-ranked — with the backlog off-screen.
FR12: Task order = (1) priority 5→1, (2) due date sooner-first, (3) order added earliest-first, (4) manual rearrange override.
FR13: Within a task, subtasks are revealed two at a time, not all at once.
FR14: Completing a subtask removes it from view, the next flows up, the following incomplete becomes active; creature gives a gentle smile + brief line (exactly one active at a time).
FR15: When the last subtask completes, the parent auto-completes: dims but stays visible, wheel updates, creature does a little dance (low-amplitude, never confetti), task drops to bottom.
FR16: A progress wheel reflects the day's completions and grows as the user progresses.
FR17: A three-tier, proportional, always-quiet reaction ladder (subtask / task / "done for today"); reactions never intensify by priority, milestone, or volume — flat within each tier.
FR18: On opening the app, the creature greets with a soft smile and a brief encouraging welcome; never pounces.
FR19: The end-of-day moment is triggered by an explicit, optional "I'm done for today" gesture (never auto-gated on an empty list): dimmed completed tasks slowly clear into the archive; creature smiles then a deep, slow sigh.
FR20: All creature reactions respect reduced-motion (state change shown without animation).
FR21: Incomplete tasks carry to the next day, gently highlighted "still needs doing" — never overdue/red/badge/shame; fixed treatment that never intensifies, accumulates, counts up, or escalates with age or volume.
FR22: Completed tasks move to an archive when the user ends the day, viewable as a calm "what I've done" history.
FR23: The archive shows only completed work; no streaks, counts-as-pressure, or comparative stats.
FR24: On first open (post-onboarding, empty list), the creature performs a one-time warm intro beat; it plays once, self-dismisses, and does not block adding a task.
FR25: Progress-wheel guardrail — accumulation only; never a denominator, percentage, "remaining," shortfall, or cross-day comparison.
FR26: Archive structural guardrail — no totals, per-day tiles, calendar grids, or any aggregate that re-encodes streaks/cadence/shortfall.

### NonFunctional Requirements

NFR1: Web app on the existing stack (React 18 / Vite / Tailwind / shadcn); no new runtime dependencies without strong justification (the ~17-dep set is deliberate).
NFR2: v1 task data persists via the Base44 cloud backend (working, with cross-device sync).
NFR3: Every animation respects prefers-reduced-motion; the state change is always shown, motion is optional.
NFR4: Reactions are fast and self-dismissing (~1.5s), never blocking modals, never network-gated — wins fire optimistically before save completes.
NFR5: Calm visual language — no red/alarm colours (including carried-forward); design tokens only, no hardcoded hex.
NFR6: Optimistic feedback is honest — if a save fails, the optimistic win/count rolls back correctly.
NFR7: No push notifications by default; if offered, push is an opt-in Settings toggle that always starts off.
NFR8: Multiple colour palettes, each with a matching coloured creature — including a white option and colourblind-friendly palettes.
NFR9: Extensively customizable from a Settings surface; onboarding stays minimal, depth lives in Settings.
NFR10: Privacy is core — v1 stores data in Base44 as private, single-user data.
NFR11: Target architecture (future, not v1) — local-first on-device by default; cross-device sync only if the user explicitly chooses.
NFR12: New core logic lands in src/lib (ESLint/typecheck do not cover it — Vitest is the only net) and ships with unit tests; any Base44 schema change is round-trip-verified via a real read before wiring (the "Nidus" silent-sync failure).

### Additional Requirements

*From the Architecture spine (AD-1…12) and project-context. These govern HOW stories are built.*

- **No starter template — brownfield.** The architecture ratifies the shipped React 18.2 / Vite 6.1 / Tailwind 3.4 / shadcn (new-york) / TanStack Query 5 / framer-motion 11 / Base44 SDK stack (JS/JSX only, `@/` alias). Epic 1 is **not** a greenfield scaffold; it is schema + store groundwork on the existing app.
- **AD-1 Persistence port:** surfaces read/write user data only through per-domain store modules (`useTasks`, `usePrefs`); those stores are the only code that imports the backend client (`base44`). Backend is a swappable adapter.
- **AD-2 Single-funnel optimistic store:** one TanStack Query cache per domain; patch computed in both `onMutate` and `mutationFn`; rollback to `ctx.previous`; invalidate on settle; stable hook order. No component calls `base44.entities.*` directly.
- **AD-3 Derived read-state:** today-progress and carry-forward are derived from task state (via `completed_at`), never separately stored; **retire `winMoment.js`** localStorage counter.
- **AD-4 Pure logic in src/lib:** ordering, carry-forward, today-progress, day-end sweep eligibility, subtask-reveal selection live as pure, Vitest-tested functions (NFR12).
- **AD-5 Task schema:** add `priority` (int 1–5), `order` (manual-rearrange key), `completed_at` (timestamp), `archived_at` (nullable timestamp); `due_date` stays date-only; **drop the shipped drift** (`due_time`, `today`) and convert `priority:"normal"` → integer; round-trip-verify every schema change.
- **AD-6 Local prefs store:** `usePrefs` persists name / scheme / creature / `onboarded` flag in localStorage — never Base44.
- **AD-7 Archive lifecycle:** `archived_at` stamp encodes the lifecycle; "I'm done for today" is a store action that **bulk-stamps** completed tasks (never deletes) — replaces the delete-based `clearCompleted`; Archive sorts by `archived_at` desc; no auto-archive.
- **AD-8 Focus exposure boundary + effective order:** Focus renders exactly one task; full backlog only on Plan; effective order = persisted `order` (seeded from priority→due→added, total comparator with null `due_date` last), authoritative once manually rearranged (global override).
- **AD-9 Reaction channel:** a transient tier-tagged module emitter (`reactions.js`); `useTasks` emits `{tier: subtask|task|dayend}`, `Companion` subscribes; a no-subtask task fires the **task** tier; line random within tier; not revoked on rollback.
- **AD-10 Theming & recolor:** 7 schemes re-skin one primitive set via CSS custom properties (root data-attribute); creature recolors via an **inlined-SVG `feColorMatrix`** over one shared art set (not per-scheme baked art, not CSS hue-rotate).
- **AD-11 Reduced-motion & no-alarm:** every animation resolves to its end-state; completion needs white check + strike (never colour alone); wheel is `role="img"` (never `progressbar`); **delete `RING_TARGET=8`**.
- **AD-12 Notifications off by construction:** the PWA service worker never registers push; opt-in Settings toggle starts off.
- **Routing / 4 surfaces:** Focus (/) ← Today; Plan ← Upcoming + Browse merged; Archive ← Completed; Settings. Auth routes unchanged; onboarding gates on the local `onboarded` flag.
- **Delivery = installable PWA:** web manifest + service worker for install + auto-update (not caching the Base44 API). Local-first / IndexedDB is a deferred future adapter, not v1.
- **Kept dormant (no v1 UI):** recurrence engine (unwired), Google Calendar sync (gated off), `Task.category` field (no UI, pure-priority model).
- **Operational:** env `VITE_BASE44_APP_ID` / `VITE_BASE44_APP_BASE_URL`; build `vite build`; test `vitest`; a pre-merge lint+vitest+build CI gate is an open item.

### UX Design Requirements

*From DESIGN.md (visual identity) + EXPERIENCE.md (behavior/IA/a11y). First-class inputs.*

UX-DR1: Implement the 7-scheme token system — Deep Sea (default, dark), Forest/Sage, Twilight, Soft Paper (white/light), Accessible (colourblind-safe), Soft Pink, Sky Blue — re-skinning the shared primitives (`.surface-raised`, `.btn-accent-3d`, `.input-glow`, `.checkbox`, progress-wheel, companion) via CSS custom properties swapped by a root data-attribute; active scheme read from `usePrefs`.
UX-DR2: Progress-wheel component — circular accumulation ring (accent fill on a faint track, round caps); no number/denominator/percentage/remaining; no full/closed state; no closure animation; `role="img"` + number-free `aria-label` + `aria-live="polite"`; delete the shipped `RING_TARGET=8` constant and the horizontal bar it drove.
UX-DR3: Companion component — 3-pose SVG set (`creature_soft`/`creature_smile`/`creature_grin`) cross-faded by expression; breathing idle, gentle smile, little dance, deep sigh; per-scheme recolor via inlined-SVG `feColorMatrix` keyed to `creature-tint`; reaction glow ≥3:1 vs background and never the sole reaction cue (the copy line always carries it); static blurred ground shadow. Lazy-load the ~255KB/pose art off the Focus first paint.
UX-DR4: Subtask-card component — flatter, lighter mini-card with its own border; reveal two-at-a-time with exactly one active; the active state carries non-colour signals (left indicator bar + elevated/expanded state + "In progress — just this one." meta label), colour is reinforcement only.
UX-DR5: Checkbox done-state — recessed unchecked box; done fills success-green with a REQUIRED white check glyph + line strike-through (green never conveys done on its own); hit target extends ≥44/48 beyond the visible rim.
UX-DR6: Carry-forward treatment — `carryforward` token (#8a9aa6), soft left tick/dot + persistent "still needs doing" text label on every surface; identical regardless of age or volume; never red/badge/count; a mass of carried tasks must not read as an alarm field.
UX-DR7: 4-surface bottom nav (Focus · Plan · +FAB center · Archive · Settings); the +FAB focuses `#task-quick-input` on Plan and never opens a creation modal directly; safe-area insets + `nav-clearance` padding on scroll surfaces.
UX-DR8: Focus task card + dim-and-sink — on auto-complete the task dims (reduced opacity), stays visible, and drops to the bottom of the list; optimistic, never network-gated.
UX-DR9: Archive view — flat reverse-chronological list; NO date-group tiles, NO calendar grid, NO section counts/totals/aggregates.
UX-DR10: Accent text-contrast rule — accent is fill / large-text (≥18.66px or ≥14px bold) / UI-component colour only (≥3:1); never body-size text or links; small interactive text/links use `highlight` (dark schemes) or a darkened `accent-text` ≥4.5:1 (light schemes).
UX-DR11: Reduced-motion end-state mapping — each animation (greeting smile, breathing idle, subtask smile, little dance, dim-and-sink, wheel growth, first-open beat, deep sigh, day-end sweep) resolves to its defined static end-state (never a frozen mid-frame); information an animation carried is still presented statically, never silently dropped.
UX-DR12: Accessibility floor — tap targets ≥44pt/48dp (checkbox hit area, disclosure control, drag handle); focus order = reading order; on any list mutation move focus to a defined successor (never `body`); +FAB sets focus to the input on open and restores to the FAB on dismiss; sheets/dropdowns dismissible via Esc + Android back, topmost-first; screen-reader announcements (completion "done", carry-forward "still needs doing", next-active subtask).
UX-DR13: Voice/tone microcopy — warm, brief, plainspoken, never cutesy; companion lines are random/rotating within a tier (never chosen by count/sequence/"how the day is going"); idle line "Here with you today."; carry-forward "still needs doing"; empty states invite, never instruct or pressure.
UX-DR14: Onboarding flow — name-to-be-called entry, scheme picker (7), creature picker (presets), a warm welcome message, and the one-time first-open beat.
UX-DR15: Typography + depth system — Playfair Display (display/heading — greeting, hero task title, day-end line) over Inter (body/meta); tactile depth (top-lit `.surface-raised` cards, `.btn-accent-3d` lip that compresses on press, recessed inputs/checkboxes, soft tinted shadows); 0.75rem radius ramp; single-accent discipline (~10% of screen).

### FR Coverage Map

FR1: Epic 1 — first-run collects name / scheme / creature
FR2: Epic 1 — warm welcome message after setup
FR3: Epic 1 — name / scheme / creature editable in Settings
FR4: Epic 2 — create tasks any time
FR5: Epic 2 — priority 1–5 per task
FR6: Epic 2 — one-level subtasks, add/edit anytime
FR7: Epic 2 — passive decompose nudge at capture
FR8: Epic 2 — neutral Plan surface, creature passive
FR9: Epic 2 — date-only due date
FR10: Epic 2 — edit/delete tasks and subtasks
FR11: Epic 3 — one task at a time on Focus
FR12: Epic 2 — ordering rule (priority→due→added→manual) as data + pure fn
FR13: Epic 3 — subtasks revealed two at a time
FR14: Epic 3 — subtask completion + tier-1 reaction
FR15: Epic 3 — whole-task auto-complete, dim-and-sink, little dance
FR16: Epic 3 — progress wheel grows with completions
FR17: Epic 3 — three-tier proportional reaction ladder
FR18: Epic 3 — soft greeting on open, never pounces
FR19: Epic 4 — explicit "I'm done for today" sweep + sigh
FR20: Epic 3 — reactions respect reduced-motion
FR21: Epic 4 — calm carry-forward "still needs doing"
FR22: Epic 4 — completed work moves to the archive on day-end
FR23: Epic 4 — archive shows completed only, no stats
FR24: Epic 1 — one-time first-open beat
FR25: Epic 3 — progress-wheel accumulation-only guardrail
FR26: Epic 4 — archive structural anti-scoreboard guardrail

## Epic List

### Epic 1: Make it mine — onboarding, personalization & the app shell
Install Essence and be dropped into a calm 4-surface home that already feels like the user's own: choose a name to be called by, one of 7 colour schemes, and a creature; receive a warm welcome and a one-time first-open beat; change any of it later from Settings — and it never nags. Establishes the local `usePrefs` store (AD-6), the CSS-variable token/theming system for all 7 schemes (UX-DR1), the 4-surface bottom nav + routing restructure (Today→Focus, Upcoming+Browse→Plan, Completed→Archive), and the installable-PWA shell whose service worker never registers push (AD-12).
**Companion boundary:** Epic 1 **reuses the shipped `Companion.jsx` as-is** for the first-open beat (FR24) and greeting — it does **not** author new companion internals. Epic 3 owns and rebuilds the companion (poses, reaction channel, recolor). This keeps onboarding's emotional payload without churning `Companion.jsx` across epics.
**FRs covered:** FR1, FR2, FR3, FR24

### Epic 2: Get it out of my head — capture & planning
Dump tasks freely on the neutral Plan surface, assign each a 1–5 priority, break them into subtasks (gently nudged, never forced), and edit or delete freely — the full list is welcome here and the creature stays passive. Establishes the Task schema changes (`priority` int 1–5, `order`; drop the shipped `due_time`/`today` drift) with mandatory round-trip verification, the `useTasks` capture/edit mutations, and the pure `src/lib` ordering function (priority→due→added→manual override).
**FR12 scope note:** Epic 2 owns the `order` field, the pure sort/effective-order function, **and the manual-rearrange drag gesture on the Plan list** (the list UI lives here). The Focus view (Epic 3) only *consumes* the resulting effective order — it does not re-implement ranking.
**FRs covered:** FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR12

### Epic 3: One thing at a time — the focus view, the win-moment & the companion
Work the single highest-ranked task with the backlog off-screen; reveal subtasks two at a time; feel the proportional, always-quiet win as subtasks and whole tasks complete, the accumulation-only wheel grows, and the warm restrained companion greets and reacts — all reduced-motion-safe and optimistic. Establishes the Focus surface, `completed_at`-derived progress (retiring `winMoment`, deleting `RING_TARGET=8`), and the `reactions.js` transient channel + three-tier ladder + companion 3-pose art.
**Keep-lean note (land the feeling first):** the felt win-moment — subtask (tier-1) and whole-task (tier-2) reactions with the companion and wheel **in the default Deep Sea scheme** — is the core value and the untested bet; sequence stories toward it and hold it minimal. The **per-scheme creature recolor (feColorMatrix, UX-DR3) is the explicitly deferrable tail** — a refinement that can slip to a later pass (or ride with the theming work) without blocking the epic's value. Suggested story spine: (1) schema/derived-state groundwork (`completed_at`, retire `winMoment`, delete `RING_TARGET`); (2) Focus surface + effective-order consumption; (3) two-at-a-time subtask reveal + completion; (4) whole-task win + dim-and-sink + accumulation wheel (extract the wheel out of `Companion.jsx`, retire `winMoment`); (5) companion greeting + `reactions.js` channel + subtask reaction; (6) whole-task reaction (little dance) + no-subtask rule + rollback edge; (7) *deferrable* per-scheme creature recolor.
**FRs covered:** FR11, FR13, FR14, FR15, FR16, FR17, FR18, FR20, FR25

### Epic 4: On his terms — day-end, carry-forward & the archive
End the day only when the user decides — the explicit "I'm done for today" gesture sweeps the dimmed completed tasks into the archive and the creature lets out a deep, slow sigh; tasks left undone carry forward calmly as "still needs doing"; completed work lands in a quiet reverse-chronological archive whose structure makes a scoreboard impossible. Establishes the `archived_at` bulk-stamp sweep action (replacing the delete-based `clearCompleted`), the derived carry-forward treatment, and the Archive surface with its guardrails.
**FRs covered:** FR19, FR21, FR22, FR23, FR26

---

## Epic 1: Make it mine — onboarding, personalization & the app shell

Install Essence and be dropped into a calm 4-surface home that already feels like the user's own: choose a name, one of 7 schemes, and a creature; receive a warm welcome and a one-time first-open beat; change any of it later from Settings — and it never nags.

### Story 1.1: The 7-scheme token system & local prefs store

As a builder,
I want the app to wear any of seven calm colour schemes and remember my choice on my device,
So that the space feels like mine from the first tap.

**Acceptance Criteria:**

**Given** the app loads with no stored prefs
**When** it renders
**Then** it uses the default Deep Sea (dark) scheme
**And** no network call is made to load prefs.

**Given** a scheme is applied
**When** the root data-attribute is set
**Then** every shipped primitive (`.surface-raised`, `.btn-accent-3d`, `.input-glow`, `.checkbox`, progress-wheel, companion) re-skins live via CSS custom properties
**And** there is no hardcoded hex — only design tokens (NFR5).

**Given** each of the 7 schemes (Deep Sea, Forest/Sage, Twilight, Soft Paper [white], Accessible [colourblind-safe], Soft Pink, Sky Blue)
**When** it is active
**Then** no red/alarm colour appears in the task loop and a single accent holds (~10% of screen) (NFR8, UX-DR1, UX-DR15).

**Given** a scheme choice
**When** the app is reloaded
**Then** the choice persists via `usePrefs` (localStorage) and no Base44 write occurred (AD-6).

**Given** the token roles
**When** text colours are assigned
**Then** the accent is used only as a fill / large-text (≥18.66px or ≥14px bold) / UI-component colour (≥3:1) — never for body-size text or links; small interactive text/links use `highlight` (dark schemes) or a darkened `accent-text` ≥4.5:1 (light schemes) (UX-DR10).

**And** `usePrefs` exposes `name`, `scheme`, `creature`, `onboarded`, and is the only module reading/writing those keys.

### Story 1.2: The 4-surface app shell & routing restructure

As a builder,
I want a calm four-surface home with a single create button,
So that I can move between doing, planning, history, and settings without clutter.

**Acceptance Criteria:**

**Given** the authenticated app
**When** it renders
**Then** the bottom nav shows Focus · Plan · +FAB (center) · Archive · Settings, honoring safe-area insets and `nav-clearance` padding on scroll surfaces (UX-DR7).

**Given** the shipped routes
**When** routing is restructured
**Then** Today→Focus (`/`), Upcoming+Browse merge→Plan, Completed→Archive, Settings remains
**And** the auth routes (login/register/forgot/reset) are unchanged.

**Given** the surfaces are not yet rebuilt (Focus in Epic 3, Plan in Epic 2, Archive in Epic 4)
**When** the routing restructure lands
**Then** the shipped Today / Upcoming / Browse / Completed page **bodies remain mounted and functional** under the new routes as working placeholders — later epics replace their *contents*, so the app is never broken between this story and those epics.

**Given** the +FAB
**When** tapped
**Then** it focuses `#task-quick-input` on the Plan surface and never opens a creation modal directly
**And** on dismiss, focus returns to the FAB.

**And** modal/sheet depth never exceeds one level; sheets are dismissible via Esc and the Android back button, topmost-first (UX-DR12).

### Story 1.3: First-run onboarding (name, scheme, creature, welcome, beat)

As a new builder,
I want a brief calm setup to name myself, pick a scheme and creature, and feel a warm first moment,
So that my first session lands emotionally without a tutorial.

**Acceptance Criteria:**

**Given** a fresh install with `onboarded` unset
**When** the app opens
**Then** onboarding is shown, not the Focus surface.

**Given** onboarding
**When** I proceed through it
**Then** I choose a name to be called by, a colour scheme (one of 7, default Deep Sea), and a creature from presets
**And** there is no task tutorial and no multi-step feature walkthrough (FR1).

**Given** setup completes
**When** it finishes
**Then** a brief warm welcome names the space as mine and makes no demand (FR2)
**And** the `onboarded` flag is set in `usePrefs`.

**Given** the empty post-onboarding state
**When** the first-open beat plays
**Then** it uses the shipped `Companion.jsx` as-is (no new companion internals), plays once, self-dismisses, and does not block adding a task (FR24).

**Given** `prefers-reduced-motion`
**When** the beat would play
**Then** it resolves to a static resting pose and still presents its warm content statically — never silently dropped (UX-DR11).

### Story 1.4: Settings personalization & notifications-off toggle

As a builder,
I want to change my name, scheme, and creature later and control notifications,
So that depth lives in Settings while onboarding stays minimal.

**Acceptance Criteria:**

**Given** the Settings surface
**When** I change name, scheme, or creature
**Then** the change persists via `usePrefs` and the scheme re-skins every surface live (FR3, NFR9).

**Given** the notifications toggle
**When** Settings first renders
**Then** the toggle is OFF by default and is only ever enabled by me (NFR7).

**Given** onboarding versus Settings
**When** compared
**Then** onboarding exposes only the three first-run choices while Settings holds the fuller personalization depth (NFR9).

### Story 1.5: Installable PWA shell (no push)

As a builder,
I want to install Essence to my home screen and trust it will never nag me,
So that it pulls me back by being calm, not by notifications.

**Acceptance Criteria:**

**Given** the app
**When** built
**Then** a web manifest and a service worker (via `vite-plugin-pwa`) make it installable to the home screen, configured for install + auto-update.

**Given** the service worker
**When** it registers
**Then** it NEVER requests Push or Notification permissions (AD-12)
**And** it does NOT runtime-cache the Base44 API (avoid stale data).

**Given** a new deploy
**When** the app is reopened
**Then** the service worker auto-updates to the new bundle rather than serving a stale one.

---

## Epic 2: Get it out of my head — capture & planning

Dump tasks freely on the neutral Plan surface, assign each a 1–5 priority, break them into subtasks (gently nudged, never forced), and edit or delete freely — the full list is welcome here and the creature stays passive.

### Story 2.1: Capture a task with priority on the Plan surface

As a builder,
I want to dump a task and mark how important it is on a neutral planning surface,
So that I can get it out of my head without the list judging me.

**Acceptance Criteria:**

**Given** the Plan surface
**When** it renders
**Then** the full task list may be visible and the creature sits passively with no reactions (FR8).

**Given** the +FAB quick-input (`#task-quick-input`)
**When** I enter a title and submit
**Then** a task is created via `useTasks` (optimistic) and appears in the Plan list (FR4).

**Given** a task
**When** I set its priority
**Then** it stores an integer priority 1–5 (5 = most important) (FR5).

**Given** the shipped Task schema
**When** it is migrated
**Then** `priority` is declared as an integer (converting the shipped `priority:"normal"`), the undeclared drift fields `due_time` and `today` are dropped, and the change is round-trip-verified — **create → read back through the SDK → confirm the field persisted, before wiring any UI** (the Nidus gate) (NFR12, AD-5).

**And** task data persists in Base44 as private, single-user data (NFR2, NFR10); no component calls `base44.entities.Task.*` directly — all writes go through `useTasks` (AD-1, AD-2).

**Given** a save failure
**When** the optimistic create fails
**Then** it rolls back honestly with the existing error toast (NFR6).

### Story 2.2: Break a task into subtasks with a gentle nudge

As a builder,
I want to decompose a task into subtasks when I capture it or later,
So that big things feel doable.

**Acceptance Criteria:**

**Given** a task
**When** I add subtasks
**Then** they persist as one-level-deep subtasks (the shipped `Task.subtasks` array — no schema change) and can be added at capture or later and edited anytime (FR6).

**Given** the capture input with no subtasks
**When** it renders
**Then** a single passive decompose nudge (placeholder / hint text) invites decomposition (FR7).

**Given** the decompose nudge
**When** I ignore it
**Then** it never blocks save, never becomes a recurring prompt or an "incomplete: no subtasks" warning, and never appears on the Focus surface (FR7).

### Story 2.3: Set a due date and edit or delete tasks and subtasks

As a builder,
I want to give a task a due date and change or remove tasks and subtasks,
So that my plan stays honest as things change.

**Acceptance Criteria:**

**Given** a task
**When** I set a due date
**Then** it stores a date-only `YYYY-MM-DD` value and no time-of-day is captured or shown (FR9).

**Given** a task or subtask
**When** I edit its fields
**Then** the change persists via `useTasks` (optimistic, rollback on failure) (FR10).

**Given** a task or subtask
**When** I delete it
**Then** it is removed via `useTasks`; deleting a task removes its subtasks (FR10).

### Story 2.4: Order the backlog and rearrange it by hand

As a builder,
I want my backlog ordered sensibly and rearrangeable by hand,
So that the next thing to do is the right thing.

**Acceptance Criteria:**

**Given** the backlog
**When** it is ordered
**Then** a pure `src/lib` function ranks tasks by (1) priority 5→1, (2) due date sooner-first (date-only), (3) order added earliest-first — a total comparator where a null `due_date` sorts last within its priority band (FR12, AD-4, AD-8).

**Given** the ordering function
**When** it is built
**Then** it ships with Vitest unit tests — the only safety net for `src/lib` (NFR12).

**Given** the Task schema
**When** it is migrated
**Then** an `order` field is added to persist manual arrangement, round-trip-verified — **create/update → read back through the SDK → confirm persisted, before wiring UI** (the Nidus gate) (NFR12, AD-5).

**Given** the Plan list
**When** I drag a task to a new position
**Then** the new order persists via the `order` field and becomes authoritative — a global override, so a manually-placed task holds its slot regardless of priority (FR12, AD-8).

**And** the drag handle has an adequate grab zone meeting the ≥44pt / 48dp tap-target floor (UX-DR12).

### Story 2.5: Migrate the live task dataset to the new schema

As a builder with tasks already in the app,
I want my existing tasks carried cleanly onto the new schema,
So that upgrading never corrupts my backlog or floods my Focus surface.

**Acceptance Criteria:**

**Given** existing tasks with the legacy `priority:"normal"` string
**When** the migration runs
**Then** each is mapped to an integer priority (default 3 / mid) and the drift fields `due_time` and `today` are removed — leaving every task valid under the new schema (AD-5).

**Given** existing tasks with no `order`
**When** the migration runs
**Then** each is assigned an `order` seeded from its `created_date`, so the effective-order sort (Story 2.4) is total and stable over legacy rows (AD-8).

**Given** existing **completed** tasks (which have no `archived_at`)
**When** the migration runs
**Then** the nullable `archived_at` column is added and **stamped on every already-completed task** (to its `created_date`), so legacy completed work lands in the Archive — NOT as dimmed "completed-unswept" clutter on the Focus surface (AD-7).

**Given** the migration
**When** it executes
**Then** it is a one-time, **idempotent** operation (safe to re-run) that verifies each write with a real read-back before proceeding (the Nidus gate), and reports/aborts safely rather than half-migrating (NFR12).

**Given** the schema
**When** this story lands
**Then** it adds the nullable `archived_at` column only; the sweep *behavior* that stamps it on newly-completed tasks remains Epic 4 (AD-5, AD-7).

---

## Epic 3: One thing at a time — the focus view, the win-moment & the companion

Work the single highest-ranked task with the backlog off-screen; reveal subtasks two at a time; feel the proportional, always-quiet win as subtasks and whole tasks complete, the accumulation-only wheel grows, and the warm restrained companion greets and reacts — all reduced-motion-safe and optimistic. Story spine lands the felt win-moment first; the per-scheme creature recolor is the deferrable tail.

### Story 3.1: The Focus surface — one task at a time

As a builder,
I want to see only the single most important task with the rest of the backlog off-screen,
So that I can work without facing the wall of everything I owe.

**Acceptance Criteria:**

**Given** more than one incomplete task
**When** the Focus surface renders
**Then** it shows exactly one task — the highest-ranked incomplete in the effective order from Epic 2 — with subtasks collapsed and the full backlog off-screen (FR11, AD-8).

**Given** the Focus surface
**When** it consumes ordering
**Then** it reuses the `src/lib` effective-order function and does not re-implement ranking (AD-8).

**Given** the Focus surface
**When** rendered
**Then** priority is not shown (hidden in Focus), so no ranking pressure enters the moment of doing.

### Story 3.2: Two-at-a-time subtask reveal & completion

As a builder,
I want to reveal a task's subtasks two at a time and complete them one by one,
So that progress feels like a gentle flow, not a checklist dump.

**Acceptance Criteria:**

**Given** a task with subtasks on Focus
**When** I expand the subtask dropdown
**Then** at most the first two subtasks appear, with exactly one active/expanded (FR13).

**Given** the active subtask
**When** I complete it
**Then** it is removed from view, the next flows up, and the following incomplete subtask becomes active — still exactly one active (FR14 mechanic).

**Given** the subtask-card
**When** the active one renders
**Then** its active state is carried by non-colour signals — a left indicator bar, its elevated/expanded state, and an "In progress — just this one." label — with accent tint as reinforcement only (UX-DR4).

**Given** the completion checkbox
**When** a subtask is done
**Then** the done state shows the required white check glyph and line strike-through (never colour alone), and the hit target extends ≥44/48 beyond the visible rim (UX-DR5, UX-DR12).

### Story 3.3: The whole-task win — auto-complete, dim-and-sink, completed_at

As a builder,
I want a finished task to quietly settle and stay visible as proof,
So that I feel accomplished without being pushed onward.

**Acceptance Criteria:**

**Given** the last subtask is completed (or a no-subtask line is checked)
**When** completion fires
**Then** the parent task auto-completes: it dims (reduced opacity) but stays visible and drops to the bottom of the list (FR15, UX-DR8).

**Given** a completion
**When** it occurs
**Then** it fires optimistically before the save returns and, on save failure, rolls back honestly (NFR4, NFR6).

**Given** the Task schema
**When** migrated
**Then** `completed_at` (timestamp) is added — set on every `false→true` transition and cleared on un-complete — and round-trip-verified — **write → read back through the SDK → confirm persisted, before wiring UI** (the Nidus gate) (AD-3, AD-5, NFR12).

**Given** `prefers-reduced-motion`
**When** a task auto-completes
**Then** it is shown already dimmed and already at the bottom, with no animated dim-or-sink (FR20, UX-DR11).

### Story 3.4: The accumulation progress wheel (derived)

As a builder,
I want a quiet ring that grows as I finish things and never shows how much is left,
So that progress feels like proof, never pressure.

**Acceptance Criteria:**

**Given** today's completions
**When** the wheel renders
**Then** it derives its level from the count of tasks whose `completed_at` is in the local day — never a separately stored counter (AD-3).

**Given** the wheel
**When** displayed
**Then** it is a circular accumulation ring (accent fill, faint track, round caps) with NO number, denominator, percentage, "remaining," shortfall, cross-day comparison, full/closed state, or closure animation (FR16, FR25, UX-DR2).

**Given** the wheel level decreases (e.g. a task is un-completed, lowering the derived count)
**When** it re-renders
**Then** it **animates growth only** — a decrease resolves *silently* at the new level with no downward animation, so the eye is never drawn to a subtraction (a shortfall cue is forbidden even in honest form) (FR25, AD-11).

**Given** the shipped `winMoment.js` counter and `RING_TARGET=8` bar
**When** this story lands
**Then** the counter is retired (no code reads/writes `essence_win_*` keys) and `RING_TARGET=8` plus the horizontal bar are deleted (AD-3, UX-DR2).

**Given** the progress wheel is currently jammed inside the shipped `Companion.jsx`
**When** this story lands
**Then** the wheel is **extracted into its own component** and the companion's dependency on `winMoment` is cut in the **same** story — so the still-mounted companion (from Epic 1) keeps rendering and **never breaks** between this story and the companion rebuild (AD-3, AD-9).

**Given** accessibility
**When** the wheel is announced
**Then** it uses `role="img"` with a number-free `aria-label` and `aria-live="polite"` — never `role="progressbar"` (UX-DR2, AD-11).

**Given** the derivation and any new `src/lib` logic
**When** built
**Then** it ships with Vitest tests including the new-day reset and the un-complete decrement (NFR12).

### Story 3.5: The companion greeting & the reaction channel (subtask tier)

As a builder,
I want a warm creature that greets me and reacts to each subtask I finish,
So that small wins feel supported.

**Acceptance Criteria:**

**Given** the app opens
**When** the Focus surface loads
**Then** the creature greets with a soft resting smile and a brief encouraging welcome — it never pounces (FR18).

**Given** the reaction system
**When** built
**Then** a transient tier-tagged channel (`reactions.js`) exists and the `Companion` subscribes to it — carrying transient events only, never persisted state (AD-9).

**Given** a subtask completion
**When** it fires
**Then** the task store emits `{tier: 'subtask'}` and the companion plays the tier-1 reaction — a gentle smile + a brief line (FR14, FR17, AD-9).

**Given** the reaction line
**When** chosen
**Then** it is random/rotating within its tier — never chosen by completion count, sequence, or "how the day is going" (UX-DR13, AD-9).

**Given** `prefers-reduced-motion`
**When** the greeting, breathing idle, or a subtask reaction would play
**Then** each resolves to its static end-state (greeting shown already smiling; idle a static resting pose; the subtask reaction shown as its end-state with the line static) — never a frozen mid-frame, information never dropped (FR20, UX-DR11).

### Story 3.6: The whole-task reaction — the little dance

As a builder,
I want the creature to quietly celebrate a whole task,
So that finishing something feels earned without being loud.

**Acceptance Criteria:**

**Given** a whole-task completion
**When** it fires
**Then** the task store emits `{tier: 'task'}` and the companion plays the tier-2 reaction — a small, low-amplitude little dance, never confetti-scale (FR15, FR17, AD-9).

**Given** a task with no subtasks
**When** its single line is completed
**Then** it fires the **task** tier (a whole-task win), not the subtask tier (AD-9).

**Given** any reaction
**When** it fires
**Then** the tier is set by event type only and stays flat within a tier — never intensifying by priority, milestone, or volume (FR17).

**Given** an optimistic completion that later rolls back
**When** the save fails
**Then** the already-faded ~1.5s reaction is not revoked; the honest rolled-back state plus a toast is shown (AD-9, NFR6).

**Given** `prefers-reduced-motion`
**When** a whole-task reaction would play
**Then** it is shown as its end-state (the task already dimmed and sunk, the wheel already at its new level) with no dance played — information never dropped (FR20, UX-DR11).

### Story 3.7: Per-scheme creature recolor *(deferrable tail)*

As a builder,
I want the creature to match whichever scheme I chose,
So that the companion feels part of my space.

**Acceptance Criteria:**

**Given** the shipped painterly companion art
**When** recolored per scheme
**Then** it uses a token-driven transform over ONE shared, inlined SVG art set — an `feColorMatrix` (desaturate → tint toward `creature-tint`), not per-scheme baked art and not CSS `hue-rotate` (AD-10, UX-DR3).

**Given** any of the 7 schemes
**When** the creature and its reaction glow render
**Then** silhouette and glow stay ≥3:1 against their immediate background, and the glow is never the sole reaction signal — the companion copy line always carries it (AD-10, UX-DR3).

**Given** epic sequencing
**When** the win-moment (Stories 3.1–3.6) is complete in the default scheme
**Then** this story may slip to a later refinement pass without blocking the epic's core value.

---

## Epic 4: On his terms — day-end, carry-forward & the archive

End the day only when the user decides — the explicit "I'm done for today" gesture sweeps the dimmed completed tasks into the archive and the creature lets out a deep, slow sigh; tasks left undone carry forward calmly as "still needs doing"; completed work lands in a quiet reverse-chronological archive whose structure makes a scoreboard impossible.

### Story 4.1: Calm carry-forward — "still needs doing"

As a builder,
I want unfinished tasks to carry to the next day without shame,
So that a backlog never becomes a source of dread.

**Acceptance Criteria:**

**Given** an incomplete task with a `due_date` before today
**When** the day rolls over
**Then** it is derived as carry-forward (`incomplete && due_date != null && due_date < today`) by a pure `src/lib` function with Vitest tests — no field is stored (AD-3, NFR12).

**Given** a carried task
**When** shown on Focus or Plan
**Then** it carries the `carryforward` token (#8a9aa6) treatment — a soft left tick/dot plus a persistent "still needs doing" text label on every surface — never red, never a badge or count, never the word "overdue" (FR21, UX-DR6, NFR5).

**Given** carried tasks
**When** one ages or many carry at once
**Then** the treatment is identical — never intensifying with age, never compounding by volume; a mass of carried tasks must not read as an alarm field (FR21, UX-DR6).

**Given** a task with no `due_date`
**When** evaluated
**Then** it is never marked carry-forward (AD-3).

**Given** a screen reader
**When** a carried task is announced
**Then** it carries an explicit "still needs doing" `aria-label` (UX-DR12).

### Story 4.2: "I'm done for today" — the sweep and the sigh

As a builder,
I want to end the day on my own terms and feel the day settle,
So that the morning's dread becomes evening's contentment.

**Acceptance Criteria:**

**Given** the Focus surface
**When** it renders
**Then** the "I'm done for today" control is always present regardless of list state — never auto-gated on an empty or completed list (FR19).

**Given** I tap "I'm done for today"
**When** the sweep runs
**Then** a `useTasks` store action bulk-stamps `archived_at` on the currently-completed tasks and they clear from Focus into the Archive — it never deletes (FR19, FR22, AD-7).

**Given** the shipped delete-based `clearCompleted`
**When** this lands
**Then** it is replaced by the `archived_at` bulk-stamp action, so no completed task is ever deleted by the sweep (AD-7).

**Given** the Task schema
**When** migrated
**Then** the sweep stamps `archived_at` (the nullable column was added in Story 2.5) and is round-trip-verified — **stamp → read back through the SDK → confirm persisted, before wiring UI** (the Nidus gate) (AD-5, AD-7, NFR12).

**Given** the sweep completes
**When** the creature reacts
**Then** it plays the tier-3 reaction via the `reactions.js` channel — a smile then a deep, slow sigh (FR19, AD-9).

**Given** I have ended the day
**When** I capture a late task afterward
**Then** it is never discouraged — the day ended by my gesture, not the app's (FR19).

**Given** `prefers-reduced-motion`
**When** the sweep runs
**Then** completed tasks are shown already cleared into the Archive and the creature already in its settled resting pose — no sweep motion (FR20, UX-DR11).

### Story 4.3: The Archive — a calm "what I did"

As a builder,
I want a quiet record of what I've completed,
So that I have proof of progress without a scoreboard.

**Acceptance Criteria:**

**Given** the Archive surface
**When** it renders
**Then** it shows only completed (archived) tasks as a flat reverse-chronological list ordered by `archived_at` descending (FR22, FR23, AD-7).

**Given** the Archive
**When** displayed
**Then** it never shows totals, per-day tiles, calendar grids, section counts, streaks, or any aggregate/cadence view — the structure itself makes a scoreboard impossible (FR23, FR26, UX-DR9).

**Given** no archived tasks
**When** the Archive renders
**Then** it shows a calm "nothing here yet" message with no scoreboard scaffolding (UX-DR9).

**Given** the Archive
**When** shown
**Then** it never displays missed or incomplete work — only "what I did" (FR23).
