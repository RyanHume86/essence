---
baseline_commit: 2f9ea6febfb099ec10e1d970ead2545647ef3a64
---

# Story 2.1: Capture a task with priority on the Plan surface

Status: review — all ACs verified live (Nidus round-trip green after schema publish; see Completion Notes)

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a builder,
I want to dump a task and mark how important it is on a neutral planning surface,
So that I can get it out of my head without the list judging me.

## Acceptance Criteria

1. **Neutral Plan surface.** Given the Plan surface, when it renders, then the full task list may be visible and the creature sits passively with no reactions. *(FR8)*

2. **Capture via the +FAB quick-input.** Given the +FAB quick-input (`#task-quick-input`), when I enter a title and submit, then a task is created via `useTasks` (optimistic) and appears in the Plan list. *(FR4)*

3. **Integer priority 1–5.** Given a task, when I set its priority, then it stores an integer priority 1–5 (5 = most important). *(FR5)*

4. **Schema migration + Nidus gate.** Given the shipped Task schema, when it is migrated, then `priority` is declared as an integer (converting the shipped `priority:"normal"`), the undeclared drift fields `due_time` and `today` are dropped, and the change is round-trip-verified — **create → read back through the SDK → confirm the field persisted, before wiring any UI** (the Nidus gate). *(NFR12, AD-5)*

5. **Persist through the funnel, privately.** Task data persists in Base44 as private, single-user data; **no component calls `base44.entities.Task.*` directly** — all writes go through `useTasks`. *(NFR2, NFR10, AD-1, AD-2)*

6. **Honest optimistic rollback.** Given a save failure, when the optimistic create fails, then it rolls back honestly with the existing error toast. *(NFR6)*

## Tasks / Subtasks

- [x] **Task 1 — Migrate the Task schema + Nidus round-trip gate FIRST (AC: 4) — do this before any UI**
  - [x] In `base44/entities/Task.jsonc`, add `priority` as an integer: `{ "type": "integer", "minimum": 1, "maximum": 5, "default": 3, … }`. `due_time`/`today` were never declared (undeclared drift), so nothing to remove from the schema.
  - [x] ✅ **Nidus gate GREEN** (after schema pushed to GitHub + app published): live authenticated `Task.create({priority:4})` → `POST` **200** → read-back returns `priority: 4` as an **integer** (`typeof === "number"`). Schema migration confirmed persisted on the live backend.
- [x] **Task 2 — Update the create path in `useTasks` (AC: 3, 5, 6)**
  - [x] `buildNew(v)`: `priority: normalizePriority(v.priority)` (integer, mid default 3; legacy-safe). Removed the `due_time` and `today` keys.
  - [x] Optimistic pattern intact (patch in both `onMutate` + `mutationFn`; rollback to `ctx.previous`; invalidate + debounced calendar auto-sync on settle). Existing error toast handles AC 6.
  - [x] All writes stay inside `useTasks` (AD-1/AD-2) — grep confirms no direct `base44.entities.Task.*` in components/pages.
- [x] **Task 3 — Priority 1–5 capture control on Plan (AC: 2, 3)**
  - [x] `TaskInput.jsx`: replaced the binary toggle with a **1–5 `PriorityPicker`** (new shared component; integer state, default 3, `radiogroup` a11y mirroring `SchemePicker`).
  - [x] Removed `due_time` from the submit payload and removed the time-of-day input + `dueTime` state from capture (date-only per FR9). No `today` sent.
  - [x] +FAB already focuses `#task-quick-input` on Plan (BottomNav) — no FAB change needed.
- [x] **Task 4 — Fix every priority read/write site so nothing breaks (AC: 3) — the blast radius**
  - [x] `TaskGroup.jsx` sort → `byPriorityDesc` (legacy-safe numeric descending, 5 first). Canonical total ordering remains Story 2.4.
  - [x] `TaskItem.jsx` high badge → `isElevatedPriority(task.priority)` (4–5 band); hidden on Focus per SPEC.
  - [x] `TaskEditDrawer.jsx` — priority state/seed/patch converted to the 1–5 model (seed via `normalizePriority`); dropped `due_time` from seed + patch, and removed the now-dead time-of-day input UI (date-only consistency).
  - [x] `TaskInput.jsx` summary — integer priority (`isElevatedPriority` → "High"), date-only.
