---
title: "Architecture Spine — Reconciliation Review"
subject: ARCHITECTURE-SPINE.md (Akha v1)
against:
  - prd-akha-2026-06-29/prd.md
  - ux-akha-2026-06-30/DESIGN.md
  - ux-akha-2026-06-30/EXPERIENCE.md
reviewer: reconciliation pass (not a structural re-review)
created: 2026-06-30
status: final
---

# Reconciliation Review — Akha Architecture Spine

**Scope.** This pass does not re-review structure. It checks *what didn't land*: every `[NOTE FOR ARCHITECTURE]` / `[ASSUMPTION]` tag, quiet/tonal/restraint requirements the AD structure may have flattened, PRD restraint-contract lines and NFRs with no corresponding invariant, and any spine decision that contradicts an input.

---

## Verdict

**The spine is strong and resolves every hard `[NOTE FOR ARCHITECTURE]` schema gap and most tonal/restraint rules.** It carries the restraint contract as an explicit binding gate, deletes `RING_TARGET`, retires `winMoment`, fixes the persistence split-brain, and keeps the reaction channel flat. A small number of *quiet* requirements were flattened or dropped — none structural, all tonal/behavioral/a11y — that the AD layer should pick up before build. No spine decision contradicts an input.

---

## 1. `[NOTE FOR ARCHITECTURE]` and `[ASSUMPTION]` tags — resolution status

### `[NOTE FOR ARCHITECTURE]` tags (5 total)

| # | Tag (source) | Resolved? | Where |
|---|---|---|---|
| N1 | EXPERIENCE.md L56 — Task entity has no `priority` field (FR5) and no explicit `order`/sort field (FR12) | **YES** | AD-5: `priority` integer 1–5, `order` persisted manual-rearrange key. Also Structural Seed `Task.jsonc`. |
| N2 | EXPERIENCE.md L58 — keep `Task.category` (no migration), surface no category UI | **YES** | Deferred §"Category UI": kept, unsurfaced, no migration, tints available if revived. Matches exactly. |
| N3 | EXPERIENCE.md L88 — delete the shipped `RING_TARGET=8` constant entirely (not re-skin) | **YES** | AD-11 ("the shipped `RING_TARGET=8` constant is **deleted**, not re-skinned") + DESIGN progress-wheel + Structural Seed `winMoment.js RETIRED`. Strongly resolved. |
| N4 | EXPERIENCE.md L109 — new `src/lib` logic uncovered by ESLint/typecheck → Vitest only; schema changes round-trip-verified via real read ("Nidus") | **YES** | AD-4 (Vitest the only safety net for `src/lib`), AD-5 (round-trip-verified via real read, NFR12), Consistency Conventions "Lint scope gap" row. |
| N5 | EXPERIENCE.md L194 — onboarding prefs (name, scheme, creature) have no home in User entity → need a user-prefs store | **YES** | AD-6: prefs live local in `localStorage` behind `usePrefs`; never written to Base44. Structural Seed `usePrefs.js NEW`. |

**All 5 `[NOTE FOR ARCHITECTURE]` tags are addressed.**

### `[ASSUMPTION]` tags (5 total)

| # | Tag (source) | Resolved / carried? | Notes |
|---|---|---|---|
| A1 | EXPERIENCE.md L54 — priority hidden in Focus is the memlog default | **YES (adopted)** | AD-8: "Priority is hidden in Focus." Baked as invariant. |
| A2 | EXPERIENCE.md L87 — no-subtask task: checking it fires the **task tier** (whole-task win), not subtask tier | **PARTIAL — see Finding D2** | The spine's AD-9 sets tier "by event type only," and the Capability Map points FR15 at AD-9, but the spine **never explicitly states** that a no-subtask line completion is a *task-tier* event. The flat-within-tier rule is captured; the no-subtask→task-tier mapping is implicit, not pinned. |
| A3 | DESIGN.md L184 — mobile iOS+Android WebView-wrapped form factor | **PARTIAL — see Finding F1** | The spine assumes "Installable PWA" (Structural Seed, NFR1 note "PWA shell… manifest + minimal service worker"). The UX `[ASSUMPTION]` was **WebView-wrapped native app**. These are *different shells*. The spine silently re-decided this without flagging it as a changed assumption. Not necessarily wrong, but it contradicts the stated UX assumption and the safe-area/`.pb-nav`/`overscroll` evidence the UX cited. **Flag as a deliberate decision needing acknowledgment.** |
| A4 | EXPERIENCE.md L90 — manual rearrange gesture = long-press-then-drag, unconfirmed | **CARRIED (correctly deferred)** | Deferred §"Manual-`order` representation" handles the *data* (float gap-key vs integer reindex). The *gesture* itself is a UX/build detail, appropriately left to build. OK. |
| A5 | EXPERIENCE.md L157 — exact a11y announcement strings unspecified | **CARRIED (correctly deferred)** | Copy strings are not architecture; fine to leave. |

