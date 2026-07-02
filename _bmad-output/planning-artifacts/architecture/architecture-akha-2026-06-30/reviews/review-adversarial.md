---
title: Adversarial Architecture Review — Akha
target: ARCHITECTURE-SPINE.md (architecture-akha-2026-06-30)
reviewer: adversarial-architecture-reviewer
date: 2026-06-30
method: "Two-units-one-level-down compatibility attack. For each finding: two compliant units that still build incompatibly, plus the AD that should close the hole."
---

# Adversarial Architecture Review — Akha

## How this attack works

I take two units one level below the spine (a surface and a store, two `src/lib` modules, the Companion and the task store, etc.), make each one obey **every** AD to the letter, and then look for a way they still disagree about a shared data shape, an owner, a mutation path, an ordering, a timing, or a lifecycle state. Each such pair is a hole the spine should close.

The spine is genuinely strong: AD-1/AD-2 close the split-brain, AD-3 retires `winMoment`, AD-7 makes archiving an explicit gesture. The findings below are the seams *between* otherwise-correct units that the ADs do not yet adjudicate.

---

## Finding 1 — Completion double-count across the local-day boundary (un-complete then re-complete) [HIGH]

**Two units:** `lib/dayEnd.todayProgress` (derivation, AD-3/AD-4) vs the task store's complete/un-complete mutation (`useTasks`, AD-2/AD-5).

**Both compliant:** AD-3 says today-progress = "count of tasks whose `completed_at` falls in the local day." AD-5 says `completed_at` is "set on `false→true`, cleared on un-complete." The derivation counts *tasks*, not events. So far airtight against the classic double-count.

**The incompatible scenario — the re-complete bug, not the double-count bug:**
The spine fixed the *event*-counting double-count by counting tasks. But it created a silent *under-count* in the symmetric direction, and an ambiguity AD-5 never resolves: when a task goes `true → false → true`, AD-5 says `completed_at` is **cleared** on un-complete and **set** again on re-complete. Set to *what*? The only sane reading is "now." So a task completed at 09:00, un-completed at 23:50, re-completed at 00:05 the next day now has `completed_at` in *tomorrow's* local day. It silently leaves today's progress wheel and silently appears tomorrow — a completion the user made *today* is attributed to a different day, and today's count goes *down* by one while the wheel is still on screen. Restraint-contract-adjacent: a progress indicator that *decreases* while you are working is exactly the shame/anxiety vector §5 forbids, reached without anyone violating an AD.

Worse, AD-5 does not say whether un-complete preserves the original `completed_at` or destroys it. Two compliant implementers — one preserving (re-complete restores original stamp), one clobbering (re-complete writes `now`) — produce **different day-attribution** for the identical user gesture. That is a literal "two compliant units build incompatibly" pair: `dayEnd.js` written against the preserve-semantics and `useTasks` written against the clobber-semantics disagree on what day a task belongs to.

**Close it:** Tighten **AD-5** (or a new **AD-3a**): define `completed_at` write semantics exactly — e.g. "set to `now` only on a true `false→true` transition; un-complete clears it to `null`; re-complete sets a fresh `now`. The derivation is day-of-`completed_at`, and the wheel is allowed to move down when a task is un-completed but **MUST NOT** attribute a same-session re-completion to a later day." Or simpler: pin the rule that today-progress counts tasks completed *or* archived-from-completed whose stamp is "today OR carried from a prior today," and forbid the wheel from ever decreasing within a session. Pick one; the spine currently allows both, and they are incompatible.

---

## Finding 2 — Reaction misfire on optimistic-mutation rollback (AD-2 rollback vs AD-9 emit-at-transition) [HIGH]

**Two units:** the task store's optimistic mutation (`useTasks`, AD-2) vs the reaction channel + Companion (`lib/reactions` + `components/companion`, AD-9).

