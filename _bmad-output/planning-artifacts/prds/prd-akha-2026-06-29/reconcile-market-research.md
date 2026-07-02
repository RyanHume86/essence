# Reconciliation — Market Research → PRD (Akha)

**Source:** `_bmad-output/planning-artifacts/research/market-emotional-companion-habit-trackers-research-2026-06-24.md`
**Drafted PRD:** `_bmad-output/planning-artifacts/prds/prd-akha-2026-06-29/prd.md`
**Date:** 2026-06-30

**Framing per user direction:** Competitors are not the compass; the PRD is user-first; v1 is a niche, build-for-yourself, non-monetized craft. "Missing competitor analysis" is *not* treated as a gap. Below are research insights that should still inform the PRD but were dropped or only partially carried: unmet-need framing, monetization signals tied to the documented future-monetization gate, retention/onboarding risks, and qualitative user-language insights.

---

## Gaps

### G1 — Onboarding is the documented retention cliff; the PRD treats it only as "stay calm"
- **Source says:** Productivity apps see Day-1 ~17%, Day-30 ~4%; the steep Day-1→Day-7 drop "signals an onboarding problem"; users trial several tools before settling. The research names "the felt first-session moment (the win-loop)" as one of two highest-leverage retention levers.
- **Status:** Partially covered. UJ-3 / FR1–FR2 deliberately keep onboarding minimal, and Section 6 names "Stranger win-moment" as a future gate. But the PRD never connects *minimal onboarding* to the risk it is mitigating: a first session that produces no felt win is where users churn. UJ-3 onboards into an **empty space with zero tasks** — meaning the first win-loop cannot fire until the user has separately done a capture session (UJ-2). The research's "felt first-session moment" is therefore not guaranteed on first open.
- **Suggested fix:** In UJ-3 or Section 6, add a note that the first *felt win* may not occur on first open (empty state) and flag this as the single biggest retention risk to watch. Consider a design hook: gently bridge a new user from onboarding into capturing one task and completing one subtask, so the win-loop is experienced in session one — without turning onboarding "loud."

### G2 — The "fast loop" is the #1 documented friction, but the PRD has no speed/latency NFR
- **Source says:** Finch's most-cited friction is the slow, tap-through daily loop ("completing a task means tapping through screens, messages, animations — feels slow"). The research lists "Nail the fast win-loop" as the highest-leverage move — "differentiator *and* fix at once."
- **Status:** Partially covered. NFR4 requires reactions be ~1.5s, self-dismissing, non-blocking, and optimistic. That addresses reaction *animation* speed. But the PRD never states the loop as a whole must be *fast / low-tap* — and several UJ-1 steps (greeting, subtask dropdown reveal, encouragement lines, dim/sink/dance, day-end sweep) risk reintroducing exactly the "tap-through" slowness Finch is criticized for.
- **Suggested fix:** Add an explicit principle/NFR: completing a subtask or task should take minimal taps and never gate the next action behind an animation. Frame "fast, low-friction loop" as a first-class requirement, not just "reactions self-dismiss."

### G3 — Sub-task / all-or-nothing pain point is well-served, but worth making explicit as a deliberate win
- **Source says:** A named Finch complaint is "all-or-nothing multi-task goals — can't tick sub-tasks off through the day," and "engagement decay: you basically just check the to-do list… no real growth."
- **Status:** Covered (strongly). FR13–FR15 (two-at-a-time subtask reveal, subtask completion flow, auto-complete) and the progress wheel directly answer this. No change needed for function.
- **Suggested fix:** Optional — none required. The PRD already satisfies this unmet need; noting it here only to confirm the strongest research signal landed.

### G4 — "Calm return / pull not push" is asserted but the research warns it's the hard part
- **Source says:** Retention rises with cross-device/integration and a felt first session; users come back by pull only if the loop lands. The research is blunt that retention is "the hard constraint" and that demand for Akha specifically is unvalidated (n=2, one biased).
- **Status:** Partially covered. Section 6 lists "Calm return — comes back by pull, not push" as a success signal, and NFR7 bans default notifications. But the PRD presents pull-based return as a near-given of restraint, whereas the research treats re-open without nagging as genuinely hard and unproven.
- **Suggested fix:** In Section 6, soften the "calm return" signal with an acknowledgement that this is the riskiest assumption (research: retention is the hard constraint; pull-only return is unproven). Keeps the user-first stance while inheriting the research's honesty.