**Unresolved / partially-resolved `[ASSUMPTION]` tags: A2 (implicit, not pinned), A3 (silently re-decided — PWA vs WebView).**

---

## 2. Quiet requirements the AD structure may have flattened or dropped

Severity key: **HIGH** = a restraint/feeling guarantee with no structural enforcement and a plausible build path to violate it; **MED** = a real rule under-specified or only partially carried; **LOW** = nuance worth a line, low risk.

### D1 — Wheel "subordinate in scale" / "the eye lands on the win, not the ring" — **MED**
DESIGN.md (progress-wheel: "Subordinate in scale to the one task — ambient proof, never a goal") and EXPERIENCE.md (L88, L98, L120: "the eye should land on the **win (the task)**, never the ring") state this repeatedly as a felt rule. The spine's AD-11 enforces the *mechanical* guardrails (no `progressbar`, no denominator, `RING_TARGET` deleted, number-free `aria-label`) **but drops the scale/subordination rule entirely**. "Subordinate in scale" and "eye lands on the win" appear nowhere in the spine. This is a layout/visual-hierarchy invariant that an AD structure naturally flattens because it isn't a data or API rule. Risk: a build that satisfies every spine invariant but makes the wheel the visual hero (large, centered, animated on completion) would pass the spine and violate the design intent + the *anxiety-on-open* counter-metric. **AD-11 (or AD-10) should carry a one-line "wheel is subordinate in scale; the completion draws the eye to the task, not the ring" invariant.**

### D2 — No-subtask line completion fires the **task tier** — **MED**
(Same as A2 above.) FR15/FR17 and EXPERIENCE.md L87/L120 are explicit: a no-subtask task, when checked, must fire the **task-tier** reaction (little dance + wheel), not the subtask tier. AD-9 sets tier "by event type only" but never states this specific mapping. Without it, a build could plausibly fire the subtask tier (gentle smile) for a checkbox-only task. **AD-9 should pin: "completing a no-subtask task is a task-tier event."**

### D3 — Aggregate non-escalation of carry-forward ("no alarm field") — **MED**
EXPERIENCE.md L101 adds an explicit **aggregate** rule beyond per-task: "the highlight is **identical regardless of how many tasks carry**… on the Plan surface a mass of carried tasks must **not read as an alarm field** (no compounding tint, no field-level emphasis)." The spine has **no carry-forward invariant at all** — carry-forward appears only as a *derivation* in AD-3 (`incomplete && due_date < today`) and is mapped to `lib/dayEnd` + AD-11. The *no-escalation-by-volume* aggregate rule, the persistent non-colour "still needs doing" label, and the "never red/badge/count" treatment are **not carried as invariants** in the spine (they live only in DESIGN/EXPERIENCE). AD-11 bans red broadly ("No red/alarm colour anywhere in the task loop"), which covers colour but **not** the volume-aggregation / field-emphasis vector. Since the PRD calls this out (FR21: "never intensifies, accumulates, counts up, or escalates… no escalation by age *or* by volume"), it deserves a named invariant. **Add a carry-forward invariant: fixed treatment, identical regardless of count/age, persistent non-colour label, no field-level/aggregate emphasis.**

### D4 — Random/rotating companion line "no variable-reward loophole" — **MED**
EXPERIENCE.md L73 states a sharp restraint rule: companion line selection is **random/rotating within a tier**, *never* chosen by completion count, sequence, or "how the day is going" — explicitly "closes the variable-reward loophole." AD-9 enforces "flat within a tier (no intensify by priority/volume/milestone)" for the *reaction tier*, but says **nothing about line-selection** being non-adaptive. The variable-reward loophole is specifically about *which line* shows, not which tier fires. A build could legally (per the spine) make line choice "smarter" (escalating praise, streak-aware copy) and pass every invariant. This is a direct restraint-contract concern (rule 6, loud/cutesy + engagement-via-guilt counter-metric). **AD-9 should add: line selection within a tier is random/rotating, never adaptive to count/sequence/progress.**

