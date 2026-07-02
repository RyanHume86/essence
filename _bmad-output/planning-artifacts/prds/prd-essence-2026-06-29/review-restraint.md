---
title: "Essence PRD — Restraint Contract Adversarial Review"
status: review
reviewed: 2026-06-30
reviewer: Adversarial restraint reviewer
target: prd-essence-2026-06-29/prd.md
---

# Restraint Contract Review — Essence PRD

## Verdict: MINOR-RISKS

The PRD is unusually disciplined and self-aware about its restraint thesis — it bakes the brand non-negotiables into FRs (FR23), NFRs (NFR5, NFR7), a dedicated restraint contract (Section 5), and a counter-metrics section (Section 6) that is genuinely built to detect soul-loss rather than chase growth. There is no fatal betrayal. But several design details create *latent* slide paths toward streaks/scoreboards/nagging/overwhelm, and there are a handful of internal contradictions. These should be closed before the feature/architecture pass hardens them in code.

Risks are ordered roughly by severity.

---

## RISK 1 — The "progress wheel" is an unguarded scoreboard-in-waiting (FR15, FR16, FR17)

**Where:** FR16, FR15, FR17, UJ-1 step 5.

**The problem:** FR16 says "A progress wheel reflects the day's completions and grows as the user progresses." This is the single most dangerous mechanic in the document because it is a *quantified daily completion meter* — structurally identical to the thing the restraint contract bans. The contract carefully forbids streaks and scoreboards (Brand rule 1, Restraint rule 1, FR23), but a "progress wheel" that fills as you complete tasks is a daily completion percentage by another name.

Open questions the PRD never answers, and each answer is a fork between calm and pressure:
- **Does the wheel show a denominator?** A wheel that fills toward "100% of today's tasks" is a completion quota. If the user has 14 tasks and the wheel sits at 20% all morning, that is the wall-of-tasks dread re-encoded as a gauge — directly violating Restraint rule 5 ("overwhelm during execution") and the North Star ("the wall-of-tasks view is the enemy"). The focus view hides the backlog count, but the wheel could leak it.
- **What happens to a partially-filled wheel at day's end?** If it resets and the "unfilled" portion is visible or implied, that is a broken-streak/shortfall signal — Restraint rule 1/2.
- **Does the wheel persist across days?** If so it becomes a trend, i.e. a stats page.

**Recommendation:** Add an explicit FR/NFR constraint: the progress wheel shows *only* completed-progress accretion with **no visible denominator, no remaining-count, no percentage, and no cross-day persistence or reset-shortfall cue.** It should read as "look what grew," never "look how much is left." Without this guard, FR16 is the most likely vector for the product to drift into a scoreboard.

---

## RISK 2 — The archive is one PM iteration away from a stats page (FR22, FR23)

**Where:** FR22, FR23, OI-2.

**The problem:** The PRD does the right thing by pre-emptively banning streaks/counts/comparative stats in FR23. That is exactly the correct instinct. But an archive of "everything I've ever completed" is the *raw material* of a scoreboard, and FR23's prohibitions are stated as policy, not as enforced structure. The natural, well-meaning next features on any completion archive are: totals ("you've done 412 tasks"), per-day grouping (which visually becomes a calendar/streak grid), "most productive day," and month-over-month views. Each is a small step, each feels harmless, and the sum is the stats page the product rejects by design.

Specific latent tension: FR22 says archive is viewable "at day's end," FR23 says it is "proof of progress." "Proof of progress" framing invites quantification. A pile of completed cards is proof; a *count* of them is a score.

**Recommendation:** Strengthen FR23 from a list of "no X" into a positive structural rule: the archive renders completed items as an undifferentiated, un-aggregated, un-dated-grid list (or similar) with **no totals, no per-day tiles, no calendar heat-map, and no time-range comparison** — and add this to the Restraint contract so future features inherit the gate. Also reconcile the "day's end" vs "viewable history" framing so the archive can't quietly become a daily-performance log.

---

## RISK 3 — Counter-metrics have no instrumentation and no owner; the soul-guard is aspirational (Section 6)

**Where:** Section 6, "Counter-metrics."

**The problem:** The counter-metrics (anxiety-on-open, backlog dread, engagement-via-guilt) are excellent in intent and are the document's strongest restraint asset. But they are *felt* signals with no defined measurement, threshold, or review cadence — and the PRD explicitly says v1 is "not monetized / build-for-yourself," judged by "the builder's own experience." That means the only guardrail against soul-loss is the author's introspection. The danger isn't v1; it's that when the product later needs *any* number to justify decisions (per Future gates: "stranger win-moment," "unbiased payment signal"), the only instrumentable metrics available are engagement-shaped, and the counter-metrics will be too soft to push back. A guard with no instrument loses every argument to a guard with a dashboard.