**Both compliant:** AD-2 requires feedback fires *before* the save returns ("Feedback fires before the save returns; never network-gated"). AD-9 requires the store "emits `{tier}` **at the transition**" and the channel is "transient events only — never persisted." AD-2 also mandates rollback to `ctx.previous` on error. The Companion only subscribes and plays; it is pure per AD-9.

**The incompatible scenario — the un-rolled-back celebration:**
Complete the last task of the day. AD-2 says fire feedback immediately (optimistic) — so the store emits `{tier:'task'}` and, if this trips the day-end ladder, `{tier:'dayend'}` *before* the network confirms. The save then fails; AD-2 says roll the cache back to `ctx.previous`. But AD-9 events are **transient and fire-and-forget** — there is no rollback channel for a signal already consumed. The Companion has already played the day-end celebration; the task is now back to incomplete. The user sees the biggest reaction in the app for a completion that *did not persist*. AD-9 explicitly forbids the Companion from "re-deriving event-type from a count diff," so the Companion cannot self-correct by watching the cache revert — it is structurally blind to the rollback.

This is a true compliant-pair clash: AD-2 (optimistic, fires-before-save, rolls back) and AD-9 (transient, emit-at-transition, no state) are each obeyed, yet together they guarantee a celebration that contradicts persisted reality whenever a save fails. The frequency is low, but the failure mode is precisely the kind of "loud-cutesy / false-win" event the restraint contract forbids, and it is unrecoverable by design.

**Close it:** Tighten **AD-9** to specify *when* in the optimistic lifecycle the emit happens, and what happens on rollback. Two clean options: (a) emit on `onMutate` (optimistic) but require the store to emit a `{tier:'revoke'}` / cancellation that the Companion honors by truncating an in-flight reaction; or (b) decouple reaction timing from persistence by emitting on the *local* transition only and accepting that reactions are explicitly "feeling, not fact" — but then AD-9 must say so, because a day-end celebration is currently load-bearing enough that a false one matters. The spine must pick where the emit fires relative to `onMutate`/`mutationFn`/`onError`; it is silent today.

---

## Finding 3 — Carry-forward swallows every no-`due_date` task, or none — undefined comparison [HIGH]

**Two units:** `lib/dayEnd.carryForward` (derivation, AD-3) vs `lib/ordering` (ordering, AD-8) — two `src/lib` modules that both read `due_date`.

**Both compliant:** AD-3 defines carry-forward literally as `incomplete && due_date < today`. AD-5 says `due_date` is date-only `YYYY-MM-DD` and is **not** in the required-fields list — capture (FR4–10) plainly allows a task with no due date. AD-8 orders by "priority 5→1, then `due_date` sooner-first, then created earliest-first."

**The incompatible scenario — `undefined < today`:**
A task with no `due_date` has `due_date === null`/`undefined`. In JS, `null < "2026-06-30"` and `undefined < "2026-06-30"` both coerce to **`false`** (undefined → NaN comparison is false; null → `0 < "2026-06-30"` is false on string compare). So `dayEnd.carryForward` silently treats *every undated task as never carried forward* — it just sits in the backlog forever, which may be intended. But `lib/ordering` has to sort the *same* undated task by "`due_date` sooner-first," and a sort comparator that does `a.due_date < b.due_date` with `undefined` operands produces **non-deterministic / intransitive ordering** (comparator returns false both directions → unstable sort, engine-dependent). So the two `src/lib` modules — both pure, both tested, both AD-compliant — embed **two different implicit policies** for the same missing value: dayEnd says "undated = never urgent," ordering says "undated = unspecified position." Neither is wrong per the spine; they are simply uncoordinated, and a tester writing fixtures for one will not catch the other.

**Close it:** Add a one-line invariant to **AD-3 and AD-8** (or a new **AD-5a — null-`due_date` policy**): "An absent `due_date` is treated as `+∞` (never overdue, sorts after all dated tasks). All `due_date` comparisons in `src/lib` MUST funnel through one shared `compareDueDate(a,b)` helper that defines the null-ordering." Without this, the two lib modules are guaranteed to drift, and the ordering comparator is a latent intransitivity bug.

