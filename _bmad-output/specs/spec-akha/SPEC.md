---
id: SPEC-akha
companions:
  - glossary.md
  - ../../planning-artifacts/ux-designs/ux-akha-2026-06-30/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-akha-2026-06-30/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-akha-2026-06-30/ARCHITECTURE-SPINE.md
  - ../../project-context.md
sources:
  - ../../planning-artifacts/prds/prd-akha-2026-06-29/prd.md
  - ../../planning-artifacts/prds/prd-akha-2026-06-29/addendum.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents in frontmatter are traceability only — consult them for narrative rationale this contract intentionally omits.
>
> Companion roles: **DESIGN.md** (visual identity — 7 schemes, tokens, components), **EXPERIENCE.md** (behavior, states, the reaction ladder, flows), **ARCHITECTURE-SPINE.md** (how it is built — invariants AD-1..12), **glossary.md** (terms), **project-context.md** (codebase rules). Where DESIGN/EXPERIENCE win on look-and-behavior detail and the architecture spine wins on structure.

# Akha — Calm Task Companion (v1)

## Why

**A vision to realize, against a real pain.** The builder — someone moving identity-level goals (the novel, the business, the body) — finds plain checkbox apps too cold and companion apps too childish and loud. Opening a normal to-do list, the whole backlog hits at once and the dread takes over *before any work is done*. Akha exists to make the felt sense **satisfaction and contentment, never overwhelm**: a warm, restrained creature that offers quiet encouragement as real tasks get finished, protecting the user from his own backlog rather than merely storing it. v1 is deliberately **build-for-yourself** and unmonetized — judged by the author's own felt experience, not by an audience.

## Capabilities

- **CAP-1 — First-run setup**
  - **intent:** A new user picks the name to be called by, a colour scheme, and a creature (from presets), then gets a brief warm welcome and a one-time first-open beat — no tutorial, no required task.
  - **success:** A fresh install completes onboarding with only those three choices; the first-open beat plays once, self-dismisses, and never blocks adding a task. *(FR1–3, FR24, NFR8–9)*

- **CAP-2 — Capture & prioritize**
  - **intent:** The user adds tasks at any time, assigns each a priority 1–5, decomposes them into one-level subtasks (nudged, never forced), and edits or deletes freely — on a neutral Plan surface where the full list may show and the creature stays passive.
  - **success:** A task created on Plan with a priority and subtasks persists and later surfaces in Focus in the correct order. *(FR4–10)*

- **CAP-3 — One-task Focus**
  - **intent:** During execution, only the single highest-ranked incomplete task is shown; the rest of the backlog is off-screen.
  - **success:** With more than one incomplete task, Focus renders exactly one — the top of effective order (priority 5→1, then due-date sooner-first date-only, then order added, with manual rearrange as a global override) — and never the full backlog. *(FR11–12)*

- **CAP-4 — Subtask reveal & completion**
  - **intent:** Subtasks reveal two at a time with exactly one active; completing the active one removes it, flows the next up, and expands the following — firing the quiet tier-1 reaction (gentle smile + a brief line).
  - **success:** At most two subtasks are shown and exactly one is active; on completion the finished item disappears and the next becomes active. *(FR13–14)*

- **CAP-5 — Whole-task win**
  - **intent:** Completing the last subtask (or a no-subtask line) auto-completes the task: it dims but stays visible, sinks to the bottom, the accumulation-only progress wheel grows, and the creature does a little dance (tier-2).
  - **success:** The final subtask auto-ticks the parent, dims-and-sinks it, and advances the wheel with **no** denominator, percentage, or "remaining." *(FR15–16, FR25)*

- **CAP-6 — End the day on demand**
  - **intent:** An explicit, optional "I'm done for today" gesture — never auto-triggered by an empty list — sweeps the dimmed completed tasks into the Archive and the creature lets out a deep, slow sigh (tier-3).
  - **success:** The control is present regardless of list state; tapping it moves completed tasks to the Archive and plays the sigh; capturing a late task afterward is still possible. *(FR19)*

- **CAP-7 — Calm carry-forward**
  - **intent:** Incomplete tasks carry to the next day, gently marked "still needs doing" — never "overdue," never red or a badge.
  - **success:** A carried task shows a fixed calm treatment plus a persistent non-colour "still needs doing" label; the treatment is identical whether one or many carry, and never intensifies with age or volume. *(FR21)*

- **CAP-8 — Archive review**
  - **intent:** Completed work is retained and viewable as a calm "what I did" history.
  - **success:** The Archive is a flat reverse-chronological list of completed tasks only — its structure makes totals, per-day tiles, calendar grids, streaks, and any scoreboard aggregate impossible to render. *(FR22–23, FR26)*

