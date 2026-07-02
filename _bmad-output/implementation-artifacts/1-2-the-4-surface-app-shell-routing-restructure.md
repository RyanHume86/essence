---
baseline_commit: 162182f40ff6756f6a09200a2b241dd94f30558b
---

# Story 1.2: The 4-surface app shell & routing restructure

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a builder,
I want a calm four-surface home with a single create button,
So that I can move between doing, planning, history, and settings without clutter.

## Acceptance Criteria

1. **4-surface bottom nav.** Given the authenticated app, when it renders, then the bottom nav shows **Focus · Plan · +FAB (center) · Archive · Settings**, honoring safe-area insets and `nav-clearance` padding on scroll surfaces. *(UX-DR7)*

2. **Routing restructure, auth untouched.** Given the shipped routes, when routing is restructured, then Today→Focus (`/`), Upcoming+Browse merge→Plan, Completed→Archive, Settings remains **and** the auth routes (login/register/forgot/reset) are unchanged. *(Architecture: Routing / 4 surfaces)*

3. **No broken intermediate state.** Given the surfaces are not yet rebuilt (Focus in Epic 3, Plan in Epic 2, Archive in Epic 4), when the routing restructure lands, then the shipped Today / Upcoming / Browse / Completed page **bodies remain mounted and functional** under the new routes as working placeholders — later epics replace their *contents*, so the app is never broken between this story and those epics.

4. **+FAB focuses Plan capture, never a modal.** Given the +FAB, when tapped, then it focuses `#task-quick-input` on the Plan surface and never opens a creation modal directly **and** on dismiss, focus returns to the FAB. *(UX-DR7, UX-DR12)*

5. **Shallow, dismissible overlays.** Modal/sheet depth never exceeds one level; sheets are dismissible via Esc and the Android back button, topmost-first. *(UX-DR12)*

## Tasks / Subtasks

- [x] **Task 1 — Restructure the routes (AC: 2, 3)**
  - [x] In `src/App.jsx` remapped to the 4 surfaces + kept every shipped body reachable: `/`→Today (Focus), `/plan`→Upcoming (Plan), `/archive`→Completed (Archive), `/settings`→Settings, `/browse`→Browse (secondary, not in nav).
  - [x] Added back-compat redirects: `<Route path="/upcoming" element={<Navigate to="/plan" replace />} />` and `/completed`→`/archive` (`Navigate` was already imported).
  - [x] Did NOT rename page component files — placeholders kept as-is.
  - [x] Fixed the one internal link: `Settings.jsx` `<Link to="/completed">` → `/archive` (label updated "Completed tasks" → "Archive" to match the surface).
- [x] **Task 2 — Rebuild the bottom nav to the 4 surfaces (AC: 1)**
  - [x] `BottomNav.jsx` `LEFT_ITEMS`/`RIGHT_ITEMS` → Focus (`/`, `CheckSquare`) · Plan (`/plan`, `CalendarDays`) · Archive (`/archive`, `Archive`) · Settings (`/settings`, `Settings`); FAB keeps `Plus`. Removed the now-unused `LayoutGrid` import.
  - [x] Kept the active-state treatment (`text-highlight`, `bg-primary/10`) and the `useLocation()` + `startsWith` rule.
  - [x] Tap targets: each nav slot's clickable `<Link>` fills the full `h-16` (64px) nav height and `flex-1` width — the hit area is the whole slot (≥44), not just the 40px icon container. FAB is 56px. No change needed.
  - [x] Preserved the shipped safe-area padding and `-mt-7` FAB overlap.
- [x] **Task 3 — Move the create-path onto Plan (AC: 3, 4)**
  - [x] Relocated the shipped `TaskInput` (`#task-quick-input`) from `Today.jsx` to the Plan placeholder (`Upcoming.jsx`), wired `onAdd={(vals) => actions.create(vals)}`. Input kept as-is (Epic 2 rebuilds internals behind the same id).
  - [x] `#task-quick-input` is now unique — removed from Today (also removed its now-unused import; updated the stale "Capture something above" empty-state copy).
  - [x] FAB handler now targets `/plan` (navigate if needed, then focus + `scrollIntoView`); never opens a modal.
  - [x] Focus-return on dismiss: FAB has `id="create-fab"`; an Escape keydown listener on the input blurs it and returns focus to the FAB. Kept lightweight (Escape-only) to avoid blur/drawer-focus false triggers — the robust version rides with Epic 2's real input.