### D5 — Accent text-contrast rule (`accent-text`, ≥4.5:1) — **MED**
DESIGN.md L148 is a hard, named a11y rule: accent is FILL / large-text / UI-component only (≥3:1), **never body-size text or links** (sub-AA ~3.5–3.9:1 in 4 of 7 schemes); small text/links use `highlight` (dark) or a darkened `accent-text` variant (≥4.5:1, light schemes). The spine's AD-10 captures "single-accent + semantic-success-only," "no hardcoded hex," and "≥3:1 silhouette/glow," but **drops the accent-text-contrast rule entirely**. There is no mention of `accent-text`, body-size-link prohibition, or the 4.5:1 floor. This is a genuine accessibility invariant (WCAG 1.4.3) tied to the token system the architecture owns. **AD-10 should carry: accent is never a body-text/link colour; small interactive text uses `highlight`/`accent-text` at ≥4.5:1.**

### D6 — Reduced-motion must not *silently drop* informational content (intro beat) — **MED**
EXPERIENCE.md L134/L144 adds a subtle requirement beyond "show end-state": for the first-open beat (FR24) and idle loops, the reduced-motion fallback resolves to a **static resting pose (never a frozen mid-motion frame)** AND **any informational content the beat carried must still be conveyed statically — never silently dropped.** AD-11 captures "always resolves to its end-state (state shown, motion dropped, never a frozen mid-frame)" — good — but does **not** carry the "informational content never silently dropped" clause, which is the part most easily missed in a build (a beat that exists *only* as motion has no end-state to show). **LOW→MED: extend AD-11 with "any information an animation-only beat conveyed must persist statically."**

### D7 — Glow is "never the sole reaction signal" — companion copy line always carries it — **LOW (mostly carried)**
DESIGN.md L171 + EXPERIENCE.md require the reaction glow to never be the only signal — the companion **copy line** always carries the reaction. AD-10 carries "the glow is **never** the sole reaction signal" — good. But the *positive* half — that the **copy line is the guaranteed non-glow carrier** — is implicit. AD-9 routes the tier event but doesn't state the line is mandatory on every reaction. Minor; the negative form in AD-10 mostly covers it. **LOW.**

### D8 — Completion never conveyed by green alone (white check + strike-through REQUIRED) — **MED**
DESIGN.md (checkbox) + EXPERIENCE.md L113 make this a *required* non-colour signal pair: "**white check glyph and the line strike-through are REQUIRED**… success-green colour **alone is never sufficient**." The spine touches non-colour signalling only for the *reaction glow* (AD-10) and the wheel `aria-label` (AD-11). The **checkbox done-state non-colour requirement is not carried anywhere** in the spine. This is a colourblind-accessibility floor (Accessible scheme, `forced-colors`). **MED: an invariant (AD-10 or AD-11) should state completion is signalled by check-glyph + strike, never colour alone.**

### D9 — Subtask active-state structural (non-colour) signal — **LOW→MED**
DESIGN.md (subtask-card) requires the active subtask to carry a **structural non-colour signal** (left indicator/accent bar + elevated/expanded state + "In progress — just this one." label) so it survives `forced-colors`/colourblind use; accent tint is "reinforcement, never the sole cue." The spine's AD-8 handles "≤2 subtasks revealed, one active" structurally but **does not carry the non-colour active-state requirement**. Same `forced-colors` accessibility family as D8. **LOW→MED.**

### D10 — "Modal depth: one level deep, never two" — **LOW**
EXPERIENCE.md L43 states a structural constraint (modal depth one level, never two; +FAB never opens a creation modal directly, focuses quick-input). The spine captures the +FAB→quick-input path in the Structural Seed comment but **not the one-level-modal-depth invariant**. Minor structural rule; worth a line in Consistency Conventions. **LOW.**