- **CAP-9 — Personalize via Settings**
  - **intent:** Name, colour scheme (7: four dark, three light, including a white option and a colourblind-safe option), creature, and a notifications toggle are all editable after onboarding; the push toggle always starts off.
  - **success:** Changing the scheme in Settings re-skins every surface live via tokens; the push toggle defaults off and is only ever enabled by the user. *(FR3, NFR7–9)*

## Constraints

- **The restraint contract is the gate** (bends every decision; any feature failing a line does not ship). Akha will never: **(1)** show streaks or streak-penalties; **(2)** shame the user (no "you missed," no red overdue, no nags); **(3)** guilt absence (no decay, no "you've been gone"); **(4)** take over independence (no prescribed, preloaded, or default tasks); **(5)** overwhelm during execution (the full backlog is never shown while working); **(6)** be loud or cutesy (no confetti, hype, gacha, or baby-talk); **(7)** paywall the core feeling; **(8)** creep into a feature pile.
- **Calm by construction.** Every animation gates on reduced-motion and always shows the end-state; reactions are optimistic and self-dismissing (~1.5s), never blocking or network-gated, and roll back honestly on save failure; **no red/alarm colour anywhere in the loop**; a single chromatic accent (~10% of screen); success-green means *completion* only; design tokens only, no hardcoded hex. *(NFR3–6, DESIGN.md)*
- **Notifications off by construction.** No push in v1; the PWA service worker never registers push; if ever offered, push is an opt-in Settings toggle that starts off, its content bound by no-shame/no-absence. *(NFR7)*
- **Lean stack, build-for-yourself.** ~17-dependency runtime set; no new runtime dependency without strong justification. Built on the shipped React 18 / Vite 6 / Tailwind / shadcn / TanStack Query / Base44 stack; JS/JSX only. *(NFR1)*
- **Privacy & data ownership.** v1 persists on Base44 as private, single-user data; **local-first on-device-by-default is the documented target, not v1.** *(NFR10–11)*
- **Engineering safety net.** New core logic lands in `src/lib` (ESLint/typecheck do not cover it — Vitest is the only net) and ships with unit tests; any Base44 schema change is round-trip-verified via a real read before wiring (the "Nidus" silent-sync failure). *(NFR12)*
- **How it is built is governed by `ARCHITECTURE-SPINE.md` (AD-1..12)** — port-and-adapter persistence, derived read-state, the `archived_at`/`completed_at` lifecycle, the reaction channel, token theming + creature recolor. Downstream obeys those invariants.

## Non-goals

- **Recurring tasks.** The recurrence engine stays built-but-unwired; the user has no repeating tasks.
- **Create-your-own creature.** Onboarding offers presets only.
- **Time-of-day on tasks.** Due dates are date-only `YYYY-MM-DD`; time-of-day is out of scope.
- **A streak / statistics page.** Killed by design — it *is* the guilt engine.
- **AI assistant as the product's basis.** Killed; AI may only ever be an optional add-on, never the foundation or a gate on the free core.
- **Mass-market scale.** Deliberately set aside for v1; the product is niche and build-for-yourself.
- **Monetization / a paid tier.** v1 is unmonetized; the core feeling is always free. (Any future paid tier touches only convenience/portability.)
- **Category UI.** The shipped `Task.category` field is kept (no migration) but never surfaced; v1 is pure-priority.
- **Cross-device pref sync & full offline.** Deferred per the architecture spine; prefs are local-only and v1 is Base44-online.

## Success signal

**The day inverts.** Over a stretch of real use, the morning's dread becomes the evening's contentment — the user reaches for "I'm done for today" (and the creature's deep, slow sigh) more often than abandoning the app mid-list. Tasks actually get **finished, not just organized**, without the user ever facing the wall of everything owed; and opening Akha reliably *lowers* load rather than raising it. The product is failing — even if usage looks healthy — if any counter-metric moves: anxiety-on-open, backlog-dread avoidance, or engagement propped up by guilt.

## Assumptions

- A no-subtask task completing fires the **whole-task (tier-2)** reaction, not the subtask tier *(EXPERIENCE.md; confirmed by Ryan, revisit at build only if needed)*.
- Priority is hidden in the Focus view (set during planning, drives order silently) *(confirmed; revisit at build only if needed)*.

## Open Questions

- The delivery shell is an **installable PWA** (architecture decision of record), which **supersedes** the UX spines' `[ASSUMPTION]` of a WebView-wrapped native app — the UX `DESIGN.md`/`EXPERIENCE.md` should be updated to match.
- No CI quality gate is defined yet; a pre-merge `lint + vitest + build` gate is the obvious first one *(architecture open item)*.