---

## Finding 4 — `order` override vs computed sort: who owns position after priority changes? [HIGH]

**Two units:** the Plan surface's manual rearrange (writes `order`, AD-5/AD-2) vs `lib/ordering` (computed sort, AD-8).

**Both compliant:** AD-5 declares `order` is the "persisted manual-rearrange key." AD-8 says ordering is "priority 5→1, then `due_date`, then created-earliest, with the persisted `order` field as the **override**." The Deferred section even flags the *representation* (float gap-key vs integer reindex) as a build-time decision — but explicitly leaves the *semantics* of override to the rule.

**The incompatible scenario — "override" is ambiguous between global and local:**
"`order` as the override" has (at least) two compliant readings, and the Plan surface and `lib/ordering` can each pick a different one:

1. **Global override:** if `order` is set, it wins outright — the list is sorted by `order` alone, priority/`due_date` ignored. Then bumping a task's priority 2→5 does *nothing* to its position (manual order already pinned it), which contradicts AD-8's stated primary intent that priority 5 sorts first, and contradicts FR-level expectation that priority means something.
2. **Local/tiebreak override:** `order` only breaks ties *within* equal priority+due_date. Then a user who drags task X above task Y in Plan sees X jump back below Y the instant Y's priority is raised — their manual rearrange silently evaporates.

These are genuinely incompatible: the Plan surface built against reading (1) and `lib/ordering` built against reading (2) will render **different lists from the same data**, and Focus (which shows "the highest-ranked incomplete," AD-8) will pick a **different single task** than the user expects from Plan's top row. Because Focus shows exactly one task, this ambiguity decides *which task the user does next* — the single highest-stakes derivation in the product — and the spine does not adjudicate it.

Compounding: AD-8 hides priority in Focus. If global-override is chosen, the Focus task is determined by a manual `order` the user set days ago and can no longer see the reason for — a "why is this on top?" with no visible answer, which abrades the calm contract.

**Close it:** Tighten **AD-8** to state the override semantics unambiguously and define how `order` interacts with a priority change. Recommended: "`order`, when set, is a **full manual override**: the list sorts by `order` for all tasks that have one, computed-rank only fills gaps for tasks without an `order`. A priority change does **not** move a manually-ordered task; re-sorting by priority is an explicit user action that clears `order`." Whatever the choice, it must be one rule both the surface and the lib obey, and it must define the priority-change interaction.

---

## Finding 5 — `archived_at` vs `completed_at` ordering & a third lifecycle state nobody owns [HIGH]

**Two units:** the `useTasks` day-end sweep action (stamps `archived_at`, AD-7) vs the Archive surface's ordering (`pages/Archive`, governed by AD-7 with no `src/lib` ordering rule assigned).

**Both compliant:** AD-7 says the sweep "bulk-stamps the currently-completed tasks," `archived_at` set = in Archive, and archiving is triggered *only* by the explicit gesture. AD-5 says `completed_at` is set on completion. The lifecycle diagram shows `Completed → Archived`.

**Incompatible scenario A — Archive has no defined sort, and the two timestamps disagree:**
The Capability map assigns ordering only to `lib/ordering`, which is about the *active* backlog (priority/due_date). The Archive is a list of *archived* tasks — what does it sort by? `completed_at` (when you finished it) or `archived_at` (when you swept it)? A bulk sweep stamps **the same `archived_at`** on a dozen tasks completed across many different times, so sorting by `archived_at` collapses them into an arbitrary tie, while sorting by `completed_at` orders them by when they were done. AD-7 itself notes "never-swept completed tasks accumulate as dimmed across days" — meaning a single sweep routinely captures tasks completed on *different days*. The Archive surface and any future `lib` helper can each pick a different sort key and both obey AD-7, producing different histories. No AD assigns Archive an ordering owner.