This isn't a betrayal today, but it's the structural reason restraint products drift later.

**Recommendation:** Even at build-for-yourself stage, define *how* anxiety-on-open and backlog-dread would be observed (e.g. a private, non-gamified self check-in; explicitly NOT a mood-tracking streak), and name them as blocking gates in the same way the Future gates are. Note the risk that introducing measurement here must itself not become a nagging/streak mechanic — so the instrument needs its own restraint guard.

---

## RISK 4 — Carry-forward "highlight" is an unbounded nag vector (FR21, UJ-2)

**Where:** FR21, UJ-2 "Overdue handling," Restraint rule 2.

**The problem:** FR21 carries incomplete tasks forward and "gently highlights" them as "still needs doing." The PRD correctly bans red/badge/shame. But two things are unaddressed:
1. **Accumulation.** Nothing bounds how many carried-forward "highlighted" items pile up. A task untouched for three weeks is highlighted every single day. Even a calm highlight, repeated daily on a growing pile, *is* a nag — it reads as "this is STILL here, STILL here, STILL here." That collides with Restraint rule 2 (no nagging) and counter-metric "backlog dread," and it re-creates the wall-of-tasks the North Star forbids, just tinted "gentle" instead of red.
2. **Highlight = visual emphasis.** Any persistent visual differentiation of a stale task is, by repetition, a low-grade guilt cue. The line between "this is still here" and "you keep not doing this" is tone, and tone is exactly what erodes under iteration.

**Recommendation:** Define decay-free *de-emphasis* rather than highlight for aged carry-forwards, or cap/coalesce how carried items surface (one task at a time still applies in focus view — but the highlight presumably lives elsewhere). Explicitly state that carry-forward emphasis does not intensify, accumulate, or count with age.

---

## RISK 5 — "Little dance" + day-end sigh: reaction escalation risk (FR15, FR17, FR19, Restraint rule 6)

**Where:** FR15/FR17 ("a little dance"), FR19 (day-complete sigh), Restraint rule 6 (never loud/cutesy).

**The problem:** The reaction ladder is explicitly tiered and capped at "quiet," which is good. But "a little dance" on *every* task completion is the rung most likely to drift loud, because "dance" is an animation budget that designers will be tempted to enrich ("a slightly bigger dance for a 5-priority task," "a special dance on the 5th completion"). The ladder defines three tiers by *event type* but does not forbid *intra-tier escalation* (bigger reactions for bigger/more tasks), which is precisely how proportional-and-quiet becomes gamified celebration. Also note the day-end sigh (FR19) is a genuinely lovely beat, but it fires on "all tasks complete" — see Risk 6 for the edge case where that never fires or fires hollowly.

**Recommendation:** Add a clause to FR17/Restraint rule 6: reactions are fixed per tier and never scale with count, priority, or frequency — no "milestone" or "combo" escalation. The dance is the same small dance every time.

---

## RISK 6 — "Whole day complete" is undefined and creates a perverse incentive (UJ-1 step 6, FR19, FR16)

**Where:** UJ-1 step 6, FR19, Section 6 ("the day inverts").

**The problem:** The product's single most important felt signal — the day inverting into the deep slow sigh — is gated on "when everything is done" / "all tasks complete" (FR19). But:
- For "the builder" moving identity-level goals (the novel, the business), the list is *never* fully complete. New tasks arrive on the fly (FR4). So the hero emotional payoff may **rarely or never fire**, which quietly guts the core thesis.
- Worse, it creates a subtle incentive to *not* capture new tasks late in the day so the wheel completes and the sigh fires — i.e. the mechanic gently discourages honest capture, the opposite of UJ-2's "get it out of your head." That's a soft engagement-shaped distortion of behavior.
- If "day complete" instead means "everything that was on the list at session start," that needs stating, and it interacts with carry-forward (do carried tasks block the sigh forever?).

**Recommendation:** Define "day complete" precisely and decouple the contentment payoff from a 100%-empty list, or the product risks either never delivering its hero moment or pressuring the user to under-capture. Consider triggering rest/closure on user intent ("I'm done for today") rather than list-emptiness.

---

## RISK 7 — Onboarding ordering claim contradicts itself / FR1 vs NFR9 framing (FR1, UJ-3, NFR9)

**Where:** FR1, UJ-3, NFR9, FR3.

**The problem (minor / contradiction):** FR1 says first run collects name, colour, creature "in order" with "No task tutorial or setup wizard." A fixed three-step ordered sequence the user must pass through *is*, structurally, a minimal setup wizard — the doc both performs a wizard and disclaims one. This is cosmetic but worth tightening, because "we don't have a wizard" while shipping a 3-step gated flow invites scope creep ("just one more onboarding step") under cover of the disclaimer. NFR9/FR3 correctly push depth into settings, which is the right call; FR1's "in order" is the soft spot.

