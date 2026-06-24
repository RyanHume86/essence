---
title: 'Win-moment loop (frontend prototype)'
type: 'feature'
created: '2026-06-24'
status: 'done'
baseline_commit: 'f4afa0116a63ea8a6f4b6211b87b36b9d48c7d2b'
context: ['_bmad-output/project-context.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Completing a task in Essence is a bare checkbox flip — no felt sense of "I achieved something." The whole validated product thesis hinges on one ~30-second "win-moment," but it doesn't exist, so the central bet is untested.

**Approach:** A frontend-only win-moment: when a task is completed, a warm, restrained character reacts (pleased, not hyped) and a daily progress element visibly grows **in real time** on the tick. No backend or Base44 schema change; daily progress lives in `localStorage`.

## Boundaries & Constraints

**Always:** Pleased, not hyped — a small smile/glow + one short true line, self-dismissing (~1.5s), never a blocking modal. Respect `useReducedMotion` (show the state change without motion). Reuse existing design tokens (no hardcoded hex). Fire only on a genuine `not-completed → completed` transition. All task writes still go through `useTasks`.

**Ask First:** Adding any Base44 entity/field. Introducing the "Care"/goal data model. Persisting the companion beyond a per-day client-side counter.

**Never:** Streaks, shame, penalties, or "what's left" inside the win moment. Confetti/loud hype. Create-your-own-character (deferred). Blocking modals. New npm dependencies (use existing `framer-motion`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Complete task | incomplete task → toggle | character reacts + today's count +1 + progress element grows, optimistically (no network wait) | N/A |
| Un-complete task | completed → toggle off | no celebration; progress not decremented | N/A |
| Complete recurring task | recurring task completed (rolls forward) | win-moment fires once (it is a completion) | N/A |
| New calendar day | stored date ≠ today | today's progress reads 0 | N/A |
| Reduced motion | `prefers-reduced-motion` | reaction shown via static state change, no animation | N/A |

</frozen-after-approval>

## Code Map

- `src/hooks/useTasks.js` -- shared task hook; `toggleM.onMutate` is where a completion is first known optimistically — emit the win event here.
- `src/components/tasks/TaskItem.jsx` -- existing checkbox/completion UI and framer-motion patterns to mirror.
- `src/pages/Today.jsx` -- primary surface; mount the companion at the top.
- `src/index.css` / `tailwind.config.js` -- design tokens (`surface-raised`, `text-highlight`, success/teal scales, `useReducedMotion`).

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/winMoment.js` -- NEW: per-day progress store in `localStorage` (date-keyed via date-fns) + a tiny module-level event emitter. Exports `recordCompletion()` (increments today, returns new count, emits), `getTodayCount()`, `subscribe(fn)`.
- [x] `src/components/companion/Companion.jsx` -- NEW: inline-SVG character + a growth element (ring/plant that fills proportionally to today's count) + one short message; subscribes to win events; animates via `framer-motion`, gated on `useReducedMotion`.
- [x] `src/hooks/useTasks.js` -- EDIT: in `toggleM.onMutate`, when `!task.completed` (a real completion), call `recordCompletion()`. Do not alter the mutation/rollback contract.
- [x] `src/pages/Today.jsx` -- EDIT: render `<Companion />` at the top of the view.
- [x] `src/lib/winMoment.test.js` -- NEW: unit-test increment, subscribe/emit, and the new-day reset (inject the date).

**Acceptance Criteria:**
- Given an incomplete task on Today, when I tap its checkbox, then the companion reacts and the progress element advances within the same interaction (optimistic, no network wait).
- Given `prefers-reduced-motion`, when I complete a task, then the change is shown without animated motion.
- Given it is a new calendar day, when Today loads, then the progress element shows 0.
- Given I un-complete a task, when I toggle it off, then no celebration fires.
- Given the win moment is shown, then it never displays remaining work and never uses streaks or confetti.

## Design Notes

Restraint is the spec, not a nicety. The reaction is a brief scale/glow + one short line that fades — never a modal, never blocks the next tap. The growth element fills proportionally (e.g. ring reaches "full" around ~8 completions, but the count keeps counting). Decoupling: `winMoment.js` is the single source — `useTasks` emits, `Companion` subscribes — keeping the hook UI-free and the component backend-free. `localStorage` key shape: `essence_win_<YYYY-MM-DD> → integer`; a stale date reads 0.

## Verification

**Commands:**
- `npx vitest run src/lib/winMoment.test.js` -- expected: pass
- `npx eslint src/lib/winMoment.js src/components/companion/Companion.jsx src/hooks/useTasks.js src/pages/Today.jsx` -- expected: clean
- `npx vite build` -- expected: succeeds

**Manual checks:**
- `npm run dev` → on Today, complete a task → companion reacts and the ring grows instantly; OS reduced-motion on → state change with no animation; reload next day (or clear the key) → progress shows 0.

## Suggested Review Order

**Data flow — the spine (start here)**

- Optimistic emit on a real completion; the whole feature hangs off this one line.
  [`useTasks.js:101`](../../src/hooks/useTasks.js#L101)
- Rollback compensation — undoes the count when a save fails (review fix).
  [`useTasks.js:110`](../../src/hooks/useTasks.js#L110)

**The win-moment store**

- The per-day counter + emit; the public contract.
  [`winMoment.js:67`](../../src/lib/winMoment.js#L67)
- Undo path that compensates a rolled-back completion.
  [`winMoment.js:81`](../../src/lib/winMoment.js#L81)
- Best-effort persist — never throws (private mode / quota) (review fix).
  [`winMoment.js:58`](../../src/lib/winMoment.js#L58)

**The companion UI**

- Subscribe + react: count, one line, fade — reduced-motion aware.
  [`Companion.jsx:38`](../../src/components/companion/Companion.jsx#L38)
- Inline-SVG character + growth ring (fills to RING_TARGET).
  [`Companion.jsx:82`](../../src/components/companion/Companion.jsx#L82)

**Placement & tests (peripheral)**

- Mounted once at the top of Today.
  [`Today.jsx:65`](../../src/pages/Today.jsx#L65)
- Store unit tests (increment, undo/floor, subscribe, new-day reset).
  [`winMoment.test.js:1`](../../src/lib/winMoment.test.js#L1)