**Incompatible scenario B — the un-sweepable in-between state:**
Consider a task completed *yesterday* but never swept (AD-7 explicitly permits this — "dimmed across days"). Today its state is `completed && !archived_at`. AD-7 says that state = "done-today/dimmed on **Focus**." But it was *not* done today — it was done yesterday. So the Focus surface (rendering dimmed done-tasks) and the `dayEnd.todayProgress` derivation (counting only `completed_at` in the local day, AD-3) **disagree about the same task**: Focus shows it as a dimmed done item in today's view, while the progress wheel does not count it toward today. One unit says "this belongs to today's done-pile," the other says "this is not today's." Both are compliant; they describe the same row two ways. The user sees a dimmed completed task sitting in today with the wheel refusing to credit it — a quiet contradiction, and the "I'm done for today" sweep semantics (does it stamp *only* today's completions, or all un-archived completions including yesterday's?) is undefined, which is exactly the ambiguity that lets a stale task either get swept into the wrong day's archive or stick around forever.

**Close it:** (a) Add an **Archive ordering invariant** (extend AD-7 or a new `lib/archiveOrder`): "Archive sorts by `completed_at` descending; `archived_at` is lifecycle-only, never a sort key" (or the reverse — but pick one and assign an owner). (b) Resolve the in-between state in **AD-7**: define whether "done-today/dimmed on Focus" means "all `completed && !archived_at`" regardless of day, and reconcile it with AD-3's strictly-today progress count — e.g. "Focus dims all un-archived completed tasks; the wheel counts only those completed in the local day; a multi-day sweep stamps `archived_at` on all un-archived completed tasks regardless of completion day." State it; today both readings pass.

---

## Finding 6 — Two owners of "the current day": `lib/dayEnd` vs the implicit clock [MEDIUM]

**Two units:** `lib/dayEnd` (today-progress + carry-forward, AD-3/AD-4 — pure functions) vs `useTasks`/surfaces (which call them, AD-2).

**Both compliant:** AD-4 mandates these are **pure** functions in `src/lib`. AD-3 defines today-progress by "the local day" and carry-forward by "`< today`." A pure function cannot read the clock — purity means `today` must be **passed in**.

**The incompatible scenario — who computes `today`, and is it stable across a render?:**
If `dayEnd` is pure (AD-4), then `today` is an argument, and *the caller* (a surface or the store) owns "what is today." Two callers can pass different `today` values — e.g. the progress wheel computes `new Date()` at render N, the carry-forward list computes it at render N+1, and across local midnight (or a tab left open overnight) the two derivations disagree about the day boundary within the same screen. Carry-forward says a task is overdue (it used the new day) while the wheel still counts it as today's completion (it used the old day). Each unit is pure and AD-4-compliant; the bug lives in the **unowned `today` source**, which no AD assigns. The shipped code's "midnight-rollover bug" (called out in AD-3 as a thing being *fixed*) is structurally still possible here, just relocated from `winMoment` to the day-boundary input.

**Close it:** Add to **AD-3/AD-4**: "The local day boundary is computed in exactly one place (a single `lib/dayEnd.today()` or a store-provided value) and passed to all derivations within a render pass; no surface calls `new Date()` for day logic independently." Assign an owner for `today` the same way AD-1 assigns an owner for persistence.

---

## Finding 7 — `usePrefs` (localStorage, sync) vs `useTasks` (Base44, async) — onboarding gate race [MEDIUM]

**Two units:** `usePrefs` (local, AD-6) vs `useTasks` (cloud, AD-1/AD-2) — two stores, two persistence backends, read by the same shell on boot.

**Both compliant:** AD-6 puts the `onboarded` flag and prefs in `localStorage` behind `usePrefs` — synchronously available. AD-1/AD-2 put tasks in Base44 behind `useTasks` — asynchronous, loading state. AD-10 themes everything via a root data-attribute swapped from the scheme pref.

