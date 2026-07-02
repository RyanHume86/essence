---
title: "Akha — Product Requirements Document"
status: final
created: 2026-06-29
updated: 2026-06-29
---

# Akha — PRD

> **Compass:** Akha answers to the user, not to competitors. Comparable apps appear in this document only where they sharpen a specific decision — never as something to react against.

## 1. Vision & the bet

**Akha is a calm task companion that grew up.** You bring your own tasks — nothing is preloaded, nothing is prescribed. A warm, relatable creature waits patiently in the corner and offers quiet encouragement as you work, growing a little with each thing you finish. It is built for **the builder** — someone moving real, identity-level goals (the novel, the business, the body) who finds plain checkbox apps too cold and loud companion apps too childish. Its discipline is **restraint**: all fluff is stripped away so the felt sense is *satisfaction and contentment, never overwhelm*.

**The bet:** Akha works because the *feeling* — satisfaction from visible progress, delivered with genuine restraint and tied to the user's own real goals — is what a plain to-do list can't give and a noisy companion app destroys. Strip the fluff completely and the remaining feeling is contentment, not pressure.

**Why it matters:** the person using it feels accomplished for doing their task, and feels supported and encouraged to keep going.

### Brand non-negotiables

These are first-class requirements, not values on a poster. Every feature is tested against them.

1. **No streaks, no shame.** No streak counters, no broken-streak penalties, no guilt mechanics. The streak/stats page *is* the guilt engine and is rejected by design.
2. **Never guilts you for absence.** Staying away from the app carries no penalty, no "you've been gone" nags, no decay.
3. **Never takes over your independence.** Akha supports the user's own planning and decisions — it never prescribes tasks, never decides for them, never assumes control of their day.

---

## 2. The protagonist

**Ryan, 40.** Swamped with to-do tasks and feeling overwhelmed with most things in life. He wants a *structured* way of seeing his tasks actually get completed — not more organizing, more *finishing*.

**Why a plain to-do list fails him:** the list gets easily pushed aside, and the moment he opens it, **seeing the entire list at once becomes overbearing**. The overwhelm takes over. Cutesy, loud companion apps fail him from the other side — they add noise to a head that's already full.

**Where Akha meets him:** morning coffee. He's still tired, not looking forward to the day, quietly dreading the long list of work ahead. That dread — *before he's done anything* — is the state Akha exists to change.

> **North star (drives later requirements):** Akha's job is to protect Ryan from his own backlog, not merely to store it. The wall-of-tasks view is the enemy. What he sees *first*, and *how little* of it, is a product decision — not a default.

---

## 3. User journeys

### UJ-1 — The morning session (working through the day)

**Context:** Morning, coffee in hand. Ryan is tired and quietly dreading the day's work. He opens Akha not eager, just checking in.

**The session:**

1. **Arrival.** The creature greets him with a soft smile and a brief, encouraging welcome. It does not pounce.
2. **One thing, not everything.** Ryan sees *only the first task*, its subtasks collapsed beneath it. The rest of the backlog is not on screen.
3. **A gentle reveal.** He taps the subtask dropdown; the **first two** subtasks appear — not all of them.
4. **A small win.** He completes the first subtask. The creature smiles gently and a very brief line of encouragement appears. The completed subtask **disappears**, the next subtask flows up, and the following incomplete subtask opens to become more visible.
5. **A whole task done.** When the last subtask is checked, the parent task **auto-completes**. It **dims but stays visible**, the progress wheel updates, and the creature does **a little dance** (a brief, small, low-amplitude motion — never confetti-scale). The finished task drops to the bottom of the full task list.
6. **The day closes — on his terms.** When Ryan decides he's done, he taps **"I'm done for today."** The dimmed completed tasks slowly clear from the page (into the archive). The creature smiles and lets out **a deep, slow sigh** — resting with him. The inverse of the morning's dread. This is an explicit gesture, never auto-triggered by an empty list, so capturing a task late in the day is never discouraged.

**Where it lands:** Ryan ends the session feeling *accomplished for what he did* and *encouraged to keep going* — without ever having faced the overwhelming wall of everything he owes.

**Reaction ladder (proportional, always quiet — never loud):**

| Accomplishment | Treatment | Creature |
|---|---|---|
| Subtask complete | item disappears, next flows up | gentle smile + brief line |
| Task complete (all subtasks) | auto-ticks, dims & stays, sinks to bottom, progress wheel updates | a little dance (brief, small, never confetti-scale) |
| "I'm done for today" (manual) | dimmed list slowly clears → archive | smile + deep, slow sigh |

_Reactions never intensify by priority, milestone, or volume — the ladder is defined by event type only and stays flat within each tier._

