# PRD Quality Review — Akha (2026-06-29)

> Calibration: This is a polished-personal-project, build-for-yourself, non-monetized v1 — explicitly a hobby/solo + brownfield product. Per the rubric, rigor is light but the substance bar still applies. Enterprise sections (market sizing, GTM, multi-persona segmentation) are correctly absent and not penalized.

## Overall verdict

This is a genuinely strong PRD for its stakes: it has a real thesis (the *feeling* of restrained progress, not feature count), and almost every requirement traces back to that thesis. The restraint contract and counter-metrics are the standout — they do real decision-work, not theater. What's at risk is **done-ness clarity**: several hero FRs lean on felt/animation language ("a little dance," "becomes more visible," "gently highlighted") with no testable bound, and the success metrics are deliberately and entirely subjective with no defined check, which is defensible for build-for-yourself but leaves "done" partly in the author's head. One genuine internal inconsistency (FR9 vs. the UJ-2 ordering rule on time-of-day) and a date-only/sort gap are the only substantive correctness issues. **Verdict: PASS-WITH-FIXES.**

## Decision-readiness — strong

A decision-maker can act on this. The defining trade-offs are stated as decisions, not buried. The "one task at a time during execution" choice is named as a *promise* (FR11, restraint contract §5.5), and the thing given up — convenient whole-list visibility during doing — is explicitly acknowledged and even called "the enemy" (§2 north star). Overdue handling is marked "(resolved)" with the rejected alternatives named (no red, no badge). Open items OI-1/2/3 are shown *resolved* with the resolution, which is honest. The monetization boundary (§5.7) names exactly what is and isn't gated.

The one place decision-readiness frays: the inline note at §3 line 92 ("due date/time implies a time-of-day; the current data model is date-only — flagged for the features/NFR pass") surfaces a real tension, but the features pass then resolved it *against* the journey (FR9 date-only) without reconciling the UJ-2 ordering rule that still sorts by "due date / time." That's a surfaced-then-half-dodged tension (see Done-ness).

### Findings
- **low** Resolved items read as closed, not open (§4 Resolved open items, §6 Future gates) — This is correct for the stakes, but worth confirming no live decisions remain mislabeled "resolved." *Fix:* none required; noted for completeness.

## Substance over theater — strong

Very little furniture here.
- **Persona:** One protagonist (Ryan), who *is* the author. For a build-for-yourself product this is exactly right — no persona theater, and Ryan drives real decisions (the "wall of tasks is the enemy" framing flows straight into FR11/FR13).
- **Vision:** The §1 vision is product-specific and could *not* be swapped into a generic to-do PRD — "loud companion apps too childish," "the streak/stats page *is* the guilt engine" are sharp, opinionated, and load-bearing.
- **NFR substance:** NFRs mostly carry product-specific thresholds, not boilerplate: NFR4 gives a concrete bound (~1.5s, self-dismissing, never network-gated, optimistic-before-save), NFR5 bans red/alarm colors and hardcoded hex, NFR1 names the actual dependency budget (~17). This is the opposite of "must be scalable/secure."
- **Restraint contract (§5):** This is the substance core and it's earned — it's a gate with teeth ("any future feature must pass every line here, or it does not ship").

No findings — dimension is clean.

## Strategic coherence — strong

The PRD has a single, well-stated thesis (§1 "The bet": the *feeling* of restrained, real-goal-tied progress is the moat) and the feature set serves it as a unified arc rather than a backlog. Prioritization follows the thesis: the focus view is explicitly the "hero feature" (§4.C), and breadth is *resisted on purpose* (§5.8). Recurrence and create-your-own-creature are de-scoped explicitly (§3 "Out of scope") even though recurrence is already built and tested — declining to ship working code because it doesn't serve the thesis is a strong coherence signal.

Success metrics validate the thesis rather than measuring activity: §6 explicitly rejects DAU/MAU and streak-retention as *anti*-metrics, and counter-metrics are named (anxiety-on-open, backlog dread, engagement-via-guilt). This is textbook "counter-metrics when SMs exist."