**The incompatible scenario — theme/identity ready before data, or gate flicker:**
`usePrefs` resolves instantly (localStorage is sync), so the app knows the scheme, name, and `onboarded=true` on frame 1. `useTasks` is still loading on frame 1. The Focus surface ("render exactly one task," AD-8) has a personalized, fully-themed shell with *no task to show* and *no defined empty/loading contract* — is it "you're all done" (a false day-end feeling), a blank, or a spinner? Nothing in the spine assigns the Focus empty-vs-loading distinction, and the two stores' different resolution timings make it user-visible every cold boot. Symmetrically, a brand-new user with `onboarded` unset but a network-slow `useTasks` can momentarily route to Focus before Onboarding if the gate keys off task-emptiness instead of the pref — two compliant gate implementations (gate on `usePrefs.onboarded` vs gate on "has tasks") diverge.

**Close it:** Add an **AD** (or extend AD-6): "Routing/onboarding gate keys **only** on `usePrefs.onboarded`, never on task presence. Focus distinguishes `loading` (tasks not yet resolved) from `empty` (resolved, zero incomplete) as separate states with separate, defined treatments; the day-end/all-done feeling fires only on the resolved-empty-after-completion path, never on cold-boot loading." The async/sync split between the two stores otherwise guarantees a flicker the restraint contract would call a false signal.

---

## Finding 8 — Reaction tier "flat within a tier" vs day-end being both a tier and a derived milestone [MEDIUM]

**Two units:** the task store's reaction emit (AD-9) vs `lib/dayEnd` sweep-eligibility/day-end derivation (AD-3/AD-4/AD-7).

**Both compliant:** AD-9: tier is set "by event type only," `{tier:'dayend'}` is one of three, "stays flat within a tier (no intensify by … milestone)." AD-7: "I'm done for today" is the explicit sweep gesture. AD-3: day-end / all-complete is *derived*.

**The incompatible scenario — what event *is* `dayend`?:**
There are two distinct "day-end" moments and AD-9 names only one tier for both:
1. The user completes the **last incomplete task** (a derived transition — backlog hits zero incomplete). This is a `completed_at` event, naturally a `{tier:'task'}` per "event type only."
2. The user taps **"I'm done for today"** (the explicit sweep gesture, AD-7) — a different event type entirely (a bulk-archive action, not a completion).

Does `{tier:'dayend'}` fire on (1), (2), or both? "Event type only" says the *completion* of the last task is type `task`, not `dayend` — so the celebratory day-end reaction would fire on the **sweep button**, not on actually finishing your work, which feels backwards. But if `dayend` fires on (1), then it is being derived from a **count diff** ("incomplete just hit zero") — which AD-9 explicitly forbids the Companion from doing, and which "event type only / flat within a tier (no milestone intensify)" was written to prevent. The task store emitting `dayend` on last-completion is the store doing milestone derivation that AD-9 banished from the Companion — same forbidden logic, just moved one unit upstream and technically compliant.

**Close it:** Tighten **AD-9** to name the trigger for `{tier:'dayend'}` precisely: which gesture(s) emit it, and explicitly permit the *store* (not the Companion) to detect the last-task-complete milestone if that is the intended trigger — i.e. "milestone detection is allowed in `useTasks` via `lib/dayEnd`, forbidden in the Companion." Otherwise "event type only" and "the day-end celebration" are in tension and two implementers wire the climax of the product to two different buttons.

---

## Finding 9 — `priority:"normal"` → integer migration: who maps, and the round-trip window [LOW/MEDIUM]

**Two units:** `lib/ordering` (consumes integer `priority` 1–5, AD-5/AD-8) vs `useTasks`/adapter reading shipped Base44 rows that still contain `priority:"normal"` (AD-5 reconcile clause).

