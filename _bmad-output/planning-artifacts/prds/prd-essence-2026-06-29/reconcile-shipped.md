---
title: "Reconciliation — PRD vs. shipped codebase reality"
created: 2026-06-30
sources:
  - _bmad-output/implementation-artifacts/spec-win-moment-loop.md
  - docs/integration-notes.md
  - _bmad-output/project-context.md
target: _bmad-output/planning-artifacts/prds/prd-essence-2026-06-29/prd.md
---

# Reconciliation: drafted PRD against shipped reality

This document checks whether the PRD's **build-status tags** (✅ shipped / 🔶 extends shipped / 🆕 new) are honest, and whether the PRD's new features collide with documented constraints in the shipped codebase. Findings are ordered by severity.

## What is actually shipped (ground truth from the three source inputs)

From `spec-win-moment-loop.md` (status: done), `integration-notes.md`, and `project-context.md`, the **only** companion/win-moment functionality that ships today is:

- A **per-day completion counter** in `localStorage` (`src/lib/winMoment.js`), date-keyed via date-fns; `recordCompletion()` / `getTodayCount()` / `subscribe(fn)`. **Not** persisted to Base44 — it is a client-side integer per day.
- A **single inline-SVG companion** (`src/components/companion/Companion.jsx`) with **one** growth element (a ring that fills toward `RING_TARGET`, ~8 completions), **one** short message, **one** reaction state (pleased smile/glow that self-dismisses ~1.5s), reduced-motion gated.
- A win-event emit wired into `useTasks.js` `toggleM.onMutate` on a genuine `not-completed → completed` transition, with rollback compensation.
- Mounted once at the top of `Today.jsx`.

The **recurrence engine** (`src/lib/recurrence.js`) is built and tested but **explicitly unwired** (PRD §3 confirms this and scopes it out — consistent).

Data model is **Base44, date-only (`YYYY-MM-DD`), single-user**. Tasks flow through `useTasks`. ESLint ignores `src/lib/**` and `src/components/ui/**`; typecheck excludes `src/lib`. Vitest is the only safety net for `src/lib`.

---

## Severity 1 — Tags that say "extends shipped" but are effectively net-new builds

### 1A. FR15 / FR6 — Subtasks do not exist in the shipped data model (tagged 🔶, really 🆕 + schema migration)

**PRD claim:** FR6 ("broken into subtasks, one level deep") is tagged 🔶 *extends*. FR15 ("when the last subtask is completed, the parent task auto-completes") is tagged 🔶 *extends*.

**Reality:** Nothing in any source input mentions subtasks. The shipped `Task` entity (`base44/entities/Task.jsonc`) is described only as having `completed`, `due_date`, and the recurrence/occurrence fields. There is **no subtask field, no parent/child relation, no per-subtask completion state**. Building subtasks requires:

