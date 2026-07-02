---
title: "Essence — Accessibility Review (UX spines)"
status: draft
created: 2026-06-30
reviewer: accessibility audit
scope: DESIGN.md + EXPERIENCE.md against PRD NFR3/NFR5/NFR8/FR20
---

# Accessibility Review — Essence UX Spines

**Verdict: CONDITIONAL PASS — the accessibility *floor* is well-intentioned and mostly named, but it ships with real gaps. Two blockers (colour-only state signals; sub-AA contrast on accents used as text/icon in 5 of 7 schemes), several should-fixes (under-specified reduced-motion coverage, SR strings, focus-order edge cases, checkbox/subtask affordance contrast), and a handful of nits. Not yet shippable as an "accessibility floor" without the colour-independence and contrast fixes.**

The strongest part of the spec is the *affect* accessibility — no-red / no-shame is held consistently and treated as a first-class commitment. The weakest part is the gap between "an accessible scheme exists" and "every state survives without colour," which the docs assert but do not yet guarantee.

---

## Findings

| Severity | Location | Issue | Concrete fix |
|---|---|---|---|
| **blocker** | EXPERIENCE.md State Patterns (Active task / subtask) · DESIGN.md Components (subtask-card) | **Active subtask conveyed by colour + position, but the non-colour signal is weak.** The active subtask is "accent-tinted background, `highlight` text + an *In progress — just this one.* meta line." The meta line is a real non-colour signal — good — but it is `meta` 12.5px muted, the smallest type on screen, and the primary differentiator (accent tint) is colour. Under a custom OS high-contrast / forced-colors mode the tint can be flattened away, leaving only a small caption. | Make the active subtask carry a **structural** signal independent of colour and tint: e.g. a left border/indicator bar, an expanded/elevated card state (it is already "expanded"), or an explicit "Active" text/icon affordance. Keep the meta line but do not let it be the only non-colour cue. Verify under `forced-colors: active`. |
| **blocker** | DESIGN.md Colors · Color Schemes table | **Accent used as text/icon/link falls below WCAG AA (4.5:1) in most schemes.** The accent is spec'd as carrying links and the active-subtask text role. Spot-check (below) shows the accent vs its background is **3.91 (Deep Sea), 3.54 (Soft Paper), 3.70 (Soft Pink), 3.50 (Sky Blue)** — all below 4.5:1 for normal text, and Soft Paper/Sky Blue are even below 3.0:1 against a true raised surface. The accent passes AA only as a *large-text/UI-component* colour (≥3:1), not as body-size text or a link in running copy. | Either (a) restrict accent-as-text to ≥18.66px/large-bold roles and use `foreground`/`highlight` for small interactive text, or (b) darken/lighten the accent per scheme until it clears 4.5:1 on its actual background. Links in body copy must clear 4.5:1. Document the accent's *allowed text contexts* in DESIGN.md so it is not used at body size. |
| **should-fix** | EXPERIENCE.md Accessibility Floor (reduced-motion bullet) · DESIGN.md Companion | **Reduced-motion list is non-exhaustive — several named animations are not covered.** The bullet enumerates "completion, dim-and-sink, wheel growth, and the sigh." Not covered: the **little dance** (tier 2), the **first-open beat** (FR24), the **breathing idle**, the **opening greeting smile** (FR18), and the **gentle smile** on a subtask (tier 1). The "always honored" law is stated, but an enumeration that omits five animations invites a build where an uncovered one slips through. | Replace the enumerated list with an explicit rule + a complete table: every animation (greeting smile, breathing idle, subtask smile, little dance, dim-and-sink, wheel growth, first-open beat, deep-slow sigh, end-of-day sweep) maps to its reduced-motion **end-state**. Note that *idle/ambient* loops (breathing) and *intro beats* (first-open) should **not just freeze** — they should resolve to a static resting pose, and the first-open beat's *informational content* (the preview of the feeling) must still be conveyed (static pose or text), not silently dropped. |
| **should-fix** | EXPERIENCE.md Accessibility Floor (SR bullet, `[ASSUMPTION]`) | **Screen-reader announcements under-specified across the board.** The doc admits "exact SR announcement strings unspecified — confirm at build." Underspecified: (1) the **progress wheel** — it must announce *accumulation* without a remaining count, but no `aria` pattern is given (a `role="img"` with a non-numeric label like "Progress growing" is needed; a `progressbar` role with `aria-valuenow/max` would leak a denominator and violate FR25). (2) **dim-and-sink** — when a completed task dims-but-stays then reorders to the bottom, SR focus and reading order during the reorder are unspecified (focus must not be lost or yanked). (3) **two-at-a-time subtask reveal** — when the active subtask vanishes and the next expands, **focus management** is unspecified (focus should move to the newly-active subtask, with an announcement). (4) carry-forward "still needs doing" needs an SR-readable label, not colour. | Specify: wheel = `role="img"`, `aria-label` that never contains a number/percentage/remaining (e.g. "Today's progress — growing"), `aria-live="polite"` update on growth. On subtask completion, move focus to the next active subtask and announce "done" + the new active item. On dim-and-sink, keep focus on a stable anchor (the focus card region), announce completion, and reorder in the DOM without stealing focus. Give carry-forward an explicit `aria-label` ("still needs doing"). |
| **should-fix** | DESIGN.md Components (checkbox) · State Patterns (carry-forward) | **Completion and carry-forward risk being colour-dependent at the visual layer.** Completion = success-green fill — but the spec already adds a **white check glyph** and a **strike** on the line, so completion has a non-colour signal (good — keep it explicit). Carry-forward, however, is "a quiet, fixed highlight" with the *only* described non-colour cue being the **text** "still needs doing." If that phrase is not always rendered (e.g. compact rows), the state is colour-only. | Make the check glyph + strike a hard requirement for "done" (state it in DESIGN.md, not just implied). For carry-forward, require a persistent non-colour signal — the "still needs doing" label or a small neutral icon — on every surface the state appears, so it never reduces to a tint alone. |
| **should-fix** | DESIGN.md Components (checkbox border, subtask-card border) | **Non-text UI affordances fall below the 3:1 graphical-contrast minimum (WCAG 1.4.11).** Unchecked checkbox border `#3f6f8c` on surface `#0a3450` = **2.39:1**; subtask-card border `#1a5077` on subtask bg `#0f3c5b` = **1.35:1**. Both are below the 3:1 floor for the boundary of an interactive control / meaningful container. A recessed checkbox whose border is the only thing marking the hit area is hard to locate for low-vision users. | Raise the checkbox border and subtask-card border luminance until each clears 3:1 against its own background (the recessed/inner-shadow look can be preserved with a lighter rim). Verify per scheme — light schemes need re-checking too. |
| **should-fix** | EXPERIENCE.md Accessibility Floor (focus-order bullet) | **Focus order rule is too thin for the dynamic surfaces.** "Focus order follows reading order; topmost dropdown/sheet closes first" covers static order and nested dismissal, but the Focus surface is **dynamic** (subtasks appear/vanish/reorder, tasks dim-and-sink, the day-end sweep removes items). Dismissal order for the **+FAB → quick-input** flow (focus must land in `#task-quick-input` and return sensibly on cancel) is unspecified. Modal "one level deep" is good, but Esc/back-button and focus-return are not stated. | Add rules: (1) on any list mutation, focus moves to a defined successor, never to `body`; (2) +FAB sets focus to the quick-input and restores focus to the FAB on dismiss; (3) sheets/dropdowns are dismissible by Esc and Android back, closing topmost-first; (4) the day-end sweep returns focus to a stable Focus/Archive anchor. |
| **nit** | DESIGN.md Color Schemes — Soft Paper accent #3f8f8a | **The "white option" (NFR8) accent is the weakest text contrast of any scheme (3.54:1).** Because Soft Paper is the accessibility-intent light scheme, its accent under-performing as text is a poor look even if accent is large-only. | Nudge Soft Paper's accent darker (e.g. toward #2f7a75) so it clears 4.5:1 and the white option visibly leads on contrast. |
| **nit** | DESIGN.md Companion `[ASSUMPTION]` · EXPERIENCE.md | **Creature recolor-per-scheme (NFR8 "matching coloured creature") is deferred to architecture, but no accessibility constraint is attached.** A hue/filter retint can crush contrast of the creature against `creature-tint` backgrounds or wash out the glow. | Add an a11y note to the recolor strategy: the creature silhouette and its reaction glow must remain perceivable (≥3:1 against its immediate background) in every scheme, and the glow must not be the *only* signal of a reaction (the copy line carries it — keep that). |
| **nit** | EXPERIENCE.md Voice/Tone, State Patterns, Accessibility Floor | **No-red / no-shame is held consistently — flagged as a positive, with one watch-item.** The stance is applied everywhere (carry-forward, empty, absence, archive) and explicitly framed as accessibility-of-affect (NFR5). Watch-item: the single `destructive` rose token on Delete-Account is the one exception; ensure it is never reused and its label does not rely on colour alone (it is text "Delete Account," so fine). | Keep. Add a one-line test to the contract: any new alarm/error state must pass the no-red rule, and destructive affordances must carry a text label, never colour alone. |

