---
name: Essence
description: Information architecture, behavior, states, interactions, and journeys for Essence.
status: final
created: 2026-06-30
updated: 2026-06-30
design_ref: ./DESIGN.md
sources:
  - ../../prds/prd-essence-2026-06-29/prd.md
  - ../../../project-context.md
---

# Essence — Experience Spine

> A calm task companion that grew up. The product is a *feeling* — satisfaction from visible progress, delivered with genuine restraint, tied to the user's own real goals. This spine captures the behavior, states, and journeys that produce that feeling. Visual identity (colour schemes, type, depth, component looks) lives in `DESIGN.md`; this spine references its tokens by name via `{path.to.token}`.

## Foundation

Form factor = **MOBILE** (iOS + Android), shipped as an **installable PWA** (web manifest + service worker for install + auto-update; the service worker never registers push — AD-12). _(Supersedes the earlier "WebView-wrapped app" assumption, per the architecture's decision of record — ARCHITECTURE-SPINE.md AD-1 / Structural Seed.)_ Built on the existing stack: React 18 / Vite / Tailwind / shadcn "new-york" (Radix) + framer-motion + lucide-react. No new runtime dependencies without strong justification — the lean (~17) dependency set is deliberate (NFR1). `DESIGN.md` is the visual identity reference; this spine is the experience and wins on behavioral conflict.

Two cross-cutting laws sit above every surface:

- **Reduced-motion is always honored.** Every animation gates on `prefers-reduced-motion` / OS setting; the state change is always shown, the motion is the only thing dropped (NFR3 / FR20).
- **Feedback is optimistic and self-dismissing.** Reactions fire immediately on tap (before the save returns), last ~1.5s, never block behind a modal, and never gate on the network. If a save fails, the optimistic win and any wheel growth roll back honestly (NFR4 / NFR6).

The felt brief: **satisfaction and contentment, never overwhelm.** The wall-of-tasks view is the enemy; what the user sees first, and how little of it, is a product decision.

> 🖼️ **Rendered reference:** the hero **Focus**, **Onboarding**, and **Plan** surfaces (Deep Sea) are mocked in [mockups/key-screens.html](mockups/key-screens.html); all 7 colour schemes in [mockups/palette-schemes.html](mockups/palette-schemes.html). Visual details in `DESIGN.md`. These mocks are references; **the spines win on any conflict.**

## Information Architecture

Four surfaces, plus onboarding. Bottom navigation with a center **+FAB** as the single create path.

| Surface | Reached from | Purpose | Shipped page it absorbs |
|---|---|---|---|
| **Focus** (home `/`) | App open (cold) | The one-task "doing" view. Highest-ranked task only; the rest of the backlog is off-screen. The creature and progress wheel live here. | Today (the list is replaced by single-task focus) |
| **Plan** | Bottom nav | Full backlog + capture. Neutral utility — the whole list *may* be visible here; the creature sits passively. | Upcoming + Browse (merged) |
| **Archive** | Bottom nav | Calm "what I did" — completed work only, as proof of progress. | Completed |
| **Settings** | Bottom nav | Personalization depth + account/privacy. | Settings |

**Bottom nav:** Focus · Plan · **+FAB** (center) · Archive · Settings. The **+FAB never directly creates** — it is the single create path that focuses the quick-input (`#task-quick-input`) on the Plan surface. The full backlog **never appears on the Focus surface** (restraint contract §5).

**Modal depth:** one level deep, never two (consistent with the lean shipped layout).

### Ordering rule (where it applies)

The order the Focus view picks "the next task," and the default order of the Plan backlog:

1. **Priority** 5 → 1 (5 = most important)
2. then **due date**, sooner-first (date-only `YYYY-MM-DD`)
3. then **order added**, earliest-first
4. **manual rearrange** — always available as an override (FR12)

Priority is *set during planning* and drives ordering silently. It is **hidden in the Focus view** — the doing surface never shows the number, so no ranking-pressure is imported into the moment of doing. `[ASSUMPTION]` Priority-hidden-in-Focus is the memlog default (confirmed by Ryan; revisit at build only if needed).

`[NOTE FOR ARCHITECTURE]` The Base44 Task entity has **no priority field** (FR5 needs 1–5) and **no explicit order/sort field** (FR12 manual-rearrange override needs one). Both are schema gaps to resolve in the architecture phase, not here.

`[NOTE FOR ARCHITECTURE]` `Task.category` (Work/Personal/Shopping/Health/Other) exists in shipped data but the PRD model is purely priority-driven and never surfaces category in v1 UI. Keep the field (no migration), show no category UI. Tints remain available if revived later.

## Voice and Tone

Microcopy register only; aesthetic posture lives in `DESIGN.md`. Warm, brief, quiet, plainspoken. **Never cutesy, never baby-talk, no hype, no exclamation pile-ups** (brand rule 6).

| Do | Don't |
|---|---|
| "Nice." / "That's one done." / "Good move." | "🎉 You crushed it!" / "Amazing!!!" |
| "Onward." / "Mm — well done." / "There you go." | "Keep that streak alive!" |
| "Here with you today." (idle line) | "You've been gone — come back!" |
| "Still needs doing." (carry-forward) | "Overdue" / "You missed this" / red badge |
| "Nothing here yet — add your first when you're ready." (empty) | "Get productive! Click below to start." |

- **Kept companion lines** (the register, set by event type — see Interaction Primitives): `Nice.` · `That's one done.` · `Good move.` · `Onward.` · `Mm — well done.` · `There you go.`
- **Line selection is random/rotating within a tier.** Which line shows is **never chosen by completion count, sequence position, or "how the day is going"** — there is no escalating or "earned" line. This closes the variable-reward loophole: the reward cannot be tuned to make the user chase it.
- **Idle line** (creature, passive): `Here with you today.`
- **Welcome message intent** (FR2): brief, warm, encouraging — names the space as *his*, makes no demand, sets no task. A single calm greeting after onboarding, not a tour.
- **Carry-forward phrasing** (FR21): a quiet *"still needs doing."* Never the word "overdue," never red, never a count.
- **Empty-state copy:** invites, never instructs or pressures. The empty Focus surface after onboarding is a calm space, not a to-do prompt.

## Component Patterns

Behavioral only. Visual specs live in `DESIGN.md` (`{components.card}`, `{components.subtask-card}`, `{components.checkbox}`, `{components.progress-wheel}`, `{components.companion}`, `{components.button-primary}`).

| Component | Surface | Behavioral rules |
|---|---|---|
| **Focus task card** | Focus | Shows exactly one task — the highest-ranked (FR11). Subtasks collapsed beneath it on arrival. Tap the subtask dropdown to reveal. Built on `{components.card}`. |
| **Two-subtasks-at-a-time reveal** | Focus | On expand, the **first two** subtasks appear, not all (FR13). **Exactly one** subtask is active/expanded at any moment. Completing the active subtask: it **disappears**, the next flows up, and the following incomplete subtask **expands** to become active (FR14). Cards use `{components.subtask-card}`. Fires the subtask-tier reaction. |
| **No-subtask task** | Focus | Behaves as one completable line. Checking it auto-completes the whole task and fires the **task-tier** reaction (whole-task win), not the subtask tier. `[ASSUMPTION]` Memlog default (confirmed by Ryan; revisit at build only if needed). |
| **Progress wheel** | Focus | A circular accumulation ring filled in `{colors.accent}`, near the creature. **Accumulate-only**: it fills as the day's completions rise and never shows a denominator, percentage, "remaining," shortfall, number, or cross-day comparison (FR16 / FR25). It can keep counting; it can never imply how much is left. The ring has **no full/closed state and no closure animation** and **never visually completes within a day** — it accrues continuously so fullness never reads as a finish line. It is **ambient proof, not a goal**: peripheral and subordinate in scale to the one task, it is the calm counter-metric to anxiety-on-open, not a target to hit. On a completion, the eye should land on the **win (the task)**, never the ring. Uses `{components.progress-wheel}`. `[NOTE FOR ARCHITECTURE]` Shipped Companion.jsx renders a horizontal bar driven by a `RING_TARGET=8` constant — **delete that constant entirely** (a target denominator is forbidden, not merely re-skinned); the wheel is the intended form and the bar is a placeholder to replace. |
| **+FAB create path** | Global (nav) | Center FAB focuses the Plan quick-input; it is the only way to start a capture. Never opens a creation modal directly. |
| **Manual rearrange** | Plan | Drag-to-reorder the backlog as an override on the computed order (FR12). Applies on Plan, not Focus. `[ASSUMPTION]` Interaction = long-press-then-drag on a Plan row; exact gesture unconfirmed — confirm at build. |
| **Decompose nudge** | Plan | The decomposition nudge (FR7) is a **single passive affordance** — placeholder / hint text inviting subtasks. It is **never** a recurring prompt, **never** a warning or "incomplete: no subtasks" state, **never** blocks save, and **never** appears on the Focus surface. Subtasks stay optional and editable later (FR6). |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| **Active task** | Focus | The one highest-ranked task card, subtasks collapsed. Creature smiles a soft greeting on open (FR18), never pounces. |
| **Just-completed (dimmed & sinking)** | Focus | On auto-complete, the task **dims (reduced opacity) but stays visible**, the progress wheel updates, the creature does a little dance, then the task **drops to the bottom** of the full list (FR15). The wheel update is **ambient proof, not a goal** — it never visually completes, has no closure animation, and stays subordinate in scale so the eye lands on the **win (the task)**, not the ring. Optimistic and self-dismissing — never network-gated. |
| **All-caught-up (not ended)** | Focus | No more incomplete tasks, but the day is **not** ended (no "I'm done for today" yet). Calm resting state; the creature idles ("Here with you today."). Capturing a late task is never discouraged — the day only ends on the explicit gesture (FR19). |
| **Truly empty (post-onboarding)** | Focus | First open with zero tasks. The **first-open beat** plays once: a small warm intro creature beat that previews the feeling, self-dismisses, and does not block adding a task (FR24). |
| **Carry-forward highlight** | Focus / Plan | Incomplete tasks carry to the next day with a **fixed, calm highlight** in `{colors.carryforward}` = "still needs doing." Never red, never a badge, never labelled overdue. The treatment **never intensifies, accumulates, counts up, or escalates** as a task ages (FR21). **Aggregate non-escalation:** the highlight is **identical regardless of how many tasks carry** — per-task visual weight never changes with the count, and on the Plan surface a mass of carried tasks must **not read as an alarm field** (no compounding tint, no field-level emphasis). Every surface the state appears on carries a persistent non-colour **"still needs doing"** label so the meaning never depends on colour alone. |
| **Plan — empty** | Plan | Calm invitation to capture; no pressure, no tutorial. |
| **Plan — populated** | Plan | Full backlog visible (allowed here — the wall is forbidden only during *execution*). Creature passive, no reactions (FR8). |
| **Archive — empty** | Archive | "Nothing here yet" calm message; no scoreboard scaffolding. |
| **Archive — populated** | Archive | Completed work only, as a calm history (FR22–23). **Never** totals, per-day tiles, calendar grids, streaks, or aggregate/cadence views — the structure itself makes a scoreboard impossible (FR26). |
| **End-of-day sweep** | Focus → Archive | On "I'm done for today," dimmed completed tasks **slowly clear** from Focus into the Archive (FR19). |
| **Loading / optimistic / rollback** | All | Wins fire optimistically before save; on save failure the win/count rolls back correctly and honestly (NFR4 / NFR6). Reduced-motion shows the resulting state without the motion. |

`[NOTE FOR ARCHITECTURE]` New core logic (ordering, day-end sweep, archive retention, subtask reveal) lands in `src/lib`, which ESLint/typecheck do not cover — Vitest is the only safety net; these modules ship with unit tests (NFR12). Any Base44 schema change must be verified to round-trip via a real read before wiring (the "Nidus" silent-sync failure mode).

## Interaction Primitives

- **Tap to complete.** The recessed checkbox (`{components.checkbox}`, success-green done state) toggles completion with an optimistic update. "Done" must be signalled by the **white check glyph + line strike-through** — these are required, non-colour signals. Success-green colour **alone is never sufficient** to mean done (mirrors `DESIGN.md`).
- **Subtask reveal.** Tap the dropdown to expand; exactly one active subtask at a time; completed subtask vanishes and the next expands (FR13/FR14).
- **The three-tier reaction ladder** (FR17) — proportional, always quiet, set by **event type only**, flat within each tier:

  | Tier | Event | Treatment | Creature |
  |---|---|---|---|
  | 1 | Subtask complete | item disappears, next flows up | gentle smile + brief line |
  | 2 | Task complete (all subtasks, or a no-subtask line) | auto-ticks, dims & stays, sinks to bottom, **progress wheel updates** (ambient proof, not a goal — never full, no closure animation; the eye lands on the win, not the ring) | a little dance (brief, small, low-amplitude — never confetti-scale) |
  | 3 | "I'm done for today" (manual) | dimmed list slowly clears → Archive | smile + **deep, slow sigh** |

  Reactions **never intensify** by priority, milestone, or volume. There is no escalation within a tier and no "bigger win" for a higher-priority task.

- **"I'm done for today"** (FR19) — an **explicit, optional** gesture, **never auto-gated on an empty list**. Its presence and affordance are **constant and unconditional**: it is available while tasks are still incomplete and is never gated on an empty or completed list — the user ends *on his terms*, not when the app decides the list is finished. It triggers the end-of-day sweep into Archive and the creature's sigh. Because it is manual, capturing a task late in the day is never discouraged.
- **Day-end sweep** — the sweep is a consequence of tier-3 only; nothing auto-clears the page on its own.

- **Banned everywhere:** confetti / hero celebrations, badge counts, streak counters, push-notification re-engagement, the full backlog on the Focus surface, any reaction that scales with priority or volume.

## Accessibility Floor

Behavioral; visual contrast lives in `DESIGN.md`.

- **Reduced-motion always shows the state without the motion.** When motion is reduced, every animation resolves to its end-state instantly — the state change is always shown, only the motion is dropped (NFR3 / FR20). Idle/ambient loops and intro beats resolve to a **static resting pose** (never a frozen mid-motion frame), and any informational content an intro beat carried must still be conveyed statically — never silently dropped. Complete mapping:

  | Animation | Reduced-motion end-state |
  |---|---|
  | Greeting smile (FR18) | Creature shown already in its soft resting smile on open — no animated transition in. |
  | Breathing idle (ambient loop) | **Static resting pose** (mid-breath neutral); no looping, not frozen mid-motion. |
  | Subtask smile (tier 1) | Completed item already removed, next subtask already active; brief line shown statically. |
  | Little dance (tier 2) | Task already dimmed and sunk to bottom; wheel already at its new level — no dance played. |
  | Dim-and-sink (FR15) | Task shown already dimmed and already at the bottom of the list. |
  | Wheel growth | Ring shown already at its new accrued level — no animated fill. |
  | First-open beat (FR24) | Resolves to a **static resting pose**; the preview-of-the-feeling content is still presented statically (e.g. a held warm pose/line), **never silently dropped**. |
  | Deep, slow sigh (tier 3) | Creature shown already in its settled resting pose; the "resting with him" feeling conveyed as a static pose. |
  | End-of-day sweep (FR19) | Completed tasks shown already cleared from Focus into Archive — no sweep motion. |
- **Colourblind-safe scheme available** — the onboarding palette set includes an Accessible (colourblind-safe) scheme, selectable in Settings (NFR8). `{colors.accent}` carries no information that colour alone must convey.
- **No-red / no-shame principle as accessibility-of-affect** — carry-forward, incomplete work, and absence never use alarm colour or shaming language. Calm is treated as an accessibility commitment, not only an aesthetic one (NFR5, brand rules 1–3).
- **Tap targets** ≥ 44pt (iOS) / 48dp (Android) for checkboxes, nav items, the FAB, and subtask cards. Additionally: the **subtask disclosure/expand control** hit area meets the floor; the **recessed checkbox hit target extends ≥ 44pt / 48dp beyond its visible rim** (the visual recess never shrinks the touch target); and the **manual-rearrange drag handle** has an adequate grab zone meeting the floor.
- **Focus order** follows reading order on every surface; the topmost dropdown/sheet closes first. On **any list mutation**, focus moves to a **defined successor element, never to `body`**. The **+FAB sets focus to `#task-quick-input`** on open and **restores focus to the FAB** on dismiss. **Sheets/dropdowns are dismissible by Esc and the Android back button**, closing **topmost-first**. The **day-end sweep returns focus to a stable Focus/Archive anchor**.
- **Notifications off by default** — if offered at all, push is an opt-in Settings toggle that **always starts off** and is only ever enabled by the user (NFR7). Essence pulls back by being calm, never by nagging. If the user opts in, the notification **content** is itself bound by **brand rules 2 and 3** — never shame, never absence/"you've been gone" copy.
- **Screen reader:** every interactive element labeled with role + state; completion announces the resulting state (e.g. "done").
  - **Progress wheel:** `role="img"` with an `aria-label` that contains **no number, percentage, or remaining count** (e.g. "Today's progress — growing"), plus `aria-live="polite"` so growth is announced. It is **explicitly NOT `role="progressbar"`** — a progressbar's `aria-valuenow`/`aria-valuemax` would leak a denominator and violate FR25.
  - **Subtask completion:** move focus to the **next active subtask** and announce **"done"** plus the new active item.
  - **Dim-and-sink:** keep focus on a **stable anchor**; reorder in the DOM (task to bottom) **without stealing focus**.
  - **Carry-forward:** carries an explicit `aria-label` **"still needs doing"** (the non-colour signal for screen-reader users).
  - `[ASSUMPTION]` Exact wording of remaining announcement strings unspecified — confirm at build.

## Key Flows

Protagonist = **Ryan**, the builder — 40, swamped, quietly dreading the day's list over morning coffee.

### UJ-1 — The morning session (working through the day)

1. **Arrival.** Ryan opens Essence, tired, not eager. The creature greets him with a soft smile and a brief encouraging welcome — it does not pounce (FR18).
2. **One thing, not everything.** He sees *only the first task*, subtasks collapsed. The backlog is off-screen (FR11).
3. **A gentle reveal.** He taps the dropdown; the **first two** subtasks appear, exactly one active (FR13).
4. **A small win.** He completes the active subtask. The creature smiles + a brief line ("Nice."). The completed item disappears, the next flows up, and the following incomplete subtask expands (FR14, tier 1).
5. **A whole task done.** The last subtask checked auto-completes the parent: it dims but stays, the progress wheel accumulates, the creature does a little dance, and the task sinks to the bottom (FR15, tier 2).
6. **The day closes — on his terms.** When Ryan decides he's done, he taps **"I'm done for today."** The dimmed tasks slowly clear into the Archive.
   - **Climax:** the creature smiles and lets out a **deep, slow sigh** — resting with him. The day inverts: the morning's dread becomes evening contentment. He ends *accomplished for what he did and encouraged to keep going*, having never faced the wall of everything he owes (tier 3).

Failure: completion save fails → the optimistic win and wheel growth roll back honestly; reduced-motion shows each state without the motion.

### UJ-2 — Capture / planning (creature passive)

1. **A utility moment, not a warm one.** Ryan opens Plan (ideally the evening before). The creature simply sits and waits — no engagement, no reaction; its warmth is reserved for the doing (FR8).
2. **Dump freely.** Via the **+FAB → quick-input**, he adds tasks. Seeing the full list here is fine — the wall is forbidden only during *execution* (FR4).
3. **Priority.** Each task gets a priority 1–5 (5 = most important), driving later Focus order silently (FR5).
4. **Decompose.** He breaks tasks into subtasks; Essence gently nudges decomposition up front via a **single passive affordance** (placeholder / hint text only) — never a recurring prompt, never a warning, never blocking save — and subtasks stay editable later (FR6/FR7).
5. **On the fly.** New tasks can be captured any time during the day, not just the night before (FR4).
   - **Climax (quiet):** the head is empty, tomorrow is out on paper, and the creature has stayed out of the way — planning as honest utility, no false cheer.

### UJ-3 — First open / onboarding

1. Ryan installs Essence and opens it with zero tasks.
2. He chooses the **name he wants to be called by** (FR1).
3. He selects a **colour scheme** (one of the 7; default Deep Sea) (FR1).
4. He selects a **creature** from presets — not create-your-own, which is deferred (FR1).
5. A brief, warm **welcome message** names the space as his and makes no demand (FR2).
6. **A first-open creature beat.** Even with an empty list, the creature performs a small warm intro beat — a preview of the feeling — that plays **once**, self-dismisses, and does **not** block adding a task (FR24).
   - **Climax:** no tutorial, no feature checklist — Ryan is dropped gently into a calm space that already feels like *his*.

`[NOTE FOR ARCHITECTURE]` Onboarding prefs (name-to-be-called, colour scheme, creature) have no home in the User entity (it stores only `role`). Persisting FR1/FR3 needs a user-prefs store — a schema gap to resolve in the architecture phase.

## Inspiration & Anti-patterns

The restraint contract (PRD §5) as experiential anti-patterns. Each is a gate: any future feature must pass every line, or it does not ship.

- **No streaks.** No streak counters, no broken-streak penalties, no streak/stats page. The streak page *is* the guilt engine and is rejected by design (rule 1, FR25/FR26).
- **No shame.** No "you missed," no red overdue labels, no nags. Incomplete work is a quiet "still needs doing," never an accusation (rule 2, FR21).
- **No absence-guilt.** Time away carries no penalty, decay, or "you've been gone" nag on return (rule 3).
- **No independence-takeover.** No prescribed tasks, no preloaded or default lists, no deciding the day for the user. The user plans; Essence supports (rule 4).
- **No execution-overwhelm.** The full backlog is never shown during the doing. One task at a time is a promise, not a default (rule 5, FR11).
- **No loud / cutesy.** No confetti, no hype, no gacha mechanics, no baby-talk. Reactions stay proportional and quiet (rule 6, FR17).
- **No paywalled core.** The companion, focus view, and win-moments are always free; monetization only ever touches convenience and portability, never the feeling (rule 7).
- **No feature-creep.** The moat is the feeling + restraint, not breadth. New surfaces are resisted on purpose (rule 8).
