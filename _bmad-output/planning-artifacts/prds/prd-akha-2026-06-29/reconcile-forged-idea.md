# Reconciliation — Forged Idea vs PRD

**Source:** `_bmad-output/forge/akha-progress-companion/forged-idea.md`
**Drafted PRD:** `_bmad-output/planning-artifacts/prds/prd-akha-2026-06-29/prd.md`
**Date:** 2026-06-30

This is a reconciliation of what the forged idea (the hardened source) contains against what the PRD captured. Each gap notes what the source says, its status (Missing / Contradicted / Covered-but-weak / Covered), and a suggested fix. Items the user intentionally scoped out (mass-market framing, competitor reactions) are not treated as gaps.

---

## High-priority gaps

### 1. The forge's prerequisites (conditions #1 and #2) are *gating*, not future "gates"
- **Source says:** The verdict is "HARDENED **(conditional)**." Conditions #1 (get a real, unbiased payment signal — current n=2, one of them the requester) and #2 (build the win-moment loop and prove the feeling lands on a *stranger* builder) are explicitly named as **"prerequisites to real planning"** — the Feeds line states `bmad-spec · bmad-prd · bmad-prfaq — but condition #1 and #2 above are prerequisites.`
- **Status:** **Contradicted / weakened.** The PRD demotes these to "Future gates (before going beyond build-for-yourself)" in §6, framed as relevant only "once monetization is on the table" / "before Akha widens." The source frames condition #2 (stranger win-moment) as a prerequisite to planning itself, not a later widening gate. The PRD also silently drops the "conditional" qualifier on the verdict and the explicit "n is 2, one of them the requester" payment-signal status.
- **Suggested fix:** Add a short "Status & prerequisites" note near the top of the PRD (or in §6) recording that the idea is **HARDENED (conditional)**, that the stranger win-moment is an open prerequisite (not yet met), and that the unbiased payment signal currently stands at n=2 (one being the requester). Keep the framing that these gate *widening/monetizing*, but acknowledge the source treats the stranger win-moment as foundational to the whole thesis ("the whole thesis is entangled with one 30-second moment").

### 2. The 30-second win-moment is the load-bearing crux — not just one signal among four
- **Source says:** Condition #2: "Build the win-moment loop and prove the feeling lands on a stranger-builder — **the whole thesis is entangled with one 30-second moment.**" This singular moment is the make-or-break of the entire idea.
- **Status:** **Covered-but-weak.** The PRD has FR15/FR16 (progress wheel, win-moment) and lists "Stranger win-moment" as a future gate, but it never elevates the win-moment to the crux status the source gives it, nor names the "30-second" felt-loop framing.
- **Suggested fix:** In §1 (the bet) or §3 (UJ-1), explicitly flag that the win-moment loop is the single highest-risk, highest-leverage element — the thing the entire bet rests on — so build sequencing prioritizes proving it first.

### 3. "Warmth alone retains" was *killed* — habituation by week six
- **Source says:** Killed direction: **"Warmth alone retains" — habituates by week six; the warm-character-you-grow already exists at scale (Finch/Habitica).** This is a named, deliberate kill.
- **Status:** **Missing.** The PRD leans heavily on warmth/companion feeling but nowhere records that *warmth by itself* was judged insufficient for retention. The risk is the team over-indexing on the warm creature and assuming it carries retention — exactly the killed assumption.
- **Suggested fix:** Add to the restraint contract or a "killed directions / assumptions" note: warmth alone does not retain (habituates ~week six); retention must come from the warmth being *tied to real identity-level goals* + visible progress, not the character on its own.