- [x] **Task 5 — Drop the `today` drift feature (AC: 4) — see scope note**
  - [x] Removed the `today` writes: `todayM` mutation + `toggleToday` action, `today:false` in `deferM`, `today` key in `buildNew`, and the `onToggleToday` star in `TaskItem.jsx` (+ its `TaskGroup` prop).
  - [x] Dropped the `today` read clause in `taskUtils.inToday` and the `|| t.today` in `Today.jsx` — both degrade to `overdue || dueToday` (correct for the derived model; Epic 3 rebuilds Focus).
  - [x] ⚠️ This removes the shipped "pin-to-Today" star — **intended** per AD-3/AD-8 (Ryan confirmed via the validation pass). Flagging once more for visibility in review.
- [x] **Task 6 — Verify (AC: 1–6)**
  - [x] ✅ Nidus round-trip green (see Task 1) — integer 4 created + read back.
  - [x] ✅ Manual Plan capture walkthrough (live, logged in): captured "buy milk ui" via `#task-quick-input` at priority **5** → created through `useTasks`, persisted as integer 5, rendered in the Plan "No due date" group **sorted above** a priority-4 task, with the elevated-priority **"High"** badge. Test tasks cleaned up afterward.
  - [x] No component/page imports/calls `base44.entities.Task.*` directly (grep clean).
  - [x] `npm run lint` clean; `npm run build` clean (exit 0; Vite `logLevel:error` suppresses the summary); `npx vitest run` green (**82 passed**, incl. 10 new `priority.test.js`); typecheck unchanged (93 pre-existing, 0 new). Added `src/lib/priority.js` + colocated Vitest per NFR12.
  - [x] Grep confirms **zero** remaining `priority === "high"`, `"normal"`, or `task.today`/`t.today` in production code (only the intentional legacy-mapping tests/comments in `priority.*`).
  - [x] Grep confirms **zero** `due_time` **writes** — remaining `due_time` tokens are allowed read sites only (`taskUtils.isOverdue`, `DueDateChip`, dormant calendar `syncTasksToCalendar`, which degrades to an all-day event).

## Dev Notes

### 🚨 Blocker to surface before dev — the Nidus gate needs live Base44
Every schema story in Epic 2 (2.1, 2.4, 2.5) has a **Nidus round-trip gate** (create → read back through the SDK → confirm the field persisted). That gate **requires a working Base44 connection** (`VITE_BASE44_APP_ID` / `VITE_BASE44_APP_BASE_URL` in `.env.local`). This environment has **no credentials** — the app has been auth-gated (404s) all through Epic 1 verification. **Without creds, the dev can write the schema + code but CANNOT execute the Nidus verification** — which is the entire point of the gate (it catches Base44 silently dropping a new field). Do not mark AC-4 "done" on a code-only basis; the round-trip must actually run against Base44. [Source: project-context.md "Nidus" failure; NFR12; AD-5]

### ✅ Drop `due_time` and `today` — do NOT "keep/formalize" them
An automated blast-radius scan may *suggest* keeping `due_time` (as a string) and `today` (as a boolean) and formalizing them in the schema. **That contradicts the spec — reject it.** FR9 + the SPEC non-goal make due dates **date-only** ("time-of-day is out of scope"); AD-5 and this story's AC-4 explicitly **drop** `due_time` and `today`. The `today` flag is the shipped manual "pin to Today" model, which AD-3/AD-8 replace with **derived** order (top-of-effective-order is "next"), built in Story 2.4 / Epic 3. So: declare `priority` only; strip `due_time` and `today` from the schema, the create shape, the capture/edit UI, and the read sites. [Source: FR9; SPEC#Non-goals "Time-of-day"; epics.md#AD-5; epics.md Story 2.1 AC]