**Both compliant:** AD-5: "`priority:"normal"` becomes the integer," and "every schema change is round-trip-verified via a real read before wiring." AD-8: ordering consumes integer priority.

**The incompatible scenario — migration ownership and the mixed-type window:**
AD-5 says the string becomes an integer but does not say **where** the coercion happens — adapter (on read), store (in cache), or a migration pass. During the round-trip-verify window, Base44 holds a mix of `"normal"` (legacy rows) and integers (new writes). `lib/ordering` is pure and assumes integers (AD-8); if a legacy `"normal"` reaches it un-coerced, `5 > "normal"` is `false` (NaN), silently dropping that task to an arbitrary sort position — a tested-pure function fed an out-of-contract value because the coercion owner is unassigned. Two compliant choices (coerce-in-adapter vs coerce-in-store) put the boundary in different places, and a surface reading the cache directly for any reason sees a different type depending on which was chosen.

**Close it:** State in **AD-5** (or AD-1) that **type coercion is the adapter's job** (the adapter normalizes Base44 rows to the canonical schema on read, so everything above the adapter sees integers only) — consistent with ports-and-adapters: the adapter owns wire-format-to-domain mapping. Then `lib/ordering` never meets a string, and there is one owner of the migration.

---

## Summary table

| # | Two units | Clash | Severity | Closing AD |
| --- | --- | --- | --- | --- |
| 1 | `dayEnd.todayProgress` vs store complete/un-complete | `completed_at` re-write semantics undefined → same-day completion attributed to next day; wheel decreases | HIGH | tighten AD-5 / new AD-3a |
| 2 | optimistic mutation (AD-2) vs reaction channel (AD-9) | celebration fires before save; save fails & rolls back; reaction can't be revoked | HIGH | tighten AD-9 (emit timing + revoke) |
| 3 | `dayEnd.carryForward` vs `lib/ordering` | null `due_date`: `< today` is false, sort comparator intransitive; two implicit policies | HIGH | new AD-5a null-due_date / shared comparator |
| 4 | Plan manual `order` vs `lib/ordering` computed sort | "override" ambiguous global vs tiebreak; decides the single Focus task | HIGH | tighten AD-8 (override semantics + priority-change) |
| 5 | sweep `archived_at` (AD-7) vs Archive ordering / Focus dimming | no Archive sort owner; `completed && !archived_at` from a prior day belongs to "today" on Focus but not in the wheel | HIGH | tighten AD-7 + Archive ordering owner |
| 6 | `lib/dayEnd` purity vs caller-supplied `today` | unowned day-boundary input → derivations disagree across midnight | MEDIUM | AD-3/AD-4 single `today` owner |
| 7 | `usePrefs` (sync) vs `useTasks` (async) | themed shell before data; loading-vs-empty Focus undefined; gate flicker | MEDIUM | extend AD-6 (gate on onboarded; loading≠empty) |
| 8 | reaction emit (AD-9) vs day-end derivation (AD-7/AD-3) | `dayend` tier trigger undefined; last-complete milestone is forbidden count-diff moved upstream | MEDIUM | tighten AD-9 (name dayend trigger; milestone allowed in store only) |
| 9 | `lib/ordering` integer priority vs legacy `"normal"` rows | coercion owner unassigned; mixed-type window feeds string to pure sort | LOW/MED | AD-5/AD-1 adapter owns coercion |

## Verdict

The spine's big structural calls are sound — the holes are all at **unadjudicated seams**: write-semantics of `completed_at`, the null-`due_date` policy, the meaning of the `order` "override," the Archive sort key, the day-boundary owner, and the reaction emit's position in the optimistic/rollback lifecycle. None require new layers; each closes with one tightened or added sentence in an existing AD. The two I would not ship without fixing are **#2** (false celebration on rollback — restraint-contract violation, unrecoverable by design) and **#4** (the `order`/priority override ambiguity decides which single task the user does next, the highest-stakes derivation in the product).