### G5 — Future-monetization gate lacks the concrete pricing shape the research recommends
- **Source says:** For the eventual paid tier the research is specific: a **single, fair, identical price across iOS and Android** (turning Finch's $14.99 iOS vs $69.99 Android grievance into a headline); **free core + a paid "Everywhere" tier** = sync/backup/integrations; anchor ~$20–40/yr; iOS-first for WTP; higher prices convert *better* (9.8% vs 4.3% trial conversion; ~5.2x rev/install); avoid surprise charges, platform price gaps, and gacha/shop mechanics.
- **Status:** Partially covered. Restraint-contract rule 7 and NFR captures the *boundary* (core always free; monetization only ever touches convenience/portability — backup, export, cross-device; no gacha). That correctly inherits "what monetization may touch." But the PRD's documented **future gate** (Section 6: "Unbiased payment signal… once monetization is on the table") records no shape for what is charged or how — the research's most actionable monetization signal (identical cross-platform price, free-core/paid-"Everywhere" split, ~$20–40/yr, don't race to the bottom) is dropped.
- **Suggested fix:** Add a short "Future monetization shape (deferred, not v1)" note near Section 6's future gates or restraint rule 7: free core + paid "Everywhere" (sync/backup/export/cross-device), single identical price both platforms, ~$20–40/yr anchor, no surprise charges / no platform gap. Explicitly marked as not-v1 so it respects the non-monetized scope while preserving the signal for when the gate opens.

### G6 — Data export / portability is a research-named differentiator that the PRD under-specifies
- **Source says:** "Data export + default-on sync" is listed as a highest-leverage move — it "directly attacks Finch's lock-in/data-loss pain and is a fair paid hook." Finch's *lack of export* traps its own users; portability cuts both ways (switch trigger toward Akha; lock-in is a switch barrier away).
- **Status:** Partially covered. Restraint rule 7 mentions "export" as a permissible convenience/portability feature, and NFR10–NFR11 cover privacy/local-first direction. But there is **no functional requirement for export** anywhere in Section 4, and "your data is yours / export" — a core piece of the research's recommended positioning ("The companion that grew up") — is not a v1 capability or even an explicit future FR.
- **Suggested fix:** Add a note (or a deferred FR) that user-initiated data export is an intended capability tied to the "data is yours" value, even if not v1. At minimum, surface it in the future-direction text alongside NFR11 so the portability promise isn't lost.

### G7 — Qualitative user-language insights (the churn vocabulary) are absent from the PRD
- **Source says:** The research captured the *exit segment's own words*: the companion is "too childish/cutesy," users want something "serious, minimalist, intrinsically motivating, with real analytics"; gamification creates "cognitive dissonance for serious adult goals"; punishment mechanics "amplify self-criticism for those already hard on themselves." The recommended positioning line is **"The companion that grew up."**
- **Status:** Partially covered. The PRD's vision ("a calm task companion that grew up," "too childish") clearly inherits this language and the protagonist Ryan embodies the "outgrown adult" segment. What's dropped is the *intrinsic-motivation* and *self-criticism amplification* framing — the research's evidence that shame mechanics specifically harm "those already hard on themselves," which is precisely Ryan (overwhelmed, dreading his list). This is the strongest qualitative justification for the entire restraint contract.
- **Suggested fix:** Add one line to Section 1 or Section 5 grounding the no-shame rules in the research finding that guilt/punishment mechanics *amplify self-criticism for users already hard on themselves* — making the restraint contract evidence-backed, not just taste. Optional: note the "intrinsically motivated" trait as a defining property of the builder.

### G8 — "Analytics / real progress" tension: research demand vs. anti-stats restraint
- **Source says:** The churned segment explicitly wants "real analytics" / "serious progress/analytics" — it appears repeatedly as an unmet need ("warm companion tied to real goals with… serious progress/analytics").
- **Status:** Covered with deliberate divergence — worth flagging as resolved, not missing. The PRD intentionally rejects a stats/streak page (Brand rule 1: "the streak/stats page *is* the guilt engine") and substitutes the progress wheel (FR16) + archive-as-proof-of-progress (FR22–23). This is a conscious user-first override of a research signal, not an omission.
- **Suggested fix:** None required, but consider a one-line note in Section 4/5 acknowledging the tradeoff explicitly: the research's "real analytics" demand is intentionally reinterpreted as *felt* progress (wheel + archive), not a metrics dashboard — so a future reader doesn't mistake the omission for an oversight.

---

## Summary of dispositions

| Gap | Theme | Disposition |
|---|---|---|
| G1 | First-session win / onboarding retention cliff | Partially covered — add risk note + session-one win bridge |
| G2 | Fast/low-tap loop | Partially covered — add speed NFR/principle |
| G3 | Sub-task granularity | Covered — no change |
| G4 | Pull-not-push return | Partially covered — add honesty about risk |
| G5 | Future monetization shape | Partially covered — add deferred pricing-shape note |
| G6 | Data export / portability | Partially covered — add export FR/future note |
| G7 | Qualitative churn language / self-criticism evidence | Partially covered — ground restraint in evidence |
| G8 | "Real analytics" demand vs. anti-stats restraint | Covered by deliberate override — optional note |

No competitor-comparison gaps are raised, per the user's compass. Gaps are scoped to a niche, non-monetized v1: most are lightweight notes, not new build scope.