### 4. The moat is identity-level goals tied to the feeling — the "one thing Finch structurally can't copy"
- **Source says:** "Moat = the feeling delivered with taste + genuine no-shame restraint, **tied to real identity-level goals (your novel/business/body)** — the one thing Finch structurally can't copy without ceasing to be Finch."
- **Status:** **Covered-but-weak.** The PRD mentions "identity-level goals (the novel, the business, the body)" in §1 and §2 and has a strong restraint contract, but it does not articulate *why* this is the structural moat (a competitor can't copy it without ceasing to be itself). The strategic "why this is defensible" reasoning is lost.
- **Suggested fix:** Add a one-line moat statement: the defensibility is the feeling + restraint *bound to the user's own identity-level goals*, which a gamified/gacha companion cannot replicate without abandoning its own model.

---

## Medium-priority gaps

### 5. "Taste" as an explicit moat ingredient
- **Source says:** The moat is the feeling "delivered with **taste** + genuine no-shame restraint." Taste is named alongside restraint.
- **Status:** **Covered-but-weak.** The PRD captures restraint thoroughly but does not name *taste* as a first-class quality bar.
- **Suggested fix:** Note taste/craft as a non-negotiable quality dimension (the execution must feel tasteful, not merely restrained) so it isn't reduced to a checklist of "don'ts."

### 6. Evidence-based differentiation grounded in documented Finch complaints
- **Source says:** "Differentiation is **evidence-based**, grounded in documented Finch complaints (not founder taste): shallow analytics, no focus/Pomodoro, no real data export (lock-in), slow completion loop, 12h pet wait, goal-order bugs, gacha/feature creep, divisive childish tone, device-local data loss, residual guilt despite 'shame-free.'"
- **Status:** **Partially covered.** Several map to PRD requirements (no gacha → restraint contract #6; export/portability → NFR10–11 & restraint #7; childish tone → "never cutesy"; data loss → privacy/data-ownership; residual guilt → no-shame rules). But two specific differentiators are **missing**: (a) **slow completion loop / 12h pet wait** — Akha's answer is the *fast, self-dismissing, optimistic win* (NFR4 partially covers speed but never frames it as the deliberate antidote to Finch's slow loop), and (b) **focus/Pomodoro** absence is noted as a Finch gap but the PRD's focus-view does not claim a focus mechanic.
- **Suggested fix:** (a) Explicitly frame the fast/optimistic win-moment (NFR4) as the deliberate antidote to slow completion loops and artificial waits — no 12h timers, no gating the reward. (b) Decide and record whether any focus/Pomodoro affordance is in or out of v1 scope (the source flags its absence in Finch as a differentiation opportunity; the PRD is silent). Note: per the user directive de-emphasizing competitors, frame these as product principles rather than Finch call-outs.

### 7. "AI assistant as the basis" was killed — task-AI is optional add-on *at most*
- **Source says:** Killed: "**AI assistant as the basis** — most commoditized, giant-owned capability; breaks free-core economics; was a reflex grab under attack." And in Locked: "Task-AI is an optional add-on **at most**."
- **Status:** **Missing.** The PRD makes no mention of AI at all — neither to scope it out nor to record the kill. Silence risks the kill being forgotten and AI creeping back in as a "basis."
- **Suggested fix:** Add a line to the restraint contract or scope section: AI is not the basis of the product (killed in forge — commoditized, breaks free-core economics); any task-AI is an optional add-on at most, never the core.

### 8. Monetization purpose: "cover costs, not gate the experience"
- **Source says:** "Monetization exists to **cover costs, not to gate the experience**." Goal is explicitly "(B) niche / cost-covering."
- **Status:** **Covered.** Restraint contract #7 ("Monetization covers costs and only ever touches convenience and portability... never the feeling itself") and §6 ("v1 is not monetized") capture this well. No fix needed beyond ensuring the cost-covering (not profit/scale) intent stays explicit.

### 9. "Design v1 for the builder" / build-for-yourself
- **Source says:** "Design v1 for **the builder**." Persona is the builder, explicitly *not* the retiree ("a different product").
- **Status:** **Covered.** PRD §2 protagonist (Ryan, the builder) and §6 "build-for-yourself stage" capture this. The "not the retiree" exclusion is implicit but not stated — minor.
- **Suggested fix (optional):** One line noting the retiree / different-demographic is explicitly *not* the target, to prevent persona drift.

---

## Lower-priority / watch items

### 10. "Empty middle" is the thesis, not a flaw
- **Source says:** "The 'empty middle' is the *thesis*, not a flaw, once you stop needing scale."
- **Status:** **Missing** (but arguably intentionally scoped out as competitor/market framing). The strategic insight that occupying the gap between clinical trackers and gacha pets is the *point* is not stated.
- **Suggested fix:** Optional — a single line in §1 noting Akha deliberately occupies the gap between cold checkbox apps and loud companion apps, and that this niche position is the strategy, not a weakness. Aligns with the existing "too cold / too childish" framing already in §1–2.

### 11. "Hold scope / resist feature creep" — anti-feature-pile is a named condition
- **Source says:** Condition #3: "**Hold scope.** The moat is the feeling + restraint, not the 9-feature list. Resist becoming the feature-creep you diagnosed in Finch."
- **Status:** **Covered.** Restraint contract #8 ("Creep into a feature pile... Breadth is resisted on purpose") captures this well. No fix needed.

### 12. "Core = the feeling, not features and not AI"
- **Source says:** "Core = the feeling (warmth + visible progress), *not* features and *not* AI."
- **Status:** **Covered** for the feeling/features half (§1, restraint #8); the "not AI" half ties to gap #7 above.

---

## Summary of recommended PRD edits

1. Record the **conditional** verdict and treat the **stranger win-moment** + **unbiased payment signal (n=2, one is requester)** as named prerequisites, not just "future gates" (gap #1).
2. Elevate the **30-second win-moment loop** to crux status and sequence it first (gap #2).
3. Record the killed assumption **"warmth alone retains"** (habituates by week six) (gap #3).
4. State the **moat** explicitly: feeling + taste + restraint bound to identity-level goals = structurally uncopyable (gaps #4, #5).
5. Record the **AI kill** (not the basis; optional add-on at most) (gap #7).
6. Frame the **fast/optimistic win** as the deliberate antidote to slow completion loops / artificial waits; decide focus/Pomodoro scope (gap #6).