### D11 — Creature passive during planning (no reactions on Plan) — **LOW (carried via mapping, not invariant)**
FR8 / UJ-2 / DESIGN companion: the creature is **passive during planning, reacts only during doing**. The spine's AD-9 emits reactions from the task store at transitions, and the reaction channel is subscribed by Companion — but nothing states the **Plan surface suppresses reactions**. Since Plan mutations (creating tasks) go through `useTasks` too, an emit-on-every-mutation build could fire reactions during capture. The PRD restraint here is real ("warmth is reserved for the doing"). **LOW→MED: AD-9 should note reactions fire on completion transitions only, not on capture/edit — or that the Companion is absent/passive on Plan.**

---

## 3. PRD restraint-contract lines & NFRs vs. invariants

### Restraint contract §5 (8 lines)

| Rule | Covered by an invariant? | Notes |
|---|---|---|
| 1. No streaks/streak penalties | **YES** | AD-3 (derived, no stored counter; `winMoment` retired), AD-11 (no `progressbar`/denominator, `RING_TARGET` deleted), AD-7 (archive). Strong. |
| 2. No shame (no red/overdue) | **PARTIAL** | AD-11 bans red in the loop. But carry-forward aggregate/label treatment not carried (D3). Colour covered; structure under-specified. |
| 3. No absence-guilt / decay | **GAP — see below** | **No invariant addresses absence-guilt.** There is no decay/age-driven behavior in the system by construction (AD-7 archives only on explicit gesture; carry-forward is a flat derivation), so it is *structurally* unlikely — but the spine never states "no time-since-last-open behavior, no decay, no return-nag." NFR7 (notifications) is the related vector and is **also not carried** (see NFR table). **Flag.** |
| 4. No independence-takeover (no prescribed/preloaded tasks) | **YES (implicitly)** | AD-8 (Focus renders existing highest-ranked task; no generation), nothing preloads. Not a named invariant but structurally enforced. |
| 5. No execution-overwhelm (one task at a time) | **YES** | AD-8 "Focus surface renders exactly one task; full backlog only on Plan." Strong, explicit. |
| 6. No loud/cutesy (no confetti/gacha) | **YES (partial)** | AD-9 (flat tiers), AD-11 (motion gating). But the **variable-reward line loophole (D4)** is the gacha-adjacent vector and is not carried. |
| 7. No paywalled core | **N/A v1** | PRD §6: v1 not monetized. No invariant needed; correctly absent. |
| 8. No feature-creep | **YES (posture)** | NFR1 note ("no new runtime dependency without strong justification"), Deferred section disciplines scope. |

**Restraint-contract gaps: rule 3 (absence-guilt) has no explicit invariant; rule 2 partial (carry-forward aggregate D3); rule 6 partial (variable-reward line D4).**

### NFRs (NFR1–NFR12)

| NFR | Covered? | Notes |
|---|---|---|
| NFR1 — lean ~17-dep stack, no new deps | **YES** | Stack section + explicit NFR1 note. PWA shell named as the only new surface area. |
| NFR2 — Base44 cloud persistence v1 | **YES** | AD-1, Structural Seed. |
| NFR3 — reduced-motion always shows state | **YES** | AD-11. Strong. |
| NFR4 — fast self-dismissing (~1.5s), never blocking, never network-gated | **PARTIAL** | AD-2 ("Feedback fires before the save returns; never network-gated, never a blocking modal") carries the network/blocking half. The **~1.5s self-dismiss duration** is dropped — arguably a UX-timing detail, but NFR4 names it. **LOW.** |
| NFR5 — no red/alarm, tokens only, no hardcoded hex | **YES** | AD-10, AD-11, Consistency Conventions (Styling row). Strong. |
| NFR6 — optimistic rollback is honest | **YES** | AD-2 (rollback to `ctx.previous`, invalidate on settle). Strong. |
| **NFR7 — no push by default; opt-in toggle starts off; opt-in content bound by brand rules 2&3** | **GAP** | **Not carried by any invariant.** Notifications/push appear nowhere in the spine. EXPERIENCE.md L151 even adds that opt-in notification *content* is bound by no-shame/no-absence rules. v1 may have no notifications at all, but the spine should at least state "no push surface in v1; if added, off-by-default + content bound by restraint contract" so the constraint isn't lost. **MED.** |
| NFR8 — multiple palettes + matching creature, white + colourblind options | **YES** | AD-10 (7 schemes, token-driven), creature recolor strategy resolved (filter retint over one art set). Strong — and resolves the DESIGN "creature-recolor constraint (referenced, not solved)" open item. |
| NFR9 — extensive customization in Settings, not onboarding | **PARTIAL** | AD-6 stores prefs and FR3 (editable later) is in the Capability Map (Onboarding row → Settings implied). But the **onboarding-minimal / depth-in-Settings split** isn't stated as an invariant. **LOW.** |
| NFR10 — privacy, private single-user data | **YES** | AD-1, AD-6, Structural Seed ("private, single-user"). |
| NFR11 — future local-first target | **YES** | AD-1 port + Deferred §Local-first. Strong — the port is the whole point. |
| NFR12 — `src/lib` tests + Nidus round-trip verify | **YES** | AD-4, AD-5, Consistency Conventions. Strong. |