---

## Contrast spot-check

Approximate WCAG ratios. Light-scheme backgrounds and the muted-white tier are approximated where the token is an alpha value or the exact bg hex is not given; treat sub-AA results as "verify on the real token." Role thresholds: **body text 4.5:1**, **large/bold text & UI-component/graphics 3:1**.

| Pair | ~Ratio | Role | Pass? |
|---|---|---|---|
| Deep Sea white text `#fff` on bg `#04141f` | 18.7 | body text | ✅ |
| Deep Sea muted ~70% white on bg | 8.9 | secondary text | ✅ |
| Deep Sea highlight `#69c4d2` on bg | 9.3 | text/icon | ✅ |
| Deep Sea accent `#008080` on bg `#04141f` | **3.91** | as body text/link | ❌ (✅ as large/UI ≥3) |
| Deep Sea accent `#008080` on surface `#0a3450` | **2.72** | as text or UI boundary | ❌ |
| Deep Sea success `#2D6D54` on bg | **3.05** | as text | ❌ (≈ok as graphic ≥3) |
| Forest accent `#8aa98a` on dark bg | 6.30 | text/large | ✅ |
| Forest success `#3f6d4e` on dark bg | **2.72** | as text | ❌ (graphic-only borderline) |
| Twilight accent `#a99cd6` on dark bg | 6.94 | text/large | ✅ |
| Twilight success `#4a6a72` on dark bg | **2.97** | as text/graphic | ❌ (just under 3) |
| Accessible accent `#e89c4a` on surface `#2c3e52` | 4.84 | text | ✅ |
| Accessible accent `#e89c4a` on darker bg | 7.30 | text | ✅ |
| Accessible success `#4a8fb0` on darker bg | 4.59 | text | ✅ |
| **Accessible accent vs success (adjacency)** | 1.59 | distinguishability | ⚠️ low ratio — relies on lightness diff (L 0.41 vs 0.24, 1.7×) + hue; OK if never the sole cue |
| Soft Paper accent `#3f8f8a` on warm white | **3.54** | as body text/link | ❌ (✅ large only) |
| Soft Paper success `#3f7a5c` on warm white | 4.70 | text | ✅ |
| Soft Paper near-black text on white | 13.3 | body text | ✅ |
| Soft Pink accent `#a86b72` on light bg | **3.70** | as body text/link | ❌ (✅ large only) |
| Soft Pink success `#4d7a63` on light bg | 4.33 | text | ⚠️ borderline (just under 4.5) |
| Sky Blue accent `#3f86c4` on light bg | **3.50** | as body text/link | ❌ (✅ large only) |
| Sky Blue success `#3f7a64` on light bg | 4.54 | text | ✅ |
| Checkbox border `#3f6f8c` on surface `#0a3450` | **2.39** | UI boundary (1.4.11 ≥3) | ❌ |
| Subtask-card border `#1a5077` on subtask bg `#0f3c5b` | **1.35** | container boundary | ❌ |