No findings — dimension is clean.

## Done-ness clarity — thin

This is the weakest dimension and the reason the gate is PASS-WITH-FIXES. The PRD is brownfield, so ✅/🔶 FRs (FR4, FR6, FR15, FR16, FR20) inherit testable behavior from shipped code — acceptable. But several 🆕 hero FRs describe felt behavior with no verifiable bound:

- **FR14 / FR15 — animation & motion verbs are unbounded.** "the next flows up and the following incomplete subtask **opens to become more visible**" (FR14) and "the creature does a **little dance**" (FR15) have no definition of done. What makes a subtask "more visible"? What is a "little dance" vs. a banned "loud/cutesy" reaction (§5.6)? An engineer can't tell when these are correct, and the line between FR15's "little dance" and the §5.6 ban on confetti/hype is exactly the kind of judgment that needs a bound.
- **FR21 — "gently highlighted."** The carry-forward FR says tasks are "gently highlighted as 'still needs doing'" with red/badge explicitly excluded — good on the negative, but the *positive* definition ("gently highlighted") is an adjective, not a spec. NFR5 helps (no red, tokens only) but doesn't say what the highlight *is*.
- **FR13 — "two at a time" is testable; the reveal interaction isn't.** "subtasks are revealed two at a time" is a clear, testable rule (good). But UJ-1 step 4's chained behavior (complete → disappear → next flows up → following one "opens") bundles several state transitions that FR14 compresses; an acceptance walk would want these enumerated.
- **§6 Success metrics are entirely subjective with no check.** "The day inverts," "calm return," "lower load" are honest signals but have zero defined observation method — even a lightweight self-report ("did opening it lower or raise my stress today? y/n") would make them checkable. For build-for-yourself this is *defensible* (the author is the instrument), so it's flagged medium, not critical — but it does mean "is v1 succeeding?" has no answerable test.

### Findings
- **high** Hero-FR animation verbs have no done-bound (FR14 "opens to become more visible"; FR15 "a little dance") (§4.C/D) — Engineer can't verify correctness, and "little dance" risks colliding with the §5.6 ban on loud/cutesy. *Fix:* add one testable consequence each (e.g., FR15: "a ≤1.5s, single-bounce idle-loop animation; no particles/confetti; respects reduced-motion per NFR3") and define "more visible" (e.g., expands to show its subtask preview / gains focus styling).
- **medium** FR21 "gently highlighted" undefined on the positive side (§4.E) — Negative bounds exist (no red/badge), positive does not. *Fix:* specify the actual treatment (e.g., a subtle token-colored left border or a "still to do" chip in a calm palette token).
- **medium** Success metrics have no observation method (§6) — Defensible for solo v1, but "is it working?" is currently unanswerable. *Fix:* attach a one-line self-check to each signal (even a mood y/n on close) so the thesis is verifiable, not just stated.

## Scope honesty — strong

Omissions are explicit and do real work. The §3 "Out of scope for this PRD" block names recurrence and create-your-own-creature *and explains why* (recurrence is built-but-unwired and not forced into v1). Non-goals are effectively encoded twice — once as scope, once as the restraint contract (§5), which is a stronger form than a passive Non-Goals list. FR9 explicitly states time-of-day is out of scope and *why* (preserve date-only model + calm feel). The data-ownership gap is stated with unusual honesty: NFR11 says outright "v1 does not yet implement it... a known gap to be resolved in the architecture phase."

Open-items density is low and appropriate: OI-1/2/3 all resolved, future gates clearly fenced off from v1. For a green-light-to-build hobby PRD this is the right density.

One scope-honesty nit: the assumption tagging convention from the rubric (`[ASSUMPTION: …]`, `[NOTE FOR PM]`) isn't used. The PRD instead uses prose notes ("flagged for the features/NFR pass," "(resolved)"). For solo stakes this is fine, but the date-only inference (that Ryan truly has no time-of-day needs) is an un-flagged assumption baked into FR9.