> **Design principle surfaced by UJ-1:** Focus is anchored to *one task at a time*; disclosure is progressive even within a task (two subtasks at a time). Subtasks vanish on completion; tasks leave a brief dimmed trace before the day-end sweep — visible proof of work done, with no streak and no guilt.

### UJ-2 — Capture / planning

**Context:** Ideally the evening before, getting tomorrow out of his head; sometimes mid-day as new tasks arrive.

**The session:**

1. **A utility moment, not a warm one.** Capture is deliberately neutral — "get it out of your head." The creature simply sits and waits; it does not engage or react during planning. Its warmth is reserved for the doing.
2. **Dump freely.** Ryan adds tasks. Seeing them listed here is fine — the overwhelming wall is only forbidden during *execution*, not while he is intentionally planning.
3. **Priority.** Each task gets a priority of **1–5** (5 = most important). Priority drives the order tasks are later surfaced in the focus view.
4. **Decompose.** Ryan breaks tasks into subtasks. The app nudges toward decomposing up front, but subtasks can also be added later when the task comes up, and edited anytime.
5. **On the fly.** New tasks can be captured any time during the day, not just the night before.

**Ordering rule (how the focus view picks the next task):**

1. **Priority** (5 → 1)
2. then **due date** (sooner first; date-only)
3. then **order added** (earliest first)
4. **manual rearrange** — always available as an override

> **Design principle surfaced by UJ-2:** The creature belongs to the *doing*, not the *planning*. Planning is honest utility; execution is where support shows up. Overdue tasks are not elevated for being late — they sit at their priority, shown calmly (see Brand rule: no shame).

**Overdue handling (resolved):** Overdue tasks are **never labelled "overdue."** They carry to the next day and are gently **highlighted as tasks that still need to be done** — no red, no badge, no shame. A quiet "this is still here," nothing more. The highlight never intensifies or accumulates as a task ages (see FR21).

### UJ-3 — First open (onboarding)

**Context:** Ryan installs Akha and opens it for the first time, with zero tasks.

**The session (deliberately minimal):**

1. He chooses the **name he wants to be called by**.
2. He selects a **colour scheme**.
3. He selects a **creature** (from presets — not create-your-own, which is deferred).
4. A brief, warm, encouraging **welcome message**.
5. **A first-open creature moment.** Even with an empty list, the creature performs a small warm intro beat — a preview of the feeling — so the first session lands emotionally without requiring a task. This keeps onboarding pure (no forced task entry) while answering the "empty first session" retention risk.
6. That's it — no task tutorial, no feature checklist. He's dropped gently into his calm space.

> **Design principle surfaced by UJ-3:** Onboarding is where calm apps get loud; Akha stays quiet. The only setup is the few choices that make the space feel like *his*.

### Out of scope for this PRD

- **Recurring tasks.** Ryan has no repeating tasks. The recurrence engine (built and tested, currently unwired) remains future work and is not forced into v1.
- **Create-your-own creature.** Onboarding offers preset selection only; bespoke creature creation stays deferred.

---

## 4. Features & requirements

Functional requirements derived from the journeys. IDs are stable and globally numbered. **Build status** marks what already ships (✅), what extends shipped work (🔶), and what is new (🆕).

### A. Onboarding & personalization

- **FR1** 🆕 First run collects three choices — the name the user wants to be called by, a colour scheme, and a creature (from presets) — as a brief, calm setup. No task tutorial and no multi-step feature walkthrough.
- **FR2** 🆕 After setup, the creature shows a brief, warm, encouraging welcome message.
- **FR3** 🆕 Name, colour scheme, and creature can be changed later from a settings surface.
- **FR24** 🆕 On the first open (post-onboarding, empty list), the creature performs a small warm intro beat that previews the feeling without requiring the user to add a task. Acceptance: the beat plays once, self-dismisses, and does not block adding a task.

### B. Capture & planning

- **FR4** 🔶 The user can create tasks at any time — planned ahead (e.g. the night before) or added on the fly during the day.
- **FR5** 🆕 Every task carries a priority of 1–5 (5 = most important).
- **FR6** 🔶 A task can be broken into subtasks (one level deep). Subtasks can be added at capture or later when the task surfaces, and edited anytime.
- **FR7** 🆕 During capture, Akha gently nudges the user to decompose a task into subtasks up front (encouraged, not required).
- **FR8** 🆕 The capture/planning surface is a neutral utility: the full list may be visible here, and the creature sits passively without reacting.
- **FR9** 🔶 A task carries a due date (date-only, `YYYY-MM-DD`). Time-of-day is out of scope for v1, preserving the existing date-only model and calm/low-pressure feel.
- **FR10** 🔶 Tasks and subtasks can be edited and deleted.

### C. The focus view (the "doing" surface — hero feature)