**Reading:** the accent is safe as a *fill* (button background, wheel fill) and as *large* text, but is **sub-AA as body-size text/links in 4 of 7 schemes** (Deep Sea, Soft Paper, Soft Pink, Sky Blue). Several *success* greens hover near or below the 3:1 graphic floor on dark schemes — acceptable as a checkbox fill carrying a white check glyph, **not** acceptable if success ever renders as text/strike that must be read by colour alone (it carries a strike-through, which helps). The **Accessible scheme passes** all text roles and its accent/success are genuinely lightness-differentiated (orange L 0.41 vs blue L 0.24), so they survive deuteranopia/protanopia by value, not hue — good. Its only caveat is the low *adjacency* ratio (1.59) if the two ever sit edge-to-edge with no separator; keep a structural gap and never let colour be the sole differentiator.

---

## Tap targets

DESIGN.md/EXPERIENCE.md name ≥44pt iOS / 48dp Android for **checkboxes, nav items, the FAB, and subtask cards** — explicitly covered. Gaps to confirm at build (not spec blockers, but call them out):

- **Subtask dropdown disclosure** (tap-to-reveal) — the expand affordance is an interaction but not named in the tap-target list. Ensure its hit area meets the floor.
- **Recessed checkbox** — the *visual* box is small (radius `sm`, inside a subtask-card inside a card); the **hit target** must extend ≥44/48 beyond the visible rim. State this, since the recessed look invites a too-small target.
- **"I'm done for today"** button and **manual rearrange** drag handle — confirm both meet the floor; the drag handle especially (long-press-then-drag) needs an adequate grab zone.

---

## Summary of severity counts

- **Blockers: 2** — colour-only/weak-signal active state; accent sub-AA as text in most schemes.
- **Should-fix: 5** — incomplete reduced-motion enumeration; under-specified SR strings/focus management; completion+carry-forward non-colour signals; sub-3:1 UI affordance borders; thin focus-order rules for dynamic surfaces.
- **Nits: 3** — Soft Paper accent weakest contrast; creature-recolor a11y constraint; no-red stance (positive, with one watch-item).