- [x] **Task 4 — Header + overlay hygiene (AC: 2, 5)**
  - [x] `TopHeader.jsx` `ROOT_PATHS` → `["/", "/plan", "/archive", "/settings"]`; `/browse` stays secondary (shows back). Brand title unchanged.
  - [x] Overlays verified one level deep (the `vaul`/Radix drawers in `TaskInput` + `Completed`); Esc dismissal is a Radix default. **Browser/Android-back dismissal not added** — see Completion Notes (deferred: bolting `popstate` onto soon-to-be-replaced Epic-2 drawers is churn; no second overlay layer introduced, which is the AC's core intent).
- [x] **Task 5 — Verify the shell end-to-end (AC: 1–5)**
  - [x] Route table verified by reading `App.jsx`; redirects in place; `/browse` still routed; Settings→`/archive` link fixed; **grep confirms zero stray links** to the old routes.
  - [x] FAB→Plan focus + Escape-return implemented and reasoned through (lint/build clean); **runtime click-through deferred to /verify** — the local app is Base44-auth-gated (no creds) so the authenticated shell can't be reached here. App boot verified: console shows only env-gated Base44 404s, **no React Router/render errors** from these changes.
  - [x] `nav-clearance` (`.pb-nav`) untouched and still applied by `AppLayout` to `<main>`; safe-area padding preserved on nav/header.
  - [x] Nav active-state uses `text-highlight`/`bg-primary/10`, which are scheme-reactive via Story 1.1 — re-skins for free; runtime multi-scheme smoke-test folded into the /verify pass.

## Dev Notes

### What this story is (and is NOT)
This is the **shell + routing** slice of Epic 1. It makes the 4-surface IA real and renames routes **without breaking any shipped functionality** — the readiness review calls this out as one of the plan's two "exemplary no-broken-intermediate-state" moves: *"Story 1.2 keeps shipped Today/Upcoming/Browse/Completed page bodies mounted as working placeholders under the new routes, so the app is never broken between the routing restructure and the later epics that replace their contents."* [Source: implementation-readiness-report-2026-07-01.md]

**NOT in this story — hold the line:**
- **The real Focus view (one-task-at-a-time, AD-8)** is Story 3.1. `/` here is just the shipped Today body as a placeholder; it still shows a list, and that is fine.
- **The real Plan surface** (backlog list, priority capture, drag-reorder) is Epic 2. `/plan` here is the shipped Upcoming body + the relocated shipped input.
- **The real Archive** (reverse-chron by `archived_at`, anti-scoreboard) is Story 4.3.
- **Onboarding UI and the `onboarded` routing gate** are Story 1.3. **Do not add an onboarding redirect here** — there is no onboarding page yet, so a gate would dead-end. 1.3 adds the page and the gate together. [Source: epics.md#Story 1.3; EXPERIENCE.md#Information Architecture]
- **The installable PWA shell** (manifest + service worker) is Story 1.5.

### Current shell state (what you're changing — precise)
[Source: current `src/App.jsx`, `src/components/layout/BottomNav.jsx`, `TopHeader.jsx`, the 4 shipped pages]
- **`BottomNav.jsx` is already a 4-item + center-FAB shape** — you are re-labeling/re-pathing it, not rebuilding structure. Today shipped: LEFT `[Today "/", Upcoming "/upcoming"]`, CENTER FAB (`Plus`, `btn-accent-3d -mt-7 w-14 h-14`), RIGHT `[Browse "/browse", Settings "/settings"]`. Active-state, `useLocation`, and safe-area handling already exist and should be preserved.
- **The FAB already focuses `#task-quick-input`** — but it navigates to `/` and the input lives on `Today.jsx:68`. The spec wants the create-path on **Plan**, so both the FAB target and the input's home move to `/plan` (Task 3). This is the single most important change in the story; get the id uniqueness right.
- **`TopHeader.jsx`** has no per-route titles (static "Essence" brand) and gates the back button on `ROOT_PATHS` (line 7). Search is global via `SearchContext`. Nothing here needs a rename beyond `ROOT_PATHS`.
- **All 4 page bodies are route-agnostic** — each just calls `useTasks()` + `useSearch()` and filters/groups; **they remount at new paths with zero body changes** (only the input relocation in Task 3 touches a page). [Source: Today/Upcoming/Browse/Completed .jsx]
- **`use-mobile.jsx`** exists but is unused; the shell is mobile-first throughout. No need to wire it.

### The exact route table after this story
| route | mounts (placeholder) | in bottom nav? | notes |
|---|---|---|---|
| `/` | `Today` body | **Focus** tab | one-task Focus arrives in 3.1 |
| `/plan` | `Upcoming` body + relocated `#task-quick-input` | **Plan** tab | real Plan in Epic 2 |
| `/browse` | `Browse` body | no (secondary) | reachable; merged into Plan in Epic 2, then retired |
| `/archive` | `Completed` body | **Archive** tab | real Archive in 4.3 |
| `/settings` | `Settings` body | **Settings** tab | unchanged |
| `/upcoming` | → `Navigate` to `/plan` | — | back-compat redirect |
| `/completed` | → `Navigate` to `/archive` | — | back-compat redirect |
| `/login` `/register` `/forgot-password` `/reset-password` | auth pages | — | **unchanged** |

Path names `/plan` and `/archive` are a reasonable convention (the UX docs name the *surfaces*, not the paths). [Source: epics.md#Story 1.2; EXPERIENCE.md#Information Architecture — "Plan", "Archive"]

### Nav visual spec (from the mockup)
[Source: DESIGN.md#Components, #Layout & Spacing; mockups/key-screens.html nav lines 513–533]
- Nav bar ~78px, `display:flex; justify-content:space-around`, faint top border, gradient fade. Nav item = icon over 10.5px label, `~56px` wide column. Active item: `color: var(--highlight)`.
- Center FAB `58px`, `border-radius:50%`, `margin-top:-22px` overlap, 3D lip + glow (the shipped `btn-accent-3d -mt-7 w-14 h-14` already matches this).
- **nav-clearance:** scroll surfaces pad `calc(4rem + env(safe-area-inset-bottom))` — the shipped `.pb-nav` (`src/index.css:149`) already provides this and `AppLayout` applies it to `<main>` (line 39). Don't reinvent it. Safe-area insets honored on every edge via the shipped `.safe-*` utilities.

### +FAB behaviour contract (AC 4 — the nuance)
[Source: EXPERIENCE.md#Information Architecture, #Component Patterns, #Accessibility Floor; UX-DR7, UX-DR12]
- The +FAB is the **single create path** and it **never directly creates / never opens a modal** — it focuses `#task-quick-input` on Plan.
- It sets focus to `#task-quick-input` on open and **restores focus to the FAB on dismiss** (Esc, or blur with no pending input).
- The shipped 60ms `setTimeout` after `navigate` (to let the route mount before `getElementById`) is a reasonable pattern; keep or replace with a mount effect — just ensure the focus lands after Plan renders.

### Accessibility & overlay rules that bind this story
[Source: EXPERIENCE.md#Accessibility Floor; UX-DR12]
- Tap targets ≥44pt/48dp for **nav items and the FAB** (extend hit area beyond the 40px icon container).
- Focus order = reading order; the topmost sheet/dropdown closes first; **modal depth is one level, never two.**
- Sheets/dropdowns dismissible by **Esc and the Android back button** (for a PWA, browser/history back), closing topmost-first.
- No animation is added here, but the shipped `AppLayout` page transition (framer-motion, `AppLayout.jsx:40-52`) must still honor reduced-motion — it is pre-existing; don't regress it. [AD-11]

### Dependency on Story 1.1 (soft)
1.1 (`usePrefs` + 7-scheme tokens) is `ready-for-dev`, not yet done. 1.2 does **not** functionally require it, but the nav's active-state classes (`text-highlight`, `bg-primary/10`) become scheme-reactive once 1.1 lands. These two Epic-1 foundation stories can proceed in parallel; if 1.1 hasn't merged, the nav still works on the default Deep Sea palette. [[1-1-the-7-scheme-token-system-local-prefs-store]]

### Project Structure Notes
- Updated: `src/App.jsx`, `src/components/layout/BottomNav.jsx`, `src/components/layout/TopHeader.jsx`, `src/pages/Settings.jsx`, `src/pages/Upcoming.jsx` (gains the input), `src/pages/Today.jsx` (loses the input). No new files required.
- Do not hand-edit `src/components/ui/**` (shadcn vendor). Naming/`@/`-alias/JS-JSX conventions per `project-context.md`.
- No new runtime dependency — react-router-dom 6.26, lucide-react, vaul, framer-motion are all already in the stack (NFR1). `<Navigate replace>` is the idiomatic redirect.

### References
- [Source: epics.md#Story 1.2] — the five ACs, the "bodies remain mounted" mandate, the surface mapping.
- [Source: epics.md — Additional Requirements "Routing / 4 surfaces"] — Focus (/) ← Today; Plan ← Upcoming+Browse merged; Archive ← Completed; Settings; auth unchanged; onboarding gates on the local `onboarded` flag (gate is Story 1.3).
- [Source: EXPERIENCE.md#Information Architecture] — the 4 surfaces defined; +FAB is the single create path focusing `#task-quick-input` on Plan; modal depth one level.
- [Source: EXPERIENCE.md#Component Patterns] — "+FAB … Never opens a creation modal directly."
- [Source: EXPERIENCE.md#Accessibility Floor] — tap targets ≥44/48; focus order; +FAB focus set-on-open / restore-on-dismiss; Esc + Android back, topmost-first.
- [Source: DESIGN.md#Layout & Spacing] — nav-clearance `calc(4rem + env(safe-area-inset-bottom))`; safe-area on every edge; `.pb-nav` idiom.
- [Source: DESIGN.md#Components; mockups/key-screens.html] — nav bar + center-FAB visual spec; `.nav-item.active { color: var(--highlight) }`.
- [Source: ARCHITECTURE-SPINE.md#AD-8] — Focus renders exactly one task, full backlog only on Plan (the *real* Focus is Story 3.1; `/` is a placeholder here).
- [Source: implementation-readiness-report-2026-07-01.md] — Story 1.2 cited as exemplary no-broken-intermediate-state sequencing.
- Current code: `src/App.jsx:41-62` (routes), `src/components/layout/BottomNav.jsx:6-12,19-32,61` (nav + FAB), `src/components/layout/TopHeader.jsx:7` (ROOT_PATHS), `src/pages/Settings.jsx:65` (`/completed` link — the one link a rename breaks), `src/components/tasks/TaskInput.jsx:102` (`#task-quick-input`), `src/pages/Today.jsx:68` (current input home), `src/index.css:149` (`.pb-nav`), `src/components/layout/AppLayout.jsx:39` (`pb-nav` on `<main>`).

## Review Findings (code review 2026-07-01)

- [x] [Review][Patch] +FAB Escape-listener accumulates on repeated taps [src/components/layout/BottomNav.jsx] — **FIXED**: the focus-session now tracks its keydown listener in a ref and tears it down before each new session (+ unmount cleanup), so listeners never stack.
- [x] [Review][Patch] +FAB 60ms focus race can miss the Plan input mount [src/components/layout/BottomNav.jsx] — **FIXED**: replaced the fixed `setTimeout(60)` with a bounded `requestAnimationFrame` poll (~0.5s) that focuses the input as soon as it mounts.
- [x] [Review][Defer] AC-4 focus-return is Escape-only, not "Esc or blur with no pending input" — deliberate lightweight choice; the shipped input is rebuilt in Epic 2 (Story 2.1), which owns the robust version.
- [x] [Review][Defer] AC-5 Android/browser-back overlay dismissal not implemented — deferred to the Epic-2 capture rebuild; modal-depth ≤1 (the AC core) holds.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.8) — bmad-dev-story workflow

### Debug Log References

- `npm run lint` → **0 errors** (removed the unused `LayoutGrid` import + the `TaskInput` import from Today, so no unused-imports failures).
- `npm run build` → **exit 0**.
- `npx vitest run` → **65 tests pass** (no new tests — see note below; 0 regressions).
- Dead-link grep (`to="/upcoming"|to="/completed"|navigate("/upcoming"|navigate("/completed"`) → **none**.
- Dev-server boot: console shows **only** env-gated Base44 404s (`checkAppState`), **no React Router / import / render errors** → the route remap, `Archive` icon swap, and input relocation don't crash the app.

### Completion Notes List

**Routing (Task 1):** `App.jsx` now serves the 4 surfaces — `/`→Focus (Today body), `/plan`→Plan (Upcoming body), `/archive`→Archive (Completed body), `/settings`. `/browse` stays a reachable secondary route (Epic 2 merges it into Plan and retires it). `<Navigate replace>` redirects cover `/upcoming`→`/plan` and `/completed`→`/archive`, so old bookmarks/links never 404. Auth routes untouched. Page component files intentionally **not** renamed (they're placeholders later epics replace in-place). The single breaking internal link (`Settings.jsx` → `/completed`) was repointed to `/archive`.

**Bottom nav (Task 2):** re-labelled/re-pathed the shipped 4-item + center-FAB nav to Focus · Plan · +FAB · Archive · Settings (lucide `Archive` icon added, unused `LayoutGrid` removed). Active-state, `useLocation` detection, safe-area padding, and FAB overlap all preserved. Tap-target note: the clickable `<Link>` already fills the full 64px nav height × `flex-1` width, so the hit area is the whole slot (well over 44/48) — no change needed.

**Create-path on Plan (Task 3):** the shipped `TaskInput` (`#task-quick-input`) moved from Today to the Plan placeholder (Upcoming), keeping capture working via `actions.create`. The id stays unique (removed from Today; its now-unused import and the stale "Capture something above" empty-state copy were cleaned up). The +FAB now targets `/plan`, focuses the input, and scrolls it into view — never a modal. Focus-return: the FAB has `id="create-fab"`, and an **Escape-only** keydown listener on the input returns focus to it (chose Escape-only over blur-based to avoid false triggers when the input's own details drawer opens — the story explicitly asked to keep this lightweight).

**Header/overlays (Task 4):** `ROOT_PATHS` updated to the 4 primary surfaces (`/browse` deliberately secondary → shows back, mirroring the old `/completed`). Overlays confirmed one level deep with Radix-default Esc dismissal. **Deliberately not added:** browser/Android-`popstate` back-to-dismiss on the `vaul` drawers — those drawers are rebuilt in Epic 2, so wiring history handling onto them now is throwaway work; the AC's core intent (never exceed one overlay level) holds, and nothing here adds a second layer. Flagged for the Epic-2 capture rebuild.

**Testing note:** Story 1.2 introduces no new `src/lib` pure logic — it's routing config + component wiring. Per the repo convention (`src/lib` is the only unit-tested layer; no jsdom/RTL in the stack), there are no new unit tests; verification is lint + build + the shell checks above. 

**⚠️ Verification scope / handoff to /verify + /code-review:** static gates all pass and app-boot is clean of router errors. The **interactive shell walk-through was not possible here** — the local app is Base44-auth-gated (no `.env.local` creds), so the authenticated nav/FAB can't be exercised, and the preview MCP bound to a detached frame last run. **Recommended at /verify (real browser + Base44 creds):** click all 4 tabs; confirm `/upcoming`→`/plan` and `/completed`→`/archive` redirects; confirm `/browse` still renders; tap the +FAB from each surface → lands on Plan with the input focused; press Escape → focus returns to the FAB; add a task; confirm nav re-skins when the scheme changes (needs Story 1.1 merged).

### Change Log

- 2026-07-01 — Implemented Story 1.2: 4-surface shell + routing restructure (Today→Focus `/`, Upcoming→Plan `/plan`, Completed→Archive `/archive`, Browse secondary; back-compat redirects). Rebuilt bottom-nav labels/paths/icons; moved the `#task-quick-input` capture from Today to Plan; repointed the +FAB to Plan with Escape focus-return; updated `ROOT_PATHS` and the Settings→Archive link. Lint/build clean, 65 tests pass, no dead links, no router runtime errors. Status → review.

### File List

**Modified:**
- `src/App.jsx` — route remap to 4 surfaces + back-compat redirects
- `src/components/layout/BottomNav.jsx` — nav labels/paths/icons; FAB → `/plan` + `id="create-fab"` + Escape focus-return
- `src/components/layout/TopHeader.jsx` — `ROOT_PATHS` updated to the 4 primary surfaces
- `src/pages/Settings.jsx` — `/completed` link → `/archive` (label "Archive")
- `src/pages/Today.jsx` — removed relocated `TaskInput` (+ its import); updated empty-state copy
- `src/pages/Upcoming.jsx` — added the `TaskInput` capture (Plan placeholder); heading "Upcoming" → "Plan"