**NFR gaps: NFR7 (notifications) wholly uncarried — MED; NFR4 self-dismiss timing — LOW; NFR9 onboarding/Settings split — LOW.**

---

## 4. Spine decisions that contradict an input

- **No hard contradictions found.** The spine's decisions are consistent with the PRD/UX on every load-bearing point (schema, ordering, archive-on-gesture-only, derived state, reaction tiers, theming).
- **One silent re-decision (not a contradiction, but unacknowledged): PWA vs WebView (A3 / F1).** DESIGN.md L184 and EXPERIENCE.md L18 state the form factor as an **iOS+Android WebView-wrapped app** (an `[ASSUMPTION]` from shipped evidence). The spine instead specifies an **installable PWA** (Structural Seed "Installable PWA (client)"; NFR1 note "The PWA shell (manifest + minimal service worker) is the only new surface area v1 adds"; Deferred §"Full offline PWA"). These are different delivery shells with different implications (install flow, service worker, store packaging). The spine may well be right, but it **changed a stated UX assumption without flagging it** — and the UX cited concrete shipped evidence (`env(safe-area-inset-*)`, `.pb-nav`, `overscroll-behavior:none`, `-webkit-overflow-scrolling:touch`) for WebView. **Recommend the spine explicitly acknowledge the PWA decision supersedes the WebView `[ASSUMPTION]`, with rationale**, so the change is a decision of record rather than a quiet drift. (Severity: MED — it's a foundation assumption.)

---

## Summary of findings (severity-tagged)

**Unresolved / partially-resolved tags**
- A2 — no-subtask→task-tier mapping implicit, not pinned (→ D2, MED)
- A3 — PWA vs WebView silently re-decided (→ F1/§4, MED)

**Dropped/flattened quiet requirements**
- D3 — carry-forward aggregate non-escalation ("no alarm field" by volume) + persistent non-colour label not carried as invariant — **MED**
- D4 — companion line selection random/rotating, "no variable-reward loophole" not carried — **MED** (restraint rule 6)
- D5 — accent text-contrast rule (`accent-text` ≥4.5:1, never body/link) dropped — **MED** (WCAG 1.4.3)
- D8 — completion non-colour signal (check-glyph + strike REQUIRED) not carried — **MED**
- D1 — wheel "subordinate in scale / eye lands on the win" dropped — **MED**
- D2 — no-subtask line = task tier not pinned — **MED**
- D6 — reduced-motion "information never silently dropped" clause dropped — **MED**
- D11 — creature passive on Plan (no reaction on capture) not stated — **LOW→MED**
- D9 — subtask active-state non-colour signal dropped — **LOW→MED**
- D7 — copy line as guaranteed non-glow carrier implicit — **LOW**
- D10 — modal-depth one-level invariant dropped — **LOW**

**Restraint-contract / NFR gaps**
- NFR7 — notifications/push (off-by-default, content bound by no-shame/no-absence) wholly uncarried — **MED**
- Restraint rule 3 (absence-guilt / no decay / no return-nag) — no explicit invariant — **MED**
- NFR4 — ~1.5s self-dismiss timing dropped — **LOW**
- NFR9 — onboarding-minimal / depth-in-Settings split not an invariant — **LOW**

**Contradictions:** none hard. One unacknowledged re-decision (PWA vs WebView, §4).

**Net:** structurally sound; the gaps are tonal/behavioral/a11y guardrails that an invariant-only structure naturally sheds. Recommend folding D1–D6, D8, D11, NFR7, and restraint-rule-3 into existing ADs (mostly AD-9, AD-10, AD-11) and acknowledging the PWA decision, before build.