- **FR11** 🆕 During execution, Akha shows **one task at a time** — the highest-ranked task — with the rest of the backlog off-screen.
- **FR12** 🆕 Task order is determined by: (1) priority 5→1, (2) due date sooner-first, (3) order added earliest-first, with (4) manual rearrange as an override.
- **FR13** 🆕 Within a task, subtasks are revealed **two at a time**, not all at once.
- **FR14** 🆕 Completing a subtask: the completed subtask is removed from view, the next subtask flows up, and the following incomplete subtask becomes the active (expanded) one; the creature gives a gentle smile + a very brief line of encouragement. Acceptance: exactly one subtask is "active/expanded" at a time and the just-completed item is no longer shown.
- **FR15** 🆕 When the last subtask is completed, the parent task **auto-completes**: it dims (reduced opacity) but remains visible, the progress wheel updates, the creature does a little dance (a brief, small, low-amplitude motion — never confetti-scale), and the task drops to the bottom of the full list.
- **FR16** 🔶 A progress wheel reflects the day's completions and grows as the user progresses (extends the shipped growth-ring/win-moment).
- **FR25** 🆕 Progress-wheel guardrail: the wheel reflects **accumulation only**. It never shows a denominator, percentage, "tasks remaining," shortfall cue, or any cross-day persistence/comparison. It can fill and keep counting; it can never imply how much is left. _(Enforces Brand rule 1 and the North Star.)_

### D. The companion (reaction system)

- **FR17** 🆕 A three-tier, proportional, always-quiet reaction ladder: subtask = gentle smile + brief line; task = little dance + progress-wheel update; "done for today" = smile + deep slow sigh. Reactions **never intensify** by priority, milestone, or volume — the tier is set by event type only and stays flat within each tier.
- **FR18** 🆕 On opening the app, the creature greets the user with a soft smile and a brief encouraging welcome; it never pounces.
- **FR19** 🆕 The end-of-day moment is triggered by an explicit, optional **"I'm done for today"** gesture (never auto-gated on an empty list): the dimmed completed tasks slowly clear into the archive and the creature smiles then lets out a deep, slow sigh.
- **FR20** ✅ All creature reactions respect reduced-motion (state change shown without animation). _(Already enforced in shipped win-moment.)_

### E. Overdue & carry-forward

- **FR21** 🔶 Incomplete tasks carry to the next day and are gently highlighted as "still needs doing." They are never labelled overdue — no red, no badge, no shame. The highlight is a fixed, calm treatment that **never intensifies, accumulates, counts up, or escalates** as a task ages — staleness is never made louder.

### F. Archive

- **FR22** 🆕 Completed tasks move to an archive when the user ends the day, viewable as a calm "what I've done" history.
- **FR23** 🆕 The archive shows only completed work ("what I did"), never missed/incomplete work, and carries no streaks, counts-as-pressure, or comparative stats. It is proof of progress, not a scoreboard. _(Enforces Brand rule 1.)_
- **FR26** 🆕 Archive structural guardrail: the archive cannot present totals, per-day completion tiles, calendar grids, or any aggregate view that re-encodes streaks, cadence, or shortfall. The structure itself must make a scoreboard impossible, not merely discouraged by policy.

### Resolved open items

- **OI-1 → Resolved:** Due dates are **date-only** for v1; time-of-day is future work.
- **OI-2 → Resolved:** The archive is a **viewable calm history** (see FR22–23).
- **OI-3 → Resolved:** Personalization is **editable post-onboarding** (FR3).

---

## 5. The restraint contract

What Akha refuses to do. This is a gate, not a footnote: any future feature must pass every line here, or it does not ship — no matter how much "engagement" it promises.

**Akha will never:**

1. **Show streaks or streak penalties.** No streak counters, no broken-streak guilt. The streak/stats page is the guilt engine, and it is rejected by design.
2. **Shame the user.** No "you missed," no red overdue labels, no nagging. Incomplete work is a quiet "still needs doing," never an accusation.
3. **Guilt the user for absence.** Time away carries no penalty, decay, or "you've been gone" nag on return.
4. **Take over the user's independence.** No prescribed tasks, no preloaded or default lists, no deciding the day for them. The user plans; Akha supports.
5. **Overwhelm during execution.** The full backlog is never shown while the user is working. One task at a time is a promise, not a default.
6. **Be loud or cutesy.** No confetti, no hype, no gacha mechanics, no patronizing baby-talk. Reactions stay proportional and quiet.
7. **Gate the core experience behind payment.** The core feeling — companion, focus view, win-moments — is always free. Monetization covers costs and only ever touches convenience and portability (backup, export, cross-device extras), never the feeling itself.
8. **Creep into a feature pile.** The moat is the feeling + restraint, not a long feature list. Breadth is resisted on purpose.

---

## 6. Success metrics & counter-metrics

