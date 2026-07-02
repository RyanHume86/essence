# UX Spine Review — Coverage + Consistency Rubric

Documents reviewed:
- `DESIGN.md` (visual identity spine)
- `EXPERIENCE.md` (behavior / IA / flows spine)
- against `design-md-spec.md` and `prd.md` (FR1–FR26, NFR1–NFR12)

Scope: completeness, cross-reference integrity, contradictions. Not taste.

---

## Coverage Verdict

**PASS (with notes).** Both spines are structurally complete, all canonical sections are present and in locked order, every cross-reference resolves, and no FR/NFR is left uncovered. No contradictions were found between the two files. The only open items are the deliberately-tagged `[ASSUMPTION]` / `[NOTE FOR ARCHITECTURE]` deferrals, which are correctly flagged rather than silently dropped.

| Check | Result |
|---|---|
| 1. DESIGN.md sections + order + frontmatter | PASS |
| 2. EXPERIENCE.md sections + named protagonist + climax | PASS |
| 3. Cross-reference integrity | PASS (0 dangling) |
| 4. FR/NFR coverage | PASS (0 uncovered) |
| 5. Contradictions | PASS (0 found) |
| 6. Dangling assumptions/notes collected | PASS (8 tags) |

---

## Section-Presence Checklist

### DESIGN.md — canonical body sections (locked order)

| # | Required section | Present | In order |
|---|---|---|---|
| 1 | Brand & Style | yes | yes |
| 2 | Colors | yes | yes |
| 3 | Typography | yes | yes |
| 4 | Layout & Spacing | yes | yes |
| 5 | Elevation & Depth | yes | yes |
| 6 | Shapes | yes | yes |
| 7 | Components | yes | yes |
| 8 | Do's and Don'ts | yes | yes |

Order is exactly as locked by the spec.

### DESIGN.md — frontmatter keys

| Key | Present |
|---|---|
| name | yes (`Essence`) |
| description | yes |
| colors | yes (flat, kebab-case, hex/rgba) |
| typography | yes (display, heading, body, body-strong, meta) |
| rounded | yes (DEFAULT, md, sm, full) |
| spacing | yes (1–7, gutter, nav-clearance) |
| components | yes (card, button-primary, input, checkbox, subtask-card, progress-wheel, companion) |

All required frontmatter keys present.

### EXPERIENCE.md — sections

| Required section | Present |
|---|---|
| Foundation | yes |
| Information Architecture | yes |
| Voice and Tone | yes |
| Component Patterns | yes |
| State Patterns | yes |
| Interaction Primitives | yes |
| Accessibility Floor | yes |
| Key Flows | yes |
| Inspiration & Anti-patterns | yes |

**Named protagonist + climax beat:** PASS. Protagonist = **Ryan** (declared in Key Flows). All three journeys use him and carry an explicit climax beat: UJ-1 has a labelled **Climax** (the deep, slow sigh / day inverts); UJ-2 has **Climax (quiet)** (head empty, creature stayed out of the way); UJ-3 has **Climax** (dropped gently into a space that already feels his).

---

## Dangling Token-Reference List

Every `{path.to.token}` in EXPERIENCE.md was resolved against DESIGN.md frontmatter.

| Reference | Resolves? | Target |
|---|---|---|
| `{components.card}` | yes | components.card |
| `{components.subtask-card}` | yes | components.subtask-card |
| `{components.checkbox}` | yes | components.checkbox |
| `{components.progress-wheel}` | yes | components.progress-wheel |
| `{components.companion}` | yes | components.companion |
| `{components.button-primary}` | yes | components.button-primary |
| `{colors.accent}` | yes | colors.accent |

`{path.to.token}` (EXPERIENCE.md line 15) is the literal syntax-explanation placeholder, not a real reference — excluded.

**Dangling / misspelled references: 0.**

---

## FR / NFR Coverage Table

Legend for "Where": **D** = DESIGN.md, **E** = EXPERIENCE.md, **ARCH** = explicitly flagged for the architecture phase.

