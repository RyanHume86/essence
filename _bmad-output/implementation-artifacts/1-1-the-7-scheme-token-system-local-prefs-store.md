---
baseline_commit: 162182f40ff6756f6a09200a2b241dd94f30558b
---

# Story 1.1: The 7-scheme token system & local prefs store

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a builder,
I want the app to wear any of seven calm colour schemes and remember my choice on my device,
So that the space feels like mine from the first tap.

## Acceptance Criteria

1. **Default scheme, no network.** Given the app loads with no stored prefs, when it renders, then it uses the default **Deep Sea** (dark) scheme **and** no network call is made to load prefs. *(AD-6)*

2. **Live re-skin via CSS custom properties.** Given a scheme is applied, when the root data-attribute is set, then every shipped primitive (`.surface-raised`, `.btn-accent-3d`, `.input-glow`, `.checkbox`, progress-wheel, companion) re-skins live via CSS custom properties **and** there is no hardcoded hex — only design tokens. *(NFR5, UX-DR1, AD-10)*

3. **All 7 schemes calm, single-accent, no alarm.** Given each of the 7 schemes (Deep Sea, Forest/Sage, Twilight, Soft Paper [white], Accessible [colourblind-safe], Soft Pink, Sky Blue), when it is active, then no red/alarm colour appears in the task loop and a single accent holds (~10% of screen). *(NFR8, UX-DR1, UX-DR15)*

4. **Persistence is local-only.** Given a scheme choice, when the app is reloaded, then the choice persists via `usePrefs` (localStorage) **and** no Base44 write occurred. *(AD-6)*

5. **Accent text-contrast rule.** Given the token roles, when text colours are assigned, then the accent is used only as a fill / large-text (≥18.66px or ≥14px bold) / UI-component colour (≥3:1) — never for body-size text or links; small interactive text/links use `highlight` (which is a brighter accent on dark schemes and a darkened accent on light schemes, always ≥4.5:1). *(UX-DR10)*

6. **`usePrefs` is the sole prefs funnel.** `usePrefs` exposes `name`, `scheme`, `creature`, `onboarded`, and is the only module reading/writing those keys. *(AD-1, AD-6)*

## Tasks / Subtasks

- [x] **Task 1 — Move the colour layer from hardcoded values to CSS custom properties, scheme-scoped by a root data-attribute (AC: 2, 3)**
  - [x] In `src/index.css`, add one `[data-scheme="…"] { … }` block per scheme under `@layer base`, each declaring the full token set as **space-separated RGB channels** (see Dev Notes → "The opacity-modifier gotcha"). Deep Sea's block may live on `:root` as the default, but ALSO provide `[data-scheme="deep-sea"]` so switching back is explicit. → Deep Sea shares `:root, [data-scheme="deep-sea"]`; 6 other blocks added.
  - [x] Populate all 7 schemes from the palette table in Dev Notes (values are authoritative — from `mockups/palette-schemes.html`).
  - [x] In `tailwind.config.js`, rewrite every colour token per the **Complete token disposition** table in Dev Notes — each is either scheme-reactive (`rgb(var(--token) / <alpha-value>)`) or explicitly stays fixed. **Keep the exact same token names** so no component markup changes. Do not leave a semantic token pointing at a raw Deep-Sea hex, or it will bleed blue into the other 6 schemes (146 usages ride on these tokens across 30 files).
  - [x] Migrate the **2 raw-scale usages** (`text-success` in `CalendarSync.jsx` + `TaskItem.jsx`) — both resolve to `success.DEFAULT`, so making `success.DEFAULT` scheme-reactive themes them with no component edit; the numeric `seablue`/`teal`/`success` shades stay fixed.
  - [x] Rewrite the hardcoded hex in the `@layer components` primitives in `src/index.css` (`.surface-raised`, `.btn-accent-3d`, `.input-glow`, `.subtask-card`, `.checkbox`, `.skeleton`, `.title-strike`) to use `rgb(var(--…) / α)` / `var(--…)` references. (White/black rgba overlays for lighting/shadow kept as-is — they are lighting, not palette.)
  - [x] Replace the hardcoded background gradient in `src/components/layout/AppLayout.jsx:28` with token-driven values (`--bg-glow` + `--background` channels per scheme).