Akha is judged by *felt experience*, not growth charts. Chasing daily-active-users or streak-retention would pressure the product toward the exact guilt mechanics the restraint contract bans. v1 is at the **build-for-yourself stage** and **not monetized** — so success is judged by the builder's own experience, not an audience's analytics.

### Signals it's working (v1)

- **The day inverts.** The morning's dread becomes the evening's contentment (the deep, slow sigh). The single most important felt signal. _Self-check: did I end more days reaching for "I'm done for today" than abandoning the app mid-list?_
- **Things get finished, not just organized.** Tasks reach completion — the product's literal job — without the user facing the overwhelming wall. _Self-check: are tasks getting completed, not just captured and reshuffled?_
- **Calm return.** The builder comes back by pull, not push — no notification nagging required to re-open it. _Self-check: do I reopen Akha without a reminder prompting me?_
- **Lower load, not higher engagement.** Opening Akha reduces stress rather than adding to it. _Self-check: after a session, do I feel lighter or heavier?_

### Counter-metrics (winning the number, losing the soul)

If any of these move the wrong way, the product is failing *even if usage looks healthy*:

- **Anxiety-on-open.** Opening Akha ever raising stress instead of lowering it.
- **Backlog dread.** Avoiding the app because tasks piled up — a sign carry-forward turned into shame.
- **Engagement-via-guilt.** Session counts holding up only because of pressure mechanics.

### Future gates (before going beyond build-for-yourself)

These are not v1 metrics — they are the prerequisites the forge named before Akha widens or monetizes:

- **Stranger win-moment.** The felt loop lands on a builder who is not the author.
- **Unbiased payment signal.** Someone who is not the author pays — only relevant once monetization is on the table.

---

## 7. NFRs / cross-cutting

Constraints that apply across all features.

### Platform & stack

- **NFR1** — Web app on the existing stack (React 18 / Vite / Tailwind / shadcn). No new runtime dependencies without strong justification — the lean (~17) dependency set is deliberate.
- **NFR2** — For v1, task data persists via the Base44 cloud backend (already working, with cross-device sync). See Data ownership below for the intended future direction.

### Calm by construction (brand rules as engineering constraints)

- **NFR3** — Every animation respects `prefers-reduced-motion`; the state change is always shown, the motion is optional.
- **NFR4** — Reactions are fast and self-dismissing (~1.5s), never blocking modals, and never network-gated — wins fire optimistically, before the save completes.
- **NFR5** — Calm visual language: no red/alarm colours (including for carried-forward tasks); design tokens only, no hardcoded hex.
- **NFR6** — Optimistic feedback is honest: if a save fails, the optimistic win/count rolls back correctly.

### Notifications

- **NFR7** — No push notifications by default. If offered at all, push is an opt-in settings toggle that **always starts off** and is only ever enabled by the user. Akha pulls the user back by being calm, never by nagging.

### Accessibility & personalization

- **NFR8** — Multiple colour palettes, each with a matching coloured creature — including a white option and colourblind-friendly palettes.
- **NFR9** — The app is extensively customizable from a **settings** surface (not onboarding). Onboarding stays minimal; depth lives in settings.

### Data ownership (privacy)

- **NFR10** — **Privacy is a core value.** v1 stores data in Base44 as **private, single-user** data (the user's own data, not shared).
- **NFR11** — **Target architecture (future, documented goal):** local-first storage that stays on-device by default; any cross-device sync should be device-to-device, reaching a cloud **only if the user explicitly chooses**. This is the intended direction; v1 does not yet implement it (it remains on Base44 cloud — a known gap to be resolved in the architecture phase).

### Engineering safety net

- **NFR12** — New core logic (task ordering, day-end sweep, archive retention, subtask reveal) lands largely in `src/lib`, which ESLint and the typecheck config do **not** cover — Vitest is the only safety net there. These modules must ship with unit tests. Any Base44 schema change (e.g. archive retention) must be verified to round-trip via a real read before wiring into the app (the documented "Nidus" silent-sync failure mode).

---

## 8. Glossary

- **Focus view** — the single-task "doing" surface (FR11–16). Also informally "the doing"; this document standardizes on *focus view*.
- **Capture / planning surface** — the neutral, creature-passive screen where tasks are added and prioritized (UJ-2, FR4–10).
- **The creature** — the companion character; warm during *doing*, passive during *planning*.
- **Progress wheel** — the daily accumulation indicator (FR16/FR25); shows progress made, never progress remaining.
- **Archive** — the calm "what I did" history of completed work (FR22–23, FR26).
- **"I'm done for today"** — the explicit gesture that ends the day and triggers the creature's sigh (FR19).
- **The builder** — the target user (Ryan); someone moving real, identity-level goals.

---

_Discovery complete. All eight sections drafted. Ready to close._