### Findings
- **low** Date-only is an unflagged assumption (FR9, §3 line 92 note) — The claim that time-of-day isn't needed is an inference, partially contradicted by the UJ-2 sort key (see Done-ness/Mechanical). *Fix:* tag it as an explicit assumption to revisit if a time-sensitive task ever appears.

## Downstream usability — adequate

This PRD feeds a downstream architecture phase (it says so explicitly: NFR11, "Ready for Finalize"), so traceability matters.
- **IDs:** FR1–FR23 contiguous and unique; NFR1–NFR11 contiguous; UJ-1/2/3 each have a named protagonist (Ryan) carrying context inline — no floating UJs. Good.
- **Cross-refs resolve:** FR16 references "the shipped growth-ring/win-moment," FR23 references "Brand rule 1," FR17 maps the three-tier ladder to the UJ-1 table. These resolve.
- **Gap — no Glossary.** Domain nouns ("focus view," "progress wheel," "win-moment," "reaction ladder," "the doing" vs. "execution," "carry-forward") are used consistently but never defined in one place. For a solo author this is survivable, but the architecture phase would benefit from pinning "focus view" vs. "execution surface" vs. "the doing surface" (all used for the same thing — §3, FR11, §4.C heading).

### Findings
- **medium** No Glossary; "focus view"/"the doing"/"execution surface" used interchangeably (§3, §4.C, §5.5) — Same concept, three names; downstream extraction will have to infer they're identical. *Fix:* add a short Glossary pinning each domain noun, or standardize on "focus view" everywhere.
- **low** "progress wheel" (FR15/16) vs. shipped "growth-ring" (FR16 parenthetical) — Two names for what may be one component. *Fix:* confirm they're the same and use one term.

## Shape fit — strong

The PRD is correctly shaped for a hobby/solo + brownfield + meaningful-UX consumer product. UJs are load-bearing (the felt experience *is* the product, so the morning-session journey earns its place — not overhead). Rigor is appropriately light (no market sizing, no multi-persona theater, no formal acceptance section) while the substance bar is met. Brownfield handling is explicit and accurate: ✅/🔶/🆕 build-status markers distinguish shipped from new, and de-scoped-but-built recurrence is flagged as "built and tested, currently unwired." This is exactly the rubric's prescription for brownfield (existing-code references accurate; new vs. existing distinguished).

No over-formalization, no under-formalization. No findings.

## Mechanical notes

- **Internal inconsistency (the one real correctness bug): FR9 vs. UJ-2 ordering rule.** §3 UJ-2 ordering rule step 2 sorts by "**due date / time** (sooner first)" and FR12 repeats "due date sooner-first," but FR9 makes due dates **date-only** (no time). The §3 line 92 note caught this ("'due date / time' implies a time-of-day; the current data model is date-only — flagged"), but it was never reconciled — the ordering language still says "time." With date-only data, ties within a day fall through to "order added," which may not be the intended behavior. *Fix:* update UJ-2/FR12 wording to "due date (date-only)" and confirm the intended intra-day tiebreak.
- **Terminology drift:** "focus view" / "the doing" / "execution surface" / "doing surface" all denote the same screen (§3, §4.C heading, §5.5, NFR). "progress wheel" vs. "growth-ring" (FR15/16). "win-moment" appears in FR16/§5.7/NFR4 without a definition. No Glossary to anchor these.
- **ID continuity:** FR1–23 and NFR1–11 contiguous and unique; UJ-1–3 fine; OI-1–3 resolved and accounted for. No gaps, no duplicates, no dangling cross-references found.
- **Assumptions convention:** rubric's `[ASSUMPTION]` / `[NOTE FOR PM]` tags not used; prose equivalents used instead. Acceptable at these stakes, but the date-only assumption (FR9) and the "Ryan has no recurring tasks" assumption (§3 out-of-scope) are inferences worth an explicit tag.
- **Required sections:** Vision, protagonist, UJs, FRs, restraint/non-goals, success metrics + counter-metrics, NFRs all present. Complete for the stakes.