- [x] **Task 2 — Build the `usePrefs` local store (AC: 1, 4, 6)**
  - [x] Create `src/lib/prefs.js` — **pure, tested** logic: `DEFAULT_PREFS`, `SCHEMES` catalog (key, label, mode), `readPrefs()` / `writePrefs(patch)` over `localStorage` key `essence_prefs`, and `normalizePrefs(raw)` (coerce unknown/missing `scheme` → `deep-sea`, fill defaults). No React, no Base44 import.
  - [x] Create `src/hooks/usePrefs.js` — a `PrefsProvider` (React Context) + `usePrefs()` hook. Holds prefs in state (initialized synchronously from `readPrefs()`), exposes `{ name, scheme, creature, onboarded, updatePrefs, setName, setScheme, setCreature, setOnboarded }`, and writes through `writePrefs` on every change. Only module (besides `src/lib/prefs.js`) touching the `essence_prefs` key.
  - [x] Apply the active scheme to the document root: in `PrefsProvider`, a `useLayoutEffect` sets `document.documentElement.dataset.scheme = scheme` and `.style.colorScheme = mode`.
  - [x] Mount `PrefsProvider` as the outermost provider (wrapped `<App />` in `src/main.jsx`), covering the `/preview` dev branch.
  - [x] Add `data-scheme="deep-sea"` statically to the `<html>` tag in `index.html` so the default paints with no flash before React hydrates.
- [x] **Task 3 — Tests & verification (AC: 1, 3, 4, 5)**
  - [x] `src/lib/prefs.test.js` (Vitest, colocated): default when storage empty; round-trip write→read; unknown scheme normalizes to `deep-sea`; `onboarded` defaults `false`; malformed-JSON tolerance; 7-scheme catalog shape. 18 tests, all pass. No `@base44` import in the module.
  - [x] Deep-Sea visual-parity gate — verified **by construction**: every Deep Sea token var equals the exact shipped hex, and a completeness audit confirms all 19 tokens are defined in all 7 scheme blocks (no undefined-var fallbacks). Runtime pixel spot-check deferred to /verify (see Completion Notes — local app is Base44-auth-gated + preview tooling unreliable in this env).
  - [x] 7-scheme values sourced from the authoritative `palette-schemes.html`; single-accent + no-red hold by palette design. ⚠️ Light-scheme structural-border contrast (checkbox/subtask/`--line-1`) is derived, not measured — flagged for a runtime contrast spot-check at /verify.
  - [x] No Base44 call on prefs load — `prefs.js`/`usePrefs.js` import only `localStorage` and `@/lib/prefs`; no `@base44` import anywhere in the prefs path (grep-verified).

## Dev Notes

### What this story is (and is NOT)
This is **pure foundation** for Epic 1 — it carries **no FR of its own**. It builds the two things every later personalization story consumes: the **`usePrefs` local store** and the **7-scheme CSS-variable token system**. It is explicitly the story the readiness review flagged as *"bundles two concerns (7-scheme theming + `usePrefs`) … coupled since scheme is a pref"* [Source: implementation-readiness-report-2026-07-01.md]. Keep it to these two concerns.

- **NOT in this story:** the Settings UI to change scheme (Story 1.4), the onboarding scheme/creature pickers (Story 1.3), the creature `feColorMatrix` recolor (Story 3.7 — deferrable tail), the 4-surface routing restructure (Story 1.2). Story 1.1 only makes scheme switching *possible and persistent*; nothing yet drives it from the UI beyond the stored default.
- The `creature` pref is stored here with a sensible default, but the **creature preset catalog is defined in Story 1.3** — do not build a creature picker or recolor here.