### 🔑 Decision — the priority 1–5 control (UX gap)
The UX docs specify priority is **integer 1–5, 5 = most important**, set during planning, **hidden on Focus**, and the first sort key — but they **do not specify the input control**. [Source: EXPERIENCE.md#Information Architecture ordering rule; UJ-2] Recommended (matches the shipped pill-chip idiom, `active = bg-primary/10 text-highlight border-primary/30`): a compact **row of five segmented chips `1 2 3 4 5`** (or a labelled selector) in the capture bar's details area, default **3**, accessible as a `radiogroup` (reuse the pattern from Story 1.4's `SchemePicker`). On Plan, show the chosen level (a small number/indicator chip); on **Focus it is hidden** (SPEC assumption, confirmed by Ryan). Confirm the control style with the owner if it matters aesthetically. Keep it calm — priority is a quiet planning aid, not an alarm.

### Priority conversion (this story vs the data migration 2.5)
- **This story (2.1)** declares the integer field and makes the *code* produce/read integers (new captures default **3**). Legacy rows still hold `"normal"`/`"high"` strings until Story **2.5** migrates the live dataset (`"normal" → 3`; map `"high"` → 4 or 5 — a 2.5 decision). Guard reads defensively (`priority ?? 3`, numeric compares) so a not-yet-migrated string row doesn't crash the UI before 2.5 runs. [Source: epics.md Story 2.5 — "map to an integer priority (default 3 / mid)"]

### Current data layer (what you're changing — precise)
[Source: `src/hooks/useTasks.js`, `base44/entities/Task.jsonc`, blast-radius scan]
- **Schema** (`Task.jsonc`) declares: title, completed, category, due_date, comment, subtasks (2-level), recurrence, occurrence_count. It does **not** declare priority/due_time/today (confirmed) — they are undeclared drift the code writes today.
- **`useTasks.js` is the single funnel** (AD-1/AD-2): cache key `["tasks"]`; `list("-created_date")`; `useOptimisticMutation` helper (patch in `onMutate` + `mutationFn`, rollback to `ctx.previous`, invalidate + `scheduleAutoSync()` on settle). Mutations: `createM` (buildNew), `toggleM` (+ recurrence via `completeRecurringTask`), `patchM`, `deferM` (writes `today:false`), `todayM` (toggles `today`), `clearCompletedM` (delete-based — retired later in Epic 4). Keep every optimistic/rollback path intact.
- **Capture** (`TaskInput.jsx`) currently sends `{ title, category, due_date, due_time, comment, priority:"normal"|"high", recurrence, occurrence_count }`.
- **Priority blast-radius (10 sites, string→int):** `useTasks.buildNew` (default), `TaskInput` (state/submit/reset/summary/control), `TaskEditDrawer` (state/seed/patch/control), `TaskItem` (badge), `TaskGroup` (sort). **All assume the string `"high"`/`"normal"` — every one must move to integer or priority silently stops working.**
- **`due_time` — drop the *writes*, leave the *reads* (they tolerate absence):**
  - **Writes to remove (this story):** `useTasks.buildNew` (line 66), `TaskInput` submit (line 60) + the capture time-of-day input, `TaskEditDrawer` seed (line 37) + patch (line 70). After these, new/edited tasks carry no `due_time`.
  - **Reads to leave in place (no change needed — they degrade to date-only when the field is absent):** `taskUtils.isOverdue` (lines 10–12, same-day time check → just returns date-only overdue), `TaskItem` prop pass (`:126`) → `DueDateChip` (`:12–20`, drops the time suffix), and the dormant **Google Calendar sync** `base44/functions/syncTasksToCalendar/entry.ts:22–34` (the `if (task.due_time)` branch simply falls through to an **all-day** event — which is exactly right for the date-only model, FR9). Do **not** rip these out; a full read-side simplification is unnecessary and out of scope. This is why Task 6's grep targets zero due_time **writes**, not zero tokens.
- **`today` sites (drop the feature):** `useTasks` (buildNew/deferM/todayM), `TaskItem` star, `taskUtils.inToday`, `Today.jsx` doneToday filter — see Task 5.

### Not in this story
- **Subtasks at capture + the decompose nudge (FR6/FR7)** → Story 2.2. `buildNew` already seeds `subtasks: []`; leave it. No decompose UI here.
- **Date-only due-date editing + edit/delete (FR9/FR10)** → Story 2.3. This story only *stops writing due_time*; the full date-only edit flow is 2.3.
- **The canonical ordering function (priority→due→added→manual, total comparator) + drag rearrange (FR12, AD-8)** → Story 2.4. Task 4 here is only the minimal numeric-sort fix so Plan isn't broken by the string→int change.
- **The live-dataset migration (idempotent, `"normal"→3`, strip drift, seed order/archived_at)** → Story 2.5.

### Testing
- `src/lib` is the Vitest-only safety net (NFR12). If you extract a pure priority helper (default/clamp to 1–5, or a legacy `"normal"/"high"`→int mapper reused by 2.5), colocate a `*.test.js`. UI (TaskInput/TaskGroup) has no unit harness (no jsdom) — verify via lint/build + the Nidus round-trip + manual Plan capture.
- **The Nidus round-trip is the definitive test for AC-4** and needs Base44 (see blocker).

### Project Structure Notes
- Updated: `base44/entities/Task.jsonc`, `src/hooks/useTasks.js`, `src/components/tasks/TaskInput.jsx`, `TaskEditDrawer.jsx`, `TaskItem.jsx`, `TaskGroup.jsx`, `src/lib/taskUtils.js`, `src/pages/Today.jsx`. Possibly new: `src/lib/priority.js` (+ test) if a pure helper is extracted.
- ⚠️ **Verify Base44 migrations round-trip** before wiring UI (the Nidus gate) — never trust the optimistic cache. `@/` alias, JS/JSX, no hardcoded hex, all task writes through `useTasks`. [Source: project-context.md]

### References
- [Source: epics.md#Story 2.1] — the six ACs; Epic 2 "neutral Plan, creature passive"; FR12 scope note (ordering + drag is 2.4).
- [Source: epics.md#AD-5] — Task schema: add priority int 1–5 (+ order/completed_at/archived_at in later stories); drop `due_time`/`today`; convert `priority:"normal"`→int; round-trip-verify every change.
- [Source: ARCHITECTURE-SPINE.md#AD-1/AD-2] — per-domain store is the only backend caller; single-funnel optimistic mutations, rollback, stable hook order.
- [Source: ARCHITECTURE-SPINE.md#AD-3/AD-8] — derived read-state; "next" is top-of-effective-order, not a manual `today` pin (why `today` is dropped).
- [Source: EXPERIENCE.md#Information Architecture / UJ-2] — priority 1–5 (5=most), set in planning, drives order silently, hidden on Focus; Plan is the neutral full-backlog surface, creature passive (FR8).
- [Source: SPEC.md#CAP-2, #Non-goals] — capture & prioritize; time-of-day out of scope; private single-user Base44 data.
- [Source: project-context.md] — the Nidus round-trip caution; useTasks is the funnel; no direct `base44.entities.Task.*` in components; `src/lib` Vitest-only.
- Current code: `src/hooks/useTasks.js:61-161`, `src/components/tasks/TaskInput.jsx:39,60-71,94,186-197`, `TaskEditDrawer.jsx:27,37,39,70,72,156-168`, `TaskItem.jsx:119,150-157`, `TaskGroup.jsx:10`, `src/lib/taskUtils.js:10-23`, `src/pages/Today.jsx:42`, `base44/entities/Task.jsonc`.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.8)

### Debug Log References

- `npx vitest run` → 4 files, **82 passed** (incl. 10 new `src/lib/priority.test.js`).
- `npm run lint` → clean. `npm run build` → exit 0 (Vite `logLevel:error` prints no summary). `npm run typecheck` → 93 errors, **identical to baseline** (all in untouched auth pages `Register`/`ResetPassword`/`Settings`; 0 introduced).
- Preview boot (`:5173`) → renders the **Login** screen; pre-auth console errors are Base44 `401 Authentication required`. No JSX/import/render errors.
- **Live authenticated capture (2026-07-02, owner logged in):** `POST /entities/Task` → **422 Unprocessable Entity**: `Error in field priority: Input should be a valid string` (`'input': 3`). Diagnosis: the code correctly sends integer `3`, but the **Base44 backend schema still types `priority` as string** — the `Task.jsonc` change was never pushed to Base44 (the documented "Nidus Recall" sync failure). Nidus gate **FAILED as designed**. Blocks AC-4 and breaks capture live until the schema is deployed to Base44 (platform op; app `6a292e8d7251237a17680162`).

### Completion Notes List

**Code complete and ALL ACs verified live. Ready for code review.**

- **✅ AC-4 Nidus round-trip RESOLVED & GREEN.** Root cause of the initial failure: the `Task.jsonc` schema change only reaches the live backend via the GitHub → Base44 publish pipeline. After committing to `main` (85563b6), pushing, and the owner publishing the app, the live authenticated round-trip passed: `Task.create({priority:4})` → **200**, read-back `priority: 4` (`typeof "number"`). Manual UI capture at priority 5 also verified (created via `useTasks`, integer-persisted, sorted, "High" badge). Deploy ordering matters — the schema must be published before/with the code, which it now is.
- **Legacy rows confirmed in the live dataset** (`priority: "normal"`/`undefined` on ~7 existing tasks). `normalizePriority` keeps them safe (read as 3, no crash); the persisted conversion is **Story 2.5**'s job — this is the expected pre-2.5 state.
- **Pre-existing dev-only warning (not this story):** framer-motion `popLayout` in `TaskGroup` passes a ref to `TaskItem` (a plain function component) → React "Function components cannot be given refs" warning. Present before this story (the `AnimatePresence mode="popLayout"` + `TaskItem` structure is unchanged here). Dev-mode only, non-breaking; fix would be wrapping `TaskItem` in `forwardRef` — out of scope.
- **Priority display decision (UX gap resolved conservatively).** The 1–5 value fully drives *ordering* (its real job, FR12/UJ-2) but is surfaced quietly: a "High" flag chip shows only for the **4–5 band** (`isElevatedPriority`); priorities 1–3 show no card badge. This honours the restraint contract ("without the list judging me") and reuses the shipped idiom. Alternative — a numeric chip on every card — was rejected as noisier. **Adjustable in review if you'd prefer the explicit level shown.**
- **Legacy-safe reads.** Introduced `src/lib/priority.js` (`normalizePriority`/`byPriorityDesc`/`isElevatedPriority`) so un-migrated string rows (`"normal"→3`, `"high"→4`) never crash before the Story 2.5 dataset migration. Used at every read/sort/badge site.
- **Shared `PriorityPicker`** used by both capture and edit (no duplication).
- **Consequential cleanup (beyond the literal task list, required to leave the system coherent):** removed the now-dead time-of-day input from `TaskEditDrawer` (its `due_time` write was dropped, so the input no longer saved) and the `today` prop-threading through `TaskGroup`. `due_time` *reads* left intact (overdue check, DueDateChip, dormant calendar sync → all-day event) — they tolerate absence.
- **"Pin-to-Today" star removed** (drives the retired `today` flag). Intended per AD-3/AD-8; Ryan confirmed during validation. Flagged for review visibility.

### File List

- `base44/entities/Task.jsonc` — added integer `priority` (1–5, default 3).
- `src/lib/priority.js` — **new** — priority normalize/sort/elevated helpers (legacy-safe).
- `src/lib/priority.test.js` — **new** — 10 Vitest cases (NFR12).
- `src/components/tasks/PriorityPicker.jsx` — **new** — shared 1–5 radiogroup control.
- `src/hooks/useTasks.js` — integer priority in `buildNew`; dropped `due_time`/`today` writes; removed `todayM` + `toggleToday`.
- `src/components/tasks/TaskInput.jsx` — 1–5 `PriorityPicker`; removed binary toggle, time-of-day input, `dueTime` state; date-only summary.
- `src/components/tasks/TaskEditDrawer.jsx` — 1–5 model; dropped `due_time` seed/patch + dead time input.
- `src/components/tasks/TaskItem.jsx` — integer badge (`isElevatedPriority`); removed `today` star + `onToggleToday` prop.
- `src/components/tasks/TaskGroup.jsx` — `byPriorityDesc` sort; dropped `onToggleToday` prop.
- `src/lib/taskUtils.js` — `inToday` drops the `today` clause.
- `src/pages/Today.jsx` — `doneTodayAll` drops the `today` clause.

## Change Log

| Date | Change |
|------|--------|
| 2026-07-02 | Implemented Story 2.1: integer priority 1–5 capture + schema migration; dropped `due_time`/`today` drift; legacy-safe read helpers. Offline gates green (lint/build/vitest 82). AC-4 Nidus round-trip + manual Plan capture blocked on live authenticated Base44 (owner action). Status → in-progress (blocked). |
| 2026-07-02 | Live Nidus verification run (owner logged in): **FAILED** — `POST /entities/Task` 422 `priority: Input should be a valid string`. Backend schema still string; `Task.jsonc` not pushed to Base44. Code correct (sends integer 3); blocker is the un-deployed schema. Do not merge until schema pushed. |
| 2026-07-02 | Committed to `main` (85563b6) + pushed; owner published the app (GitHub→Base44). Re-ran live verification: **Nidus round-trip GREEN** (create 200, integer 4 persisted + read back). UI capture at priority 5 verified (via `useTasks`, sorted, "High" badge). Test tasks cleaned up. All ACs satisfied → Status `review`. |
