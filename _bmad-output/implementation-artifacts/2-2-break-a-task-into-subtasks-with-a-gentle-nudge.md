# Story 2.2: Break a task into subtasks with a gentle nudge

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a builder,
I want to decompose a task into subtasks when I capture it or later,
So that big things feel doable.

## Acceptance Criteria

1. **One-level subtasks, add at capture or later, editable anytime.** Given a task, when I add subtasks, then they persist as **one-level-deep** subtasks in the shipped `Task.subtasks` array (**no schema change**), can be added **at capture** (the `#task-quick-input` flow) or **later** (the existing expand → `SubtaskTree`), and stay editable/deletable anytime. *(FR6)*

2. **A single passive decompose nudge at capture.** Given the capture input with no subtasks, when it renders, then exactly one passive affordance — placeholder / hint text — invites decomposition. *(FR7)*

3. **The nudge never pressures.** Given the decompose nudge, when I ignore it, then it never blocks save, never becomes a recurring prompt, never becomes a warning or an "incomplete: no subtasks" state, and never appears on the Focus surface. Subtasks stay optional. *(FR7)*

## Tasks / Subtasks

- [ ] **Task 1 — Capture-time subtasks in `TaskInput` (AC: 1, 2, 3)**
  - [ ] In `src/components/tasks/TaskInput.jsx`, add a `subtasks` state (`useState([])`) and render the **existing** `SubtaskTree` inside the details disclosure (reuse, don't reinvent): `<SubtaskTree subtasks={subtasks} onChange={setSubtasks} />`. SubtaskTree already returns the full updated array via `onChange` — hold it in local state until submit.
  - [ ] Include `subtasks` in the `onAdd({ … })` payload; reset `setSubtasks([])` in the post-submit reset block (alongside `setPriority(PRIORITY_DEFAULT)` etc.).
  - [ ] **The decompose nudge (AC-2/3) — capture-scoped, via a prop:** the nudge is the SubtaskTree add-input's placeholder, but it must appear **only at capture**, never on Focus. Pass it in from `TaskInput`: `<SubtaskTree subtasks={subtasks} onChange={setSubtasks} placeholder="Break it into steps? (optional)" />`. It must be **one** affordance, non-blocking (title-only save still works), not a warning, not recurring. Tone per UX-DR13: *invite, never instruct or pressure*.
  - [ ] ⚠️ **Do not bake the nudge into SubtaskTree's default** — SubtaskTree also renders in `TaskItem`'s expanded row (`TaskItem.jsx:186`), and `TaskItem` renders on the Focus stand-in `Today.jsx`. A hardcoded warm placeholder would surface the nudge **on Focus** (violates AC-3). The prop keeps the warm nudge on capture; the later-edit tree keeps the neutral `"Add subtask…"` default (Task 3).
- [ ] **Task 2 — Persist capture-time subtasks through `useTasks` (AC: 1)**
  - [ ] In `src/hooks/useTasks.js` `buildNew(v)`, change the hardcoded `subtasks: []` to `subtasks: v.subtasks ?? []`. Keep it last in the object; keep the optimistic pattern intact (the `createM` optimistic row already spreads `buildNew(v)`, so it inherits subtasks automatically).
  - [ ] All writes stay inside `useTasks` (AD-1/AD-2) — no direct `base44.entities.Task.*` in components.
- [ ] **Task 3 — Enforce one-level-deep subtasks (AC: 1) — see the decision note**
  - [ ] `src/components/tasks/SubtaskTree.jsx` currently renders **two** levels (top-level `canNest=true` → inline "add child"; nested rows `canNest=false`). FR6 + AC-1 + the Epic 3 reveal model (flat, two-at-a-time — FR13/FR14) want **one** level. Restrict to one level: remove the nested add-child affordance and nested rendering (`onAddChild`, `canNest`, the `subtask.subtasks` map + `SubtaskRow` recursion). A task then owns a **flat** list of subtasks.
  - [ ] Add a `placeholder` prop to `SubtaskTree` for the add-input, defaulting to the current neutral text: `placeholder = "Add subtask…"`. `TaskItem`'s later-edit usage keeps the default (neutral, so no nudge on Focus); only `TaskInput` overrides it with the capture nudge (Task 1). This is the mechanism that keeps AC-3 satisfied.
  - [ ] Keep the **schema unchanged** (AC-1 "no schema change"): `Task.jsonc` still declares the nested `subtasks` field; it simply goes unused (like other declared-but-unused drift). Do not write nested children going forward.
  - [ ] Read-guard any pre-existing nested data so it doesn't crash (a legacy row could hold `subtask.subtasks`); rendering a flat list ignores nested children harmlessly. Confirm no reader assumes nesting. ⚠️ Owner decision — see Dev Notes ("one level" removes the shipped 2-level nesting UI).
- [ ] **Task 4 — Keep the later-edit path working (AC: 1)**
  - [ ] Verify the existing `TaskItem` expand → `SubtaskTree` → `onUpdate(task, { subtasks })` path still works after the one-level change (add/toggle/delete a subtask on an existing task, persisted via `useTasks.patchM`). This path already ships; the only change is SubtaskTree being one-level.
  - [ ] `TaskEditDrawer` does not manage subtasks today (subtasks are edited inline in the expanded row) — leave that split as-is; do not add subtasks to the edit drawer (out of scope, avoids two competing editors).
- [ ] **Task 5 — Verify (AC: 1–3)**
  - [ ] **No Base44 schema change → no Nidus gate and no publish needed** (contrast Story 2.1). Confirm `Task.jsonc` is untouched.
  - [ ] Capture on Plan: type a title, add 1–2 subtasks in the details, submit → task created via `useTasks` with its subtasks, appears in the Plan list with the `{n} completed / {total}` progress pill; expand shows the subtasks. Title-only capture (ignore the nudge) still saves cleanly.
  - [ ] Later-edit: expand an existing task, add/toggle/delete a subtask → persists (optimistic, rollback on failure via the existing toast).
  - [ ] The nudge is a single passive placeholder — no warning, no recurring prompt, not on Focus.
  - [ ] `npm run lint` / `npm run build` clean; `npx vitest run` green. If a pure `src/lib` helper is extracted (see Testing), colocate a `*.test.js` (NFR12).
  - [ ] Grep: no direct `base44.entities.Task.*` in components; no hardcoded hex in new UI.

## Dev Notes

### ✅ No schema change, no Nidus gate — this story is a "code-only" one
Unlike Story 2.1, AC-1 explicitly says **no schema change** — `Task.subtasks` already ships (declared in `base44/entities/Task.jsonc`). So there is **no Nidus round-trip and no GitHub→Base44 publish step** required for 2.2. The work is entirely client-side (capture UI + `buildNew` + SubtaskTree). [Source: epics.md Story 2.2 AC-1; project-context.md "Nidus" caution applies only to schema edits]

### 🔑 Decision — restrict to one level (removes the shipped 2-level nesting)
The shipped `SubtaskTree` supports **two** levels (a subtask can have its own sub-subtasks via the inline "+" / `canNest`). FR6 and AC-1 say **one level deep**, and the Epic 3 Focus reveal model — subtasks revealed **two at a time** from a flat list, **exactly one active at a time** (FR13/FR14) — assumes a **flat** subtask list. Nested sub-subtasks have no place in that model. Recommendation: **flatten to one level now** (remove `onAddChild`/`canNest`/nested recursion in `SubtaskTree`), keep the schema's nested field declared-but-unused (AC-1 "no schema change"). This mirrors the Story 2.1 pattern of retiring shipped drift while leaving the schema alone. ⚠️ This removes the shipped ability to nest sub-subtasks — **confirm the owner is fine losing it** (it's spec-mandated by FR6, but it is a visible UI removal, like the 2.1 "pin-to-Today" star). Any pre-existing nested data should degrade gracefully (rendered flat / nested children ignored), not crash. [Source: epics.md FR6, Story 2.2 AC-1; EXPERIENCE.md#Component Patterns "Two-subtasks-at-a-time reveal"; FR13/FR14]

### 🔑 Decision — the decompose nudge is one passive placeholder, nothing more
[Source: EXPERIENCE.md#Component Patterns "Decompose nudge"; UX-DR13] The nudge (FR7) is a **single passive affordance — placeholder / hint text** inviting subtasks. Hard constraints (all three are AC-3): **never** blocks save, **never** a recurring prompt, **never** a warning or "incomplete: no subtasks" state, **never** on Focus. Recommended implementation: `SubtaskTree` takes a `placeholder` prop (default `"Add subtask…"`); **only the capture usage in `TaskInput` passes the warm nudge** (e.g. `"Break it into steps? (optional)"`). **Critical — do not hardcode the nudge into SubtaskTree:** it also renders in `TaskItem`'s expanded row (`TaskItem.jsx:186`), and `TaskItem` renders on the Focus stand-in `Today.jsx`, so a baked-in warm placeholder would put the nudge **on Focus** (violates AC-3 "never on the Focus surface"). The prop keeps capture warm and later-edit neutral. Tone per UX-DR13: warm, brief, plainspoken, **invites, never instructs or pressures**. Keep it to ONE affordance — no banner, count, or coaching line. Confirm the exact microcopy with the owner if it matters.

### Current subtask implementation (what you're changing — precise)
[Source: `src/components/tasks/SubtaskTree.jsx`, `src/components/tasks/TaskItem.jsx`, `src/hooks/useTasks.js`, `base44/entities/Task.jsonc`]
- **Schema** (`Task.jsonc`): `subtasks` is an array of `{ id, title, completed, subtasks: [ { id, title, completed } ] }` — **two levels declared**. Leave it untouched (AC-1).
- **`SubtaskTree.jsx`** (the reusable editor): manages an immutable subtask array via `onChange(updatedArray)`. `addTopLevel` seeds `{ id: crypto.randomUUID(), title, completed: false, subtasks: [] }`. `SubtaskRow` renders a checkbox + title + hover actions; top-level rows have an inline "add child" (`canNest`), nested rows don't. **This is the one-level change site (Task 3).**
- **`TaskItem.jsx`**: expanded section renders `<SubtaskTree subtasks={task.subtasks || []} onChange={handleSubtasksChange} />`; `handleSubtasksChange` → `onUpdate(task, { subtasks: newSubtasks })` → `useTasks.patchM` (optimistic). `subtaskCount`/`completedSubtasks` drive the `{done}/{total}` pill (`TaskItem.jsx:47-48, ~128`). This later-edit path already works — just verify it survives the one-level change.
- **`TaskInput.jsx`** (capture, `#task-quick-input`, mounted on Plan via `src/pages/Upcoming.jsx`): currently sends `{ title, category, due_date, comment, priority, recurrence, occurrence_count }` — **no subtasks**. Add `subtasks` here (Task 1). Details disclosure already exists (`showDetails`); put the SubtaskTree + nudge inside it, consistent with the priority/recurrence/note controls.
- **`useTasks.buildNew`**: seeds `subtasks: []` (hardcoded). Change to `subtasks: v.subtasks ?? []` (Task 2). Everything else (optimistic create, rollback toast) stays.

### Previous story intelligence (from Story 2.1 — just completed)
- **Base44 deploy flow** (only relevant if a schema changes — it does NOT here): schema `jsonc` is a local mirror; changes go live via **commit → GitHub → Base44 auto-sync → owner clicks Publish**, and integer/new-field writes 422 until published. 2.2 has **no** schema change, so none of this applies — but do not add one.
- **`useTasks` funnel + optimistic pattern**: patch computed in both `onMutate` and `mutationFn`; rollback to `ctx.previous`; invalidate + debounced calendar auto-sync on settle. Preserve it.
- **Reuse over reinvention**: 2.1 added a shared `PriorityPicker` used by capture + edit. Do the same here — reuse `SubtaskTree` for capture rather than writing a second subtask editor.
- **`src/lib` is the Vitest-only safety net** (ESLint/typecheck don't cover it). If you extract pure subtask logic (e.g. a one-level normalizer/flattener), colocate a `*.test.js`.
- **Pre-existing dev warning**: framer-motion `popLayout` passes a ref to `TaskItem` → a React "function components cannot be given refs" dev-only warning. `SubtaskTree` also uses `AnimatePresence`; don't be alarmed by it and don't introduce new ref-to-function-component patterns. Not this story's job to fix.
- **Verification is auth-gated**: the live app requires an authenticated Base44 session (Google login) to reach Plan; a headless preview shows only the login screen. Manual capture verification needs the owner logged in (same as 2.1) — but there is **no** publish step to wait on this time.
- **Calm/token discipline**: reuse the pill/`subtask-card` idiom and CSS tokens (`bg-primary/10 text-highlight border-primary/30`, `subtask-card`); **no hardcoded hex**; respect `useReducedMotion` for any new animation (SubtaskTree already uses `AnimatePresence`).

### Not in this story
- **Two-at-a-time subtask reveal on Focus + tier-1 reaction (FR13/FR14)** → Epic 3 (Stories 3.2/3.5). 2.2 is capture/edit on Plan only; do not build the Focus reveal.
- **Due-date editing + edit/delete flow for tasks (FR9/FR10)** → Story 2.3. (Subtask add/edit/delete is in *this* story per FR6; whole-task edit/delete + due dates are 2.3.)
- **Ordering + drag rearrange (FR12)** → Story 2.4.
- **Live-dataset migration (`normalizePriority` persistence, drift strip)** → Story 2.5. If you touch reads of legacy nested subtasks, guard defensively but do not run a data migration here.

### Testing
- No jsdom harness for components (TaskInput/SubtaskTree) — verify via lint/build + manual capture on Plan (owner logged in). No Nidus round-trip (no schema change).
- If you extract a pure `src/lib` helper (e.g. `oneLevelSubtasks(arr)` that strips/ignores nested children, or a capture-subtask shape builder), colocate `*.test.js` per NFR12 — the only automated safety net for `src/lib`.

### Project Structure Notes
- Updated: `src/components/tasks/TaskInput.jsx`, `src/components/tasks/SubtaskTree.jsx`, `src/hooks/useTasks.js`. Verify-only: `src/components/tasks/TaskItem.jsx` (later-edit path). Possibly new: `src/lib/subtasks.js` (+ test) if a pure helper is extracted.
- `base44/entities/Task.jsonc` — **do not modify** (AC-1 "no schema change").
- `@/` alias, JS/JSX, no hardcoded hex, all task writes through `useTasks`. [Source: project-context.md]

### References
- [Source: epics.md#Story 2.2] — the three ACs; one-level-deep, no schema change, capture-or-later, passive nudge.
- [Source: epics.md#FR6/FR7] — one-level subtasks add/edit anytime; passive decompose nudge at capture.
- [Source: EXPERIENCE.md#Component Patterns "Decompose nudge"] — single passive affordance; never recurring/warning/blocking/on-Focus.
- [Source: EXPERIENCE.md#Component Patterns "Two-subtasks-at-a-time reveal", FR13/FR14] — the Epic 3 flat-list reveal model that motivates one-level subtasks.
- [Source: UX-DR13] — voice/tone: invite, never instruct or pressure; warm, brief, plainspoken.
- [Source: ARCHITECTURE-SPINE.md#AD-1/AD-2] — `useTasks` is the only backend caller; single-funnel optimistic mutations.
- [Source: ARCHITECTURE-SPINE.md#AD-4] — new pure logic (incl. subtask-reveal selection) lands in `src/lib`, Vitest-tested.
- [Source: project-context.md] — useTasks funnel; no direct `base44.entities.Task.*` in components; `src/lib` Vitest-only; no hardcoded hex; Nidus caution (schema only).
- Current code: `src/components/tasks/SubtaskTree.jsx`, `src/components/tasks/TaskInput.jsx:31-75` (capture state/submit/reset), `src/components/tasks/TaskItem.jsx:36-51,~128,~196` (subtask pill + expanded SubtaskTree), `src/hooks/useTasks.js` `buildNew` (`subtasks: []`), `base44/entities/Task.jsonc` (subtasks schema — do not touch).

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