- A **new Base44 entity field or relation** for subtasks — which the win-moment spec explicitly lists under **"Ask First"** ("Adding any Base44 entity/field").
- A **Base44 entity migration**, which `integration-notes.md` and `project-context.md` both flag as **the single highest-risk step** (the documented "Nidus Recall" failure: new fields silently don't sync; the optimistic cache lies). This must be create→read-back verified before any UI is built on it.
- New `useTasks` mutations (subtask add/complete/edit/delete) because **all task writes must go through `useTasks`**.

**Verdict:** FR6 and FR15 are **net-new feature + schema migration**, not an extension. The "extends shipped" tag hides the highest-risk work in the entire PRD. The auto-complete cascade in FR15 (last subtask → parent auto-completes → win fires) also depends on subtask state that does not exist yet.

### 1B. FR11 / FR13 — The one-task focus view is net-new and contradicts the shipped surface

**PRD claim:** FR11 ("one task at a time") and FR13 ("subtasks revealed two at a time") are tagged 🆕 — correct that they're new, **but** the PRD does not acknowledge they *replace* the shipped surface.

**Reality:** The shipped surface (`Today.jsx`, and `Home.jsx` per integration-notes) renders a **task list** with an **Overdue group** and per-item chips. The win-moment companion is mounted on top of that list. The focus view is not an addition to the list — it is an **inversion of the primary surface** (list → single card). This is a large UI rebuild, not a feature bolt-on, and the companion's current mount point (top of a list view) does not survive intact. The PRD should flag that FR11 supersedes the shipped Today/Home list as the execution surface.

### 1C. FR16 / FR17 — The progress wheel and three-tier reaction ladder over-claim reuse

**PRD claim:** FR16 (progress wheel) tagged 🔶 "Extends the shipped growth-ring/win-moment." FR17 (three-tier reaction ladder) tagged 🔶.

**Reality:** The shipped companion has **one** growth ring and **one** reaction state ("pleased, not hyped," one short line, self-dismissing). The PRD asks for:

- **Three distinct reaction tiers** — subtask = smile + line; task = **a little dance**; day-complete = **deep, slow sigh** (FR17). The shipped component has none of the "dance" or "sigh" animations, and only one message slot. This is a substantial new animation/state-machine build on the companion, not a parameter tweak.
- A **greeting-on-open** state (FR18, correctly 🆕) that the shipped companion also lacks — it only reacts to completions, it does not greet on arrival.

The **growth ring → progress wheel** rename (FR16) is genuinely close to an extension. But bundling it under the same 🔶 as the three-tier ladder lets the much larger reaction-ladder work inherit an "easy" tag. **Split them:** ring/wheel ≈ extend; reaction ladder ≈ mostly new.

---

## Severity 2 — Direct collisions with documented shipped constraints

### 2A. "Due date / time" ordering (FR12) vs. the date-only data model

**PRD claim:** FR12 ranks tasks by "(2) due date sooner-first." UJ-2 step 3 and the ordering rule both say **"due date / time."** The PRD's own inline note (§3) and FR9/OI-1 admit the model is **date-only**.

**Reality:** `project-context.md` is emphatic: the recurrence engine and data model "work **entirely** in date-only `YYYY-MM-DD` strings," and **"Never introduce Date-object/ISO-datetime public APIs."** A time-of-day ordering key would require a datetime field — a schema and API change that directly violates a hard rule. The PRD half-resolves this (FR9 keeps date-only) but **leaves "time" language in the ordering rule (UJ-2) and in FR12's spirit.** Within a single date, the ordering degrades to "order added" — so "sooner-first by time" is **not implementable in v1** and should be struck, not just footnoted. Flag as a latent contradiction the PRD has not fully cleaned up.

### 2B. Archive (FR22/FR23) requires persistence the shipped model doesn't have

**PRD claim:** FR22/FR23 (🆕) — completed tasks "move to an archive at day's end," viewable as calm history.

**Reality:** This needs a durable, queryable record of completed tasks over time. Two collisions:

- The shipped **win-moment progress is `localStorage`, date-keyed, and a stale date reads 0** (spec Design Notes: "a stale date reads 0"). So today's completion *count* is **deliberately ephemeral** — it self-resets each day and is **not** a history store. The archive cannot be built on the win-moment store; it needs Base44-side completed-task retention.
- "Move to an archive at day's end" implies a **day-end sweep job**. There is **no server-side scheduler / cron in the stack** (Base44 SDK + serverless `functions.invoke`, "no custom server"). A true day-boundary sweep must be **client-triggered on next open** (compute "what changed since last seen") — not an actual timed job. The PRD's UJ-1 step 6 ("the dimmed list slowly clears") reads as an automatic timed event; in reality it can only fire when the user reopens the app on a new day. This should be stated, or the journey over-promises.

### 2C. Day-end sweep + "dims but stays visible" vs. completion semantics

**PRD claim:** FR15/FR19/UJ-1 — completed task "dims but stays visible," sinks to bottom, then at day-end "slowly clears into archive."

**Reality:** Shipped completion is a **boolean flip** (`completed: true`) through `useTasks`. There is no "dimmed / archived / cleared" tri-state. Representing "dimmed-but-present" vs. "archived/cleared" needs **at least one new status dimension** on the task (or a derived client view keyed on completion date vs. today). Combined with date-only timestamps (2A), the client cannot even reliably tell *when* a task was completed to decide if it belongs in "today's dimmed trace" vs. "yesterday's archive" — completion currently records no date. This is an unstated data requirement.

### 2D. Recurring-task completion vs. FR15 auto-complete and the win-moment

**PRD claim:** Recurrence is out of scope (§3), good. But FR15 auto-completes a parent when its last subtask is checked, and the win-moment fires on `!task.completed → completed`.

**Reality:** Per integration-notes Step 3, completing a **recurring** task does **not** set `completed: true` — it rolls `due_date` forward and keeps the task active. The shipped win-moment spec handles this ("win-moment fires once"). But the PRD's **subtask auto-complete cascade (FR15)** has no defined interaction with recurrence. Since recurrence is scoped out of v1 this is **not a v1 blocker**, but it is an unflagged future landmine: subtasks + recurrence + auto-complete have three-way semantics nobody has specified.

---

## Severity 3 — Quality-gate and verification gaps the PRD inherits silently

### 3A. New `src/lib` logic will be unlinted and untypechecked

**Reality:** `project-context.md` warns ESLint **ignores `src/lib/**`** and typecheck **excludes `src/lib`**. The PRD's new ordering logic (FR12), day-boundary/archive logic (FR22), and any subtask-state helpers will naturally live in `src/lib` — and will therefore be caught by **Vitest only**. The PRD's NFR section says nothing about test coverage being the sole safety net for this new logic. Any FR that introduces `src/lib` logic should carry an implicit "must ship with colocated vitest tests" requirement; the PRD omits it.

### 3B. Subtask "one level deep" is a hard constraint the journeys lean on but don't guarantee

**PRD claim:** FR6 fixes subtasks at one level deep. UJ-1's progressive-disclosure ("two subtasks at a time," "next flows up") assumes a **flat** subtask list. This is internally consistent — but worth flagging that **any later desire for nested subtasks would break the focus-view disclosure model**, so the one-level limit is load-bearing for the hero feature, not a minor data choice.

### 3C. "Ask First" boundary already tripped

The shipped win-moment spec lists under **Ask First**: "Adding any Base44 entity/field," "Introducing the Care/goal data model," "Persisting the companion beyond a per-day client-side counter." The PRD's subtasks (FR6), priority field (FR5), archive retention (FR22), and personalization persistence (FR1–FR3, name/colour/creature) **all require new Base44 fields/entities** — i.e. the PRD silently crosses the "Ask First" line multiple times. These are reasonable v1 asks, but the PRD presents them as settled ("extends"/"new") without acknowledging each is a schema change gated behind the documented migration-verification ritual (create→read-back, per the Nidus failure mode).

---

## Tag-honesty summary table

| FR | PRD tag | Honest tag | Why |
|----|---------|-----------|-----|
| FR4 (create tasks) | 🔶 | 🔶 ok | task create ships |
| FR5 (priority 1–5) | 🆕 | 🆕 + schema | new Base44 field (migration risk) |
| FR6 (subtasks) | 🔶 | 🆕 + schema | no subtask model ships; "Ask First" |
| FR9 (date-only due) | 🔶 | 🔶 ok | preserves shipped model — correct |
| FR11 (one-task view) | 🆕 | 🆕 (rebuild) | inverts the shipped list surface |
| FR12 (ordering) | 🆕 | 🆕 — strike "time" | datetime key violates date-only rule |
| FR13 (2 subtasks) | 🆕 | 🆕 (depends on FR6 schema) | |
| FR15 (auto-complete) | 🔶 | 🆕 | depends on subtask state + new tri-state status |
| FR16 (progress wheel) | 🔶 | 🔶 ok-ish | genuine extension of ring |
| FR17 (3-tier ladder) | 🔶 | mostly 🆕 | shipped companion has one reaction state |
| FR18 (greet on open) | 🆕 | 🆕 ok | new companion state |
| FR19 (day clears→archive) | 🆕 | 🆕 + persistence + client-sweep | no scheduler; needs Base44 retention |
| FR20 (reduced motion) | ✅ | ✅ ok | genuinely shipped |
| FR21 (carry-forward) | 🔶 | 🔶 ok | overdue group ships (integration-notes §99) |
| FR22/23 (archive) | 🆕 | 🆕 + persistence | localStorage store is ephemeral by design |

---

## Bottom line

The PRD's tagging is **directionally optimistic in exactly the wrong places**: the three highest-risk builds — **subtasks (FR6/FR15), the archive (FR22/FR23), and the three-tier reaction ladder (FR17)** — are all softened to "extends shipped" or presented without their schema-migration cost. The only thing the PRD can honestly call ✅ is reduced-motion (FR20). FR9's date-only resolution is the one place the PRD correctly respected a shipped constraint — but it left contradictory "time" language in the ordering rule (FR12/UJ-2). Every new persisted field crosses the win-moment spec's "Ask First" line and inherits the documented Base44 migration round-trip risk, and any new `src/lib` logic ships outside the lint/typecheck nets with Vitest as the only guard.