**Recommendation:** Either drop "in order" / allow skipping with sensible defaults (a creature and palette are pre-selected; the user can just tap into the empty space), or reframe honestly as "a minimal, skippable 3-choice setup, not a feature tour." Reinforces Restraint rule against overwhelm at the highest-overwhelm-risk moment (first run).

---

## RISK 8 — FR7 "nudge to decompose" can become low-grade prescriptiveness (FR7, Restraint rule 4)

**Where:** FR7, Restraint rule 4 ("never takes over independence").

**The problem (minor):** FR7 has Essence "gently nudge the user to decompose a task into subtasks." It's marked "encouraged, not required," which is good. But a nudge to structure work *a particular way* is the camel's nose for the app having opinions about *how* the user should plan — adjacent to Restraint rule 4's "the user plans; Essence supports." A persistent or repeated decomposition nudge would cross from supporting into prescribing method.

**Recommendation:** Bound FR7: the nudge is passive/dismissible, non-blocking, and does not repeat or escalate if ignored. Essence offers the affordance; it does not advocate.

---

## RISK 9 — Subtasks "disappear" on completion erases proof-of-work asymmetrically (FR14, Design principle UJ-1)

**Where:** FR14, UJ-1 step 4, Design principle under UJ-1.

**The problem (minor / philosophical):** Completed *subtasks* vanish entirely (FR14), while completed *tasks* leave a dimmed trace then archive. The PRD frames visible completed work as "proof of work done." Erasing subtask completions is defensible for focus/calm, but it's an internal inconsistency in the "proof of progress" philosophy, and more importantly it means within a long task the user gets *less* visible evidence of effort exactly where a builder grinding subtasks might most want the quiet reassurance. Not a contract violation, but a tension between the "calm/hide" instinct and the "proof of progress/contentment" instinct that the doc elsewhere treats as the payoff.

**Recommendation:** Confirm this is intentional and note the trade-off; consider whether the progress wheel (Risk 1) is meant to absorb this — which loops back to why the wheel's design must be nailed down.

---

## Things the PRD gets RIGHT (so they don't get "fixed" away)

- **FR23 / Restraint rule 1** — archive explicitly bans streaks/counts/comparison. Keep and strengthen (Risk 2), don't weaken.
- **NFR7** — push notifications opt-in and default-off. This is the correct anti-nag stance; guard it against any "gentle reminder" feature creeping in default-on.
- **Restraint rule 7** — core (companion/focus/win-moments) always free; monetization only touches convenience/portability. Clean, and consistent with Section 6's no-monetization-in-v1.
- **Section 6 counter-metrics** — building explicit soul-loss detectors is the single best restraint move in the doc. Make them instrumented and blocking (Risk 3) rather than aspirational.
- **NFR5** — no red/alarm colours including for carry-forward. Directly enforces the no-shame rule at the token level.
- **One-task-at-a-time (FR11) + progressive subtask disclosure (FR13)** — faithful, structural enforcement of the anti-overwhelm thesis.

---

## Internal contradictions / loose ends (consolidated)

1. **FR9 / UJ-2 note:** Ordering rule #2 is "due date / time (sooner first)" and the focus-view ordering (FR12) uses due date, but the data model is date-only (FR9, OI-1) and the PRD itself flags the time-of-day mismatch (line 92). Resolved on paper (date-only) but FR12/UJ-2 still reference time ordering — the prose should be scrubbed of "time" to match the resolved date-only decision.
2. **"Day complete" undefined** (Risk 6) — referenced as the hero payoff in three places, defined in none.
3. **FR1 "no wizard" vs. a 3-step ordered flow** (Risk 7).
4. **Progress wheel** (FR16) referenced as both a per-event reaction (FR17) and a day-spanning growth meter (FR16/UJ-1) — its scope (per-session? per-day? persistent?) is never pinned, which is what makes Risk 1 possible.
5. **"Proof of progress" philosophy** applied to tasks/archive but contradicted by subtasks vanishing (Risk 9).

---

## Bottom line

No clause in this PRD *openly* betrays the restraint contract — the authors clearly internalized it. The risk is entirely in **under-specified mechanics that have a calm default and a pressure-shaped slide path**: the progress wheel (denominator/reset), the archive (aggregation), carry-forward highlight (accumulation), the dance (escalation), and "day complete" (definition). Each is currently described in calm language but lacks the *structural guard* that would prevent a well-meaning future iteration from turning it into the exact mechanic Section 5 bans. Close these five specifications and the contract holds. Leave them open and the contract is only as strong as the next designer's restraint.

Verdict: **MINOR-RISKS** (tending toward CONTRACT-AT-RISK on the progress wheel specifically if it ships with a denominator).