| ID | Covered? | Where |
|---|---|---|
| FR1 | yes | E (UJ-3 onboarding: name/scheme/creature); D (Colors §Color Schemes — 7 schemes) |
| FR2 | yes | E (Voice & Tone — welcome message intent; UJ-3 step 5) |
| FR3 | yes | E (Settings surface; UJ-3 personalization editable) — IA Settings surface |
| FR4 | yes | E (UJ-2; State: Plan; capture any time) |
| FR5 | yes | E (UJ-2 priority 1–5; Ordering rule) + ARCH note (no priority field) |
| FR6 | yes | E (UJ-2 decompose; Component Patterns — subtask reveal) |
| FR7 | yes | E (UJ-2 step 4 — nudge to decompose, not required) |
| FR8 | yes | E (State: Plan populated — creature passive; UJ-2) |
| FR9 | yes | E (Ordering rule — date-only `YYYY-MM-DD`) |
| FR10 | yes | E (referenced via edit/delete in IA/state; subtasks editable) |
| FR11 | yes | D (Layout — one-thing-at-a-time); E (Focus card, UJ-1) |
| FR12 | yes | E (Ordering rule; Manual rearrange) + ARCH note (no order/sort field) |
| FR13 | yes | D (Components — subtask-card two-at-a-time); E (Two-subtasks reveal) |
| FR14 | yes | D (subtask-card active state); E (reveal behavior, tier 1) |
| FR15 | yes | E (State: just-completed dimmed & sinking; tier 2; UJ-1) |
| FR16 | yes | D (progress-wheel component); E (Progress wheel pattern) |
| FR17 | yes | D (companion motion tiers; Do/Don't); E (three-tier reaction ladder) |
| FR18 | yes | E (State: active task — soft greeting; UJ-1 arrival) |
| FR19 | yes | E ("I'm done for today"; end-of-day sweep; tier 3) |
| FR20 | yes | E (Accessibility Floor — reduced-motion); D (companion reduced-motion safe in Do's) |
| FR21 | yes | D (Colors — carry-forward never red/never intensifies); E (carry-forward state + voice) |
| FR22 | yes | E (IA Archive surface; State: archive populated) |
| FR23 | yes | E (Archive — completed only, no scoreboard) |
| FR24 | yes | E (State: truly-empty first-open beat; UJ-3 step 6) |
| FR25 | yes | D (progress-wheel — no denominator/number; Do's); E (wheel accumulate-only) |
| FR26 | yes | E (State: archive populated — structure makes scoreboard impossible) |
| NFR1 | yes | E (Foundation — lean ~17 deps, no new runtime deps) |
| NFR2 | yes | E/ARCH (Base44 cloud persistence; round-trip note) |
| NFR3 | yes | E (Foundation law; Accessibility Floor); D (reduced-motion in Do's) |
| NFR4 | yes | E (Foundation — optimistic/self-dismissing ~1.5s; State loading/rollback) |
| NFR5 | yes | D (Brand — no red/alarm; destructive-token exception); E (no-red principle) |
| NFR6 | yes | E (Foundation — honest rollback; State rollback) |
| NFR7 | yes | E (Accessibility Floor — notifications off by default) |
| NFR8 | yes | D (Color Schemes — Soft Paper white + Accessible colourblind-safe; creature-tint) |
| NFR9 | yes | E (IA Settings — personalization depth; onboarding stays minimal) |
| NFR10 | yes | E (IA Settings — account/privacy); ARCH (Base44 private single-user) |
| NFR11 | yes | ARCH (referenced as future local-first goal — schema/arch phase) |
| NFR12 | yes | E (ARCH note — src/lib Vitest-only; unit tests; Nidus round-trip) |

**FR/NFR with NO coverage anywhere: 0.**

Coverage notes (covered, but lightly):
- **FR10** (edit/delete tasks & subtasks) is implied through "subtasks stay editable" and general capture/plan utility rather than called out as its own line — covered but the thinnest.
- **NFR11** (local-first target architecture) is only referenced as a future/architecture concern, consistent with the PRD's own framing that v1 does not implement it.

---

## Contradictions List

**None found.** Cross-checked the common conflict surfaces:

| Potential conflict | DESIGN.md | EXPERIENCE.md | Agree? |
|---|---|---|---|
| Progress indicator form | Progress-wheel (circular ring), "Replaces the shipped horizontal bar (a placeholder)" | Progress wheel (circular accumulation ring); ARCH note "shipped bar is a placeholder to replace" | yes |
| Surface / nav count | 4-surface bottom nav: Focus · Plan · Archive · Settings, center +FAB | Four surfaces + onboarding; same nav + center +FAB | yes |
| +FAB behavior | (not specified in D) | Never directly creates; focuses Plan quick-input | no conflict |
| Full backlog on Focus | Forbidden on Focus (restraint §5) | Forbidden on Focus; lives on Plan | yes |
| Carry-forward treatment | Quiet fixed highlight, never red, never intensifies | Same — fixed calm highlight, never escalates | yes |
| Success-green usage | Completion only (checkbox done + strike) | Completion only (checkbox done state) | yes |
| Form factor | Mobile WebView-wrapped (`[ASSUMPTION]`) | Mobile iOS+Android WebView-wrapped | yes |
| Reaction tiers | 3 tiers, never scale with volume/priority | 3-tier ladder, flat within tier, event-type only | yes |
| Token values (accent #008080 etc.) | Frontmatter + scheme table | References by name only, no restated values | yes (no value drift) |
| Resting creature pose | `monkey_sit_laugh.svg` (`[ASSUMPTION]`) | (not restated) | no conflict |

Note (not a contradiction, an authority rule): EXPERIENCE.md Foundation states it "wins on behavioral conflict" while DESIGN.md is the visual reference — the precedence is declared, not contradicted.

---

## Collected Dangling Assumptions / Architecture Notes

### `[ASSUMPTION]` (5)

1. **DESIGN.md — Layout & Spacing:** Mobile iOS+Android WebView-wrapped app, inferred from shipped evidence (safe-area insets, `.pb-nav`, `overscroll-behavior:none`); treated as decided unless corrected.
2. **DESIGN.md — Components (companion):** Resting pose is the shipped `monkey_sit_laugh.svg`.
3. **EXPERIENCE.md — Ordering rule:** Priority-hidden-in-Focus is the memlog default (confirmed by Ryan; revisit at build only if needed).
4. **EXPERIENCE.md — Component Patterns (no-subtask task):** Checking a no-subtask task auto-completes the whole task and fires the task-tier reaction — memlog default (confirmed by Ryan; revisit at build).
5. **EXPERIENCE.md — Component Patterns (manual rearrange) / Accessibility Floor (SR strings):** Manual-rearrange gesture = long-press-then-drag, exact gesture unconfirmed; and exact screen-reader announcement strings unspecified — both confirm at build. *(Two distinct `[ASSUMPTION]` tags; counted as items 5a/5b below.)*

   - 5a. Manual rearrange interaction = long-press-then-drag on a Plan row; exact gesture unconfirmed.
   - 5b. Exact SR announcement strings unspecified — confirm at build.

(Total distinct `[ASSUMPTION]` tags = 6: items 1–4, 5a, 5b.)

### `[NOTE FOR ARCHITECTURE]` (5)

1. **EXPERIENCE.md — IA / Ordering:** Base44 Task entity has no priority field (FR5) and no explicit order/sort field (FR12) — schema gaps for the architecture phase.
2. **EXPERIENCE.md — IA:** `Task.category` exists in shipped data but PRD model is priority-driven; keep field, show no category UI, no migration.
3. **EXPERIENCE.md — Component Patterns (progress wheel):** Shipped `Companion.jsx` renders a horizontal bar (`RING_TARGET=8`); the wheel is the intended form, bar is a placeholder to replace.
4. **EXPERIENCE.md — State Patterns:** New core logic (ordering, day-end sweep, archive retention, subtask reveal) lands in `src/lib` (not covered by ESLint/typecheck) — Vitest-only; ships with unit tests (NFR12). Base44 schema changes must round-trip via a real read before wiring (Nidus failure mode).
5. **EXPERIENCE.md — Key Flows (UJ-3):** Onboarding prefs (name-to-be-called, colour scheme, creature) have no home in the User entity (stores only `role`); persisting FR1/FR3 needs a user-prefs store — schema gap for architecture.

### Architecture concern flagged inline in DESIGN.md (not a tagged note, but worth tracking)

- **DESIGN.md — Colors:** Creature-recolor constraint — the monkey is a ~243-path SVG with deep-blue fills baked in; "matching coloured creature per scheme" (NFR8) needs a recolor *strategy* (CSS filter retint / per-scheme exports / recolorable silhouette), explicitly deferred to the architecture phase.