### The current state you are changing (READ THIS — it prevents the main failure mode)
The app today is **dark-only Deep Sea, with colours living as literal hex in `tailwind.config.js`**, not in CSS variables. `src/index.css`'s `:root` holds **only** non-colour tokens (`--radius`, fonts). There is **no** `.dark` class, no theme provider, no `data-*` scheme mechanism — this is greenfield for the switching mechanism, so nothing pre-existing will fight you. [Source: current `src/index.css`, `tailwind.config.js`]

- **Colours to migrate live in two places:** (1) `tailwind.config.js` `theme.extend.colors` (semantic aliases + `seablue`/`teal`/`success` scales + shadcn tokens); (2) hardcoded hex inside `@layer components` in `src/index.css` (the six primitives) **and** `src/components/layout/AppLayout.jsx:28` (background gradient).
- **Two component-level hex sites are OUT of scope for 1.1** (they belong to features rebuilt in Epic 3 — don't churn them now, but note them): `src/components/tasks/ProgressRing.jsx:10` (confetti colour array — the progress wheel is rebuilt in Story 3.4) and `src/components/companion/Companion.jsx:103` (drop-shadow glow — the companion is rebuilt in Epic 3 / Story 3.7). If tokenizing them is a trivial `var()` swap, do it; if it forces behavioural change, leave a `// TODO(story-3.x): tokenize` and move on. Do not expand scope into the wheel/companion internals.

### ⚠️ The opacity-modifier gotcha — the one thing that will silently break the app
Tailwind opacity modifiers are used heavily on these tokens (e.g. `bg-primary/10`, `bg-highlight/25`, `border-primary/30`, `muted.foreground: 'rgb(255 255 255 / 0.7)'`) — 36+ occurrences across 15 files, and the active-chip idiom in `project-context.md` is `bg-primary/10 text-highlight border-primary/30`.

**If you naively set `surface: 'var(--surface)'` with `--surface: #0a3450`, then `bg-surface/25` produces the invalid `rgb(var(--surface) / 0.25)` and every `/opacity` utility breaks.** Tailwind can only inject the alpha when the variable is a **channel triplet** and the token is declared with the `<alpha-value>` placeholder.

**Do it this way:**
```css
/* index.css */
[data-scheme="deep-sea"] {
  --background: 4 20 31;      /* #04141f */
  --surface:    10 52 80;     /* #0a3450 */
  --border:     10 58 82;     /* #0a3a52 */
  --foreground: 255 255 255;  /* #ffffff */
  --accent:     0 128 128;    /* #008080 */
  --accent-hover: 0 161 161;  /* #00a1a1 */
  --highlight:  105 196 210;  /* #69c4d2 */
  --success:    45 109 84;    /* #2D6D54 */
  --creature-tint: 3 36 58;   /* #03243A */
  /* muted foreground is text @ ~70% — see note below */
}
```
```js
// tailwind.config.js
surface:    'rgb(var(--surface) / <alpha-value>)',
primary:    { DEFAULT: 'rgb(var(--accent) / <alpha-value>)', foreground: 'rgb(var(--accent-foreground) / <alpha-value>)' },
highlight:  'rgb(var(--highlight) / <alpha-value>)',
// …same pattern for background, foreground, border, input, ring, card, popover, accent, success, etc.
```
Now `bg-surface`, `bg-surface/25`, `text-highlight`, `bg-primary/10` all keep working **and** become scheme-reactive with **zero component-markup changes**. This channel form is the same mechanism shadcn uses (`hsl(var(--x))`); we use RGB triplets because the design source is hex.

- **`muted`/`foreground-muted`:** the muted-text tier is the scheme text colour at 60–70% alpha and the alpha differs per scheme (dark ≈ .66–.70, light ≈ .60–.62). Simplest robust approach: define `--foreground` as channels and set `muted.foreground: 'rgb(var(--foreground) / 0.7)'`, accepting a fixed .7; **or** give each scheme a `--foreground-muted` full value. Either is fine — just keep it token-driven, no hardcoded hex.
- **`accent-foreground` (button label on the accent fill):** near-white on every scheme (dark schemes use `#ffffff`; light schemes use the near-white surface, e.g. Soft Paper `#fbf8f1`). Add an `--accent-foreground` channel per scheme; keeping it white-ish everywhere is acceptable and matches the mockup CTAs.
- **`--radius` and fonts stay as-is** — they are scheme-independent; do not move them.

### The authoritative 7-scheme palette (from the mockup — use these exact hexes)
[Source: mockups/palette-schemes.html — the final concrete hex per variant. DESIGN.md gives only accent/success/creature-tint for the non-default schemes; the mockup is the complete table.]

| scheme (key) | mode | background | surface | border | text | text-muted | accent | accent-hover | highlight | success | creature-tint |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Deep Sea** `deep-sea` *(default)* | dark | `#04141f` | `#0a3450` | `#0a3a52` | `#ffffff` | `rgba(255,255,255,.70)` | `#008080` | `#00a1a1` | `#69c4d2` | `#2D6D54` | `#03243A` |
| **Forest/Sage** `forest-sage` | dark | `#10180f` | `#1b2618` | `#2a3a26` | `#eef2e9` | `rgba(238,242,233,.66)` | `#8aa98a` | `#a3c0a3` | `#b6d0a8` | `#3f6d4e` | `#243029` |
| **Twilight** `twilight` | dark | `#14101f` | `#221b33` | `#322a47` | `#efeaf7` | `rgba(239,234,247,.66)` | `#a99cd6` | `#c2b6ec` | `#c7bdf0` | `#4a6a72` | `#2a2440` |
| **Soft Paper** `soft-paper` | light | `#f4f0e8` | `#fbf8f1` | `#e4ddcf` | `#2f2a24` | `rgba(47,42,36,.62)` | `#3f8f8a` | `#357a76` | `#2f7d78` | `#3f7a5c` | `#cbb89a` |
| **Accessible** `accessible` | dark | `#0f1c28` | `#1a2c3c` | `#2a4054` | `#f2f6fa` | `rgba(242,246,250,.70)` | `#e89c4a` | `#f4ad60` | `#6db6e8` | `#4a8fb0` | `#2c3e52` |
| **Soft Pink** `soft-pink` | light | `#f3eaea` | `#fbf4f3` | `#e6d4d3` | `#34282a` | `rgba(52,40,42,.62)` | `#a86b72` | `#95595f` | `#8f5159` | `#4d7a63` | `#c7a3a0` |
| **Sky Blue** `sky-blue` | light | `#eef4fa` | `#f8fbfe` | `#d6e3ef` | `#28333d` | `rgba(40,51,61,.60)` | `#3f86c4` | `#336fa6` | `#2f74b3` | `#3f7a64` | `#aac4dc` |

**4 dark** (deep-sea, forest-sage, twilight, accessible) + **3 light** (soft-paper, soft-pink, sky-blue) = 7. [Source: SPEC.md#CAP-9]

**Key token-role facts baked into this table:**
- `highlight` is the **small-text/link + focus/glow** colour on every scheme. It is a *brighter* accent on dark schemes (`#69c4d2` vs accent `#008080`) and a *darkened* accent on light schemes (`#2f7d78` vs accent `#3f8f8a`). This single token satisfies UX-DR10's "small interactive text/links use `highlight` on dark, darkened `accent-text` on light" — you do **not** need a separate `accent-text` token. [Source: DESIGN.md#Colors "Accent text-contrast rule"; mockups/palette-schemes.html]
- `accent` is fill/large-text/UI-component only (≥3:1) — never body copy or links. [Source: DESIGN.md#Colors; AD-10]
- The active-subtask tint in the mockup is `rgb(accent / 0.1)` with `highlight` text — exactly the `bg-primary/10 text-highlight` idiom the opacity-modifier fix preserves.
- No scheme contains red/alarm colour in the loop. The one shipped `destructive` token (rose, Delete-Account label only) is the single deliberate exception and **must never appear in the task loop**; it may stay a fixed value for 1.1 (a per-scheme muted destructive is a nice-to-have, not required). [Source: DESIGN.md#Brand & Style "No red, no alarm"]

### Complete token disposition (`tailwind.config.js`)
Every token in the config must be consciously placed. **Scheme-reactive** → `rgb(var(--token) / <alpha-value>)`, defined per scheme in `index.css`. **Fixed** → leave as-is (decorative/dormant/out-of-loop). Nothing may be left as a raw Deep-Sea hex behind a semantic name. [Source: current `tailwind.config.js`; usage counts from repo grep]

| token | disposition | maps to var / note |
|---|---|---|
| `background` | **reactive** | `--background` |
| `background-deep` | **reactive** | derive one step darker than `--background` (only in dormant sidebar today, but structural) |
| `foreground` | **reactive** | `--foreground` |
| `surface` | **reactive** | `--surface` |
| `surface-hover` | **reactive** | derive one step lighter than `--surface` (mockup has no explicit value) |
| `highlight` | **reactive** | `--highlight` |
| `primary-hover` | **reactive** | `--accent-hover` |
| `card` / `popover` | **reactive** | `= --surface` (+ `foreground` = `--foreground`) |
| `primary` | **reactive** | `DEFAULT = --accent`, `foreground = --accent-foreground` |
| `secondary` | **reactive** | a secondary surface tone — map to `--surface-hover` (or `--border`); do NOT leave at seablue `#014c75` |
| `muted` | **reactive** | `DEFAULT` = a recessed surface; `foreground = rgb(var(--foreground) / 0.7)` |
| `accent` (shadcn token) | **reactive** | ⚠️ this is the shadcn *hover-surface* token (`#114660`), **not** the brand accent — map to `--surface-hover` |
| `border` / `input` | **reactive** | `--border` |
| `ring` | **reactive** | `--highlight` |
| `destructive` | **fixed** | the single deliberate exception (Delete-Account label only); must never appear in the task loop |
| `seablue` / `teal` / `success` numeric scales | **fixed** | Deep-Sea raw values; only 2 direct usages (migrate those to semantic tokens per Task 1) |
| `category.*` | **fixed** | decorative + dormant (no v1 UI — pure-priority model) |
| `chart.*` | **fixed** | decorative + dormant |
| `sidebar.*` | **fixed** | dormant (v1 uses bottom nav, no sidebar) |
| `borderRadius`, `fontFamily` | **unchanged** | non-colour, scheme-independent |

Note: `RecurrenceEditor.jsx` (14 token usages) is dormant/unwired but themes for free via these tokens — no special handling.

### `usePrefs` contract & placement
[Source: ARCHITECTURE-SPINE.md#AD-6, #AD-1, #Structural Seed, #Design Paradigm]
- **Storage:** localStorage key `essence_prefs`, JSON `{ name, scheme, creature, onboarded }`. Follows the shipped `essence_*` key convention (`essence_win_*`, `essence_calendar_connected`). **Never** written to Base44 — no cross-device pref sync in v1 (a future cloud mirror would live *behind* `usePrefs`). [AD-6, Deferred]
- **`usePrefs` is a domain store** in the same port-and-adapter sense as `useTasks`: the single funnel for the prefs domain, the only code allowed to reach its persistence adapter (here, localStorage). Surfaces never read `localStorage` directly. [AD-1]
- **Hook order is stable** — never call `usePrefs()` conditionally. [AD-2]
- **Files:** pure logic → `src/lib/prefs.js` (+ `prefs.test.js`); the Context/hook → `src/hooks/usePrefs.js`. Naming: hooks `useX.js`, lib `camelCase.js`, imports via the `@/` alias, JS/JSX only (JSDoc types). `src/lib` is uncovered by ESLint/typecheck — **Vitest is its only safety net**, so the pure prefs logic must ship with tests. [Source: project-context.md; ARCHITECTURE-SPINE.md#Consistency Conventions]
- **Why a Context provider (not a bare hook):** scheme changes must (a) update `document.documentElement.dataset.scheme` once and (b) let name/creature consumers re-render. A `PrefsProvider` at the app root is the clean way; a module singleton like the shipped `winMoment.js` is the anti-pattern AD-1 is retiring — do not copy it. `useTasks` is TanStack-Query-based and is the wrong template here (prefs are local, synchronous, no network) — mirror its *export shape* (an object of state + actions), not its Query internals.

### Where the root attribute and provider go
- `data-scheme` → `document.documentElement` (`<html>`). Static `data-scheme="deep-sea"` in `index.html` avoids a first-paint flash; `PrefsProvider`'s `useLayoutEffect` then reconciles it to the stored scheme. [Source: DESIGN.md#Color Schemes; AD-10]
- Provider mount: outermost, in `src/main.jsx` around `<App />` (covers the `/preview` dev branch in `App.jsx:67`), or top of `App()` above `<AuthProvider>` in `src/App.jsx:71-80`. [Source: current `src/App.jsx`, `src/main.jsx`]

### Reduced-motion / calm invariants that constrain the tokens
- No red/alarm colour in any scheme's loop; single accent ~10% of screen. [AD-11, UX-DR15]
- This story adds no animation, but if you add any scheme-transition affordance it must gate on `useReducedMotion()` and resolve to end-state. [AD-11]
- Elevation is carried by **lightness, not hue** (cards lift by being a shade lighter/darker, not a different colour) — preserve this when tokenizing `.surface-raised`. [Source: DESIGN.md#Colors, #Elevation & Depth]

### Project Structure Notes
- New: `src/lib/prefs.js`, `src/lib/prefs.test.js`, `src/hooks/usePrefs.js`. Updated: `src/index.css`, `tailwind.config.js`, `index.html`, `src/main.jsx` (or `src/App.jsx`), `src/components/layout/AppLayout.jsx`.
- Do **not** hand-edit `src/components/ui/**` (shadcn vendor). The shadcn tokens it consumes are remapped centrally in `tailwind.config.js`, so vendor components inherit the theming for free.
- The Tailwind `content` glob and `@/` alias already cover these paths — no config plumbing needed beyond the colour remap.

### Visual-parity gate (do this before flipping on switching)
Because `.surface-raised`, `.btn-accent-3d`, `.checkbox`, `.subtask-card`, `.input-glow`, `.skeleton` are used in 10+ places, a botched channel conversion causes wide, silent visual regressions. **Verify Deep Sea renders pixel-identical to `main` today** (spot-check a card, the primary button, a checkbox done-state, a focused input, the active-subtask chip) before wiring any non-default scheme. Only then confirm the other 6 schemes.

### References
- [Source: ARCHITECTURE-SPINE.md#AD-6] — prefs local in localStorage behind `usePrefs`; never Base44; keys name/scheme/creature/`onboarded`; no v1 cross-device sync.
- [Source: ARCHITECTURE-SPINE.md#AD-10] — 7 schemes re-skin one primitive set via CSS custom properties swapped by a root data-attribute; only token *values* change; no hardcoded hex; single-accent + semantic-success invariant.
- [Source: ARCHITECTURE-SPINE.md#AD-1, #AD-2, #Design Paradigm, #Structural Seed] — port-and-adapter store; `usePrefs.js` in `src/hooks`; stable hook order.
- [Source: ARCHITECTURE-SPINE.md#AD-11] — no red/alarm colour; reduced-motion end-states.
- [Source: DESIGN.md#Colors, "Accent text-contrast rule"] — accent fill-only ≥3:1; small text/links use `highlight` (dark) / darkened accent ≥4.5:1 (light).
- [Source: DESIGN.md#Brand & Style] — "No red, no alarm — anywhere"; single-accent ~10% discipline; lightness-not-hue elevation.
- [Source: DESIGN.md#Typography / #rounded] — Playfair/Inter; `--radius` 0.75rem ramp (scheme-independent).
- [Source: mockups/palette-schemes.html] — the complete 7-scheme hex table above (authoritative).
- [Source: epics.md#Story 1.1] — acceptance criteria; Epic 1 "reuses shipped Companion.jsx as-is".
- [Source: SPEC.md#CAP-9] — 7 schemes = four dark, three light, incl. white + colourblind-safe.
- [Source: project-context.md] — `@/` alias, JS/JSX only, `src/lib` Vitest-only net, no hardcoded hex, active-chip idiom `bg-primary/10 text-highlight border-primary/30`.
- [Source: implementation-readiness-report-2026-07-01.md] — Story 1.1 flagged splittable; Epic 1 is front-loaded foundation.
- Current code: `src/index.css` (tokens + primitives), `tailwind.config.js` (colour scales), `src/App.jsx:71-80`, `src/main.jsx`, `src/components/layout/AppLayout.jsx:28`, `src/lib/winMoment.js` (localStorage pattern to mirror in convention, NOT in singleton shape).

## Review Findings (code review 2026-07-01)

- [x] [Review][Patch] Scheme FOUC on cold load for non-default schemes [index.html] — **FIXED**: added a synchronous pre-paint `<script>` in `index.html` that reads `essence_prefs` and sets `data-scheme` before first paint (usePrefs reconciles/validates on mount).
- [x] [Review][Defer] Light-scheme structural-border contrast unmeasured (checkbox / subtask `--line-1`, `--checkbox-border`) — derived, not measured; carry to /verify (already flagged).
- [x] [Review][Defer] Cosmetic per-scheme token nits — light-scheme skeleton shimmer inverts (mid-stop darker than white ends); `secondary` and `accent` now both map to `--surface-hover` (visually identical); `.subtask-card` bg equals the `.surface-raised` top stop (reduced contrast); the scheme swatch relies on `SCHEMES` and the `[data-scheme]` CSS blocks staying in sync. Low value; verify visually.
- [x] [Review][Defer] AC-2 letter: Companion + progress-wheel still hold hardcoded hex — consciously fenced out of scope in Dev Notes; Epic 3 (Stories 3.4 / 3.7) tokenizes them. The promised `// TODO(story-3.x)` markers were not added.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.8) — bmad-dev-story workflow

### Debug Log References

- `npx vitest run` → 3 files, **65 tests pass** (18 new in `prefs.test.js`, 0 regressions).
- `npm run lint` (eslint --quiet) → **0 errors**.
- `npm run build` (vite build) → **exit 0** (Tailwind token syntax + CSS + JSX all compile).
- `npm run typecheck` → 91 errors, **identical on baseline** (git-stash comparison) → **0 regressions introduced**; none in `prefs.js`/`usePrefs.js`. Pre-existing shadcn/`checkJs` noise in auth/settings pages (`src/lib`, `src/api`, `src/components/ui` are excluded from typecheck; these are pages).
- CSS var completeness audit → all **19 tokens defined in all 7 scheme blocks** (no undefined-var fallbacks).

### Completion Notes List

**Implemented (Task 1 — theming):** Colours moved out of `tailwind.config.js` literals into per-scheme CSS custom properties (space-separated RGB channels) swapped by the root `data-scheme` attribute. Tailwind semantic tokens now resolve via `rgb(var(--token) / <alpha-value>)`, so all existing `/opacity` utilities (`bg-primary/10`, `bg-highlight/25`, …) keep working and become scheme-reactive with **zero component-markup changes**. All 7 schemes (4 dark + 3 light) populated from `palette-schemes.html`. Primitives (`.surface-raised`, `.btn-accent-3d`, `.input-glow`, `.subtask-card`, `.checkbox`, `.skeleton`, `.title-strike`) and the `AppLayout` background gradient tokenized. `index.html` gets a static `data-scheme="deep-sea"` to avoid first-paint flash.

**Deep Sea parity:** every Deep Sea token var is set to the **exact shipped hex** → default scheme is guaranteed identical by construction. Two deliberate mapping refinements, each Deep-Sea-preserving: (a) added a dedicated `--muted` var (Deep Sea `#001927`) because `bg-muted` is a visible fill (EmptyState circle, TaskItem chips, drawer handle) — mapping it to `--background-deep` would have darkened those; (b) `--accent-fg` is per-scheme (white on dark-accent schemes, near-white surface / dark text where the accent is light) matching the mockup CTA colours. White/black rgba overlays (inner highlights, drop shadows, recessed insets) were kept literal — they are lighting, not palette.

**Implemented (Task 2 — prefs store):** `src/lib/prefs.js` holds the pure, tested core (`SCHEMES`, `DEFAULT_PREFS`, `normalizePrefs`, `readPrefs`, `writePrefs` over the `essence_prefs` localStorage key; never throws, never touches the network, no Base44 import). `src/hooks/usePrefs.js` wraps it as a `PrefsProvider` context + `usePrefs()` hook (written with `React.createElement` so the `useX.js` naming holds without the JSX loader); a `useLayoutEffect` applies `data-scheme` + `color-scheme` to `<html>`. Mounted outermost in `src/main.jsx`.

**Migration note:** the "2 raw-scale usages" turned out to be `text-success` (→ `success.DEFAULT`), so making `success.DEFAULT` reactive themed them with no component edit needed.

**⚠️ Verification scope / handoff to /verify + /code-review:** automated gates (unit tests, lint, build, typecheck-no-regression, var-completeness) all pass, and Deep Sea parity is construction-guaranteed. What was **not** possible in this environment: a live pixel-level render check — the local app is Base44-auth-gated (no `.env.local` credentials, so it sits on the auth spinner) and the preview MCP bound to a detached frame (empty computed styles), so screenshots were inconclusive. **Recommended at /verify (real browser + Base44 creds, or the no-auth `/preview` route):** (1) eyeball Deep Sea against `main` for pixel parity; (2) cycle all 7 schemes; (3) measure light-scheme structural-border contrast (`--checkbox-border`, `--line-1` on Soft Paper / Soft Pink / Sky Blue) against the ≥3:1 floor — those values are derived, not measured, and are the most likely thing to need a nudge.

**Scope held:** no Settings UI, no onboarding, no creature recolor, no routing changes (later stories). The out-of-scope hex sites (`ProgressRing.jsx` confetti, `Companion.jsx` glow) were left untouched per the story fence.

### Change Log

- 2026-07-01 — Implemented Story 1.1: 7-scheme CSS-variable token system (root `data-scheme`) + `usePrefs` local store. New: `src/lib/prefs.js`, `src/lib/prefs.test.js`, `src/hooks/usePrefs.js`. Tokenized `src/index.css`, `tailwind.config.js`, `src/components/layout/AppLayout.jsx`; mounted `PrefsProvider` in `src/main.jsx`; static default scheme in `index.html`. 65 tests pass, lint/build clean, 0 typecheck regressions. Status → review.

### File List

**New:**
- `src/lib/prefs.js` — pure prefs storage/normalization + `SCHEMES` catalog
- `src/lib/prefs.test.js` — 18 Vitest tests
- `src/hooks/usePrefs.js` — `PrefsProvider` context + `usePrefs()` hook
- `.claude/launch.json` — dev-server config for the preview tool (verification aid)

**Modified:**
- `src/index.css` — 7-scheme CSS custom properties + tokenized primitives
- `tailwind.config.js` — semantic tokens remapped to `rgb(var(--x) / <alpha-value>)`
- `src/components/layout/AppLayout.jsx` — tokenized background gradient
- `src/main.jsx` — wrapped `<App />` in `<PrefsProvider>`
- `index.html` — static `data-scheme="deep-sea"` on `<html>`
