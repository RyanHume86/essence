---
name: Essence
description: Visual identity for Essence — a calm task companion built on restraint.
status: final
created: 2026-06-30
updated: 2026-06-30
sources:
  - ../../prds/prd-essence-2026-06-29/prd.md
  - ../../../project-context.md
  - ./.memlog.md
  - ./.working/color-themes-2.html
  - ../../../tailwind.config.js
  - ../../../src/index.css
colors:
  # DEFAULT scheme = Deep Sea (dark). Semantic roles; one of 7 schemes (see Colors body).
  background: '#04141f'
  surface: '#0a3450'
  border: '#0a3a52'
  foreground: '#ffffff'
  foreground-muted: 'rgba(255,255,255,0.7)'
  accent: '#008080'
  accent-hover: '#00a1a1'
  highlight: '#69c4d2'
  success: '#2D6D54'
  carryforward: '#8a9aa6'   # quiet muted slate for "still needs doing" — NOT accent, NOT success, NOT destructive
  creature-tint: '#03243A'
typography:
  display:
    fontFamily: 'Playfair Display, serif'
    fontWeight: '600'
    note: 'Serif for warmth — greetings, hero task title, day-end moment.'
  heading:
    fontFamily: 'Playfair Display, serif'
    fontSize: 21px
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: 'Inter, sans-serif'
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.55'
  body-strong:
    fontFamily: 'Inter, sans-serif'
    fontSize: 14.5px
    fontWeight: '600'
  meta:
    fontFamily: 'Inter, sans-serif'
    fontSize: 12.5px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  DEFAULT: '0.75rem'          # shipped --radius (Tailwind borderRadius.lg)
  md: 'calc(0.75rem - 2px)'   # Tailwind borderRadius.md
  sm: 'calc(0.75rem - 4px)'   # Tailwind borderRadius.sm
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '24px'
  '6': '32px'
  '7': '48px'
  gutter: '16px'              # mobile side margin
  nav-clearance: 'calc(4rem + env(safe-area-inset-bottom))'  # shipped .pb-nav
components:
  card:
    # Shipped .surface-raised — top-lit gradient, light-catching top edge, tinted drop shadow.
    background: 'linear-gradient(180deg, #0e3d5e 0%, {colors.surface} 100%)'
    border: '1px solid {colors.border}'
    border-top: 'rgba(255,255,255,0.08)'
    shadow: '0 10px 26px -14px rgba(0,0,0,0.6)'
    radius: '{rounded.DEFAULT}'
  button-primary:
    # Shipped .btn-accent-3d — 3D lip that compresses on press.
    background: 'linear-gradient(180deg, {colors.accent-hover} 0%, {colors.accent} 100%)'
    foreground: '{colors.foreground}'
    lip: '0 3px 0 #00484a'
    inner-highlight: 'inset 0 1px 0 rgba(255,255,255,0.28)'
    press: 'translateY(3px)'
    radius: '{rounded.DEFAULT}'
  input:
    # Shipped .input-glow — recessed field, highlight ring + soft outer glow on focus.
    focus-border: 'rgba(105,196,210,0.45)'
    focus-glow: '0 0 0 3px rgba(105,196,210,0.14), 0 0 22px -6px rgba(105,196,210,0.40)'
    radius: '{rounded.DEFAULT}'
  checkbox:
    # Shipped .checkbox — recessed unchecked box; done = success-green fill.
    border: '2px solid #5f93b5'   # (raised for WCAG 1.4.11 ≥3:1 non-text contrast) on surface #0a3450; light schemes re-check at build

    background: 'rgba(0,0,0,0.18)'
    inner-shadow: 'inset 0 1px 2px rgba(0,0,0,0.30)'
    hover-border: '{colors.highlight}'
    done-background: '{colors.success}'
    radius: '{rounded.sm}'
  subtask-card:
    # Shipped .subtask-card — flatter, lighter tone than parent card; own border.
    background: '#0f3c5b'
    border: '1px solid #3a76a4'   # (raised for WCAG 1.4.11 ≥3:1 non-text contrast) on subtask bg #0f3c5b; light schemes re-check at build

    hover-border: '#246088'
    radius: '10px'
  progress-wheel:
    # Accumulation ring (FR16/FR25). Accent fill over a faint track. NO denominator/number.
    # NO full/closed state, NO closure animation — never visually completes within a day.
    # Accrues continuously so "fullness" never reads as a finish line (laps, or asymptotes, never reaching 100%).
    # Subordinate in scale to the one task — ambient proof, never a goal. Counter-metric: anxiety-on-open.
    # ARCHITECTURE ACTION: delete the shipped RING_TARGET=8 constant (not merely replace the bar).
    track: 'rgba(255,255,255,0.13)'
    fill: '{colors.accent}'
    stroke-width: '5px'
    cap: 'round'
  carryforward:
    # "Still needs doing" treatment (FR21). Quiet muted slate — NOT accent, NOT success, NOT destructive.
    color: '{colors.carryforward}'
    marker: 'soft left tick/dot'
    label: 'persistent "still needs doing" text label (non-colour cue on every surface)'
    escalation: 'none — identical regardless of task age OR volume; never red, never a badge/count'
  companion:
    # The monkey. Art baked in deep-blue fills (#03243A body / #FDFDFD face).
    tint: '{colors.creature-tint}'
    glow: '{colors.highlight}'
    ground-shadow: 'soft, static, blurred'
---

## Brand & Style

Essence is a calm task companion that grew up. The visual identity has one job: make the felt sense **satisfaction and contentment, never overwhelm**. Everything here is downstream of that — restraint is not a style choice, it is the product's spine.

The posture is **warm but never cutesy**. The surfaces are tactile and soft — top-lit raised cards, a button with a real 3D lip, recessed inputs and checkboxes — so the app feels physical and reassuring under the thumb without ever tipping into toy-like or hyped. The register is editorial and quiet: a serif voice (Playfair Display) for the moments that carry warmth — the morning greeting, the one task in focus, the end-of-day sigh — over a calm sans (Inter) for everything functional.

The default mood is **nocturnal** (Deep Sea — morning-coffee dark, submerged, low-glare) because that is where the protagonist meets the app. But the identity is **multi-scheme by design**: the same primitives re-skin into seven calm worlds, four dark and three light, so the space can feel like the user's own.

Three hard postures govern every screen:

- **No red, no alarm — anywhere.** Not for errors framed as failure, not for carried-forward tasks, not for "overdue." Calm by construction (NFR5). The one shipped `destructive` token (a muted rose on the Delete-Account label) is the single deliberate exception and never appears in the task loop. **Fence:** the `destructive` rose token is **NEVER used in the task loop** and must **always carry a text label, never colour alone**.
- **Single-accent discipline.** Exactly one chromatic accent per scheme, held to roughly **10% of any screen**. The accent advances; the structural palette recedes. Adding a second competing colour breaks the calm.
- **Success-green is completion-only.** A semantic colour, never decorative, never a category tint, never chrome. Green means *done* and nothing else.

## Colors

Essence runs on a **single-accent + semantic-success** model layered over a recessive structural palette (background → surface → border → foreground). The structural scale carries elevation through **lightness, not hue** — cards lift off the canvas by being a shade lighter, not a different colour. The accent is the only chromatic voice that advances; success-green is the only other colour with meaning, and it means *completion* exclusively.

- **Background / surface / border** — the structure scale. Recedes. Surfaces separate from the canvas by tone alone.
- **Foreground / foreground-muted** — near-full-strength text and a ~70% muted tier for secondary lines (greetings' subtitles, the wheel caption).
- **Accent / accent-hover** — the single advancing colour: the primary button, the active subtask, focus rings, the progress-wheel fill (for *links/body-size text*, see the accent text-contrast rule below). Kept to ~10% of screen.

> **Accent text-contrast rule.** The accent is a **FILL / large-text (≥18.66px, or ≥14px bold) / UI-component colour only (≥3:1)**. It is **NEVER used for body-size text or links in running copy** — it is sub-AA (~3.5–3.9:1) in Deep Sea, Soft Paper, Soft Pink, and Sky Blue. Small interactive text and links use `{colors.highlight}` on dark schemes; on light schemes they use the scheme foreground or a darkened accent variant — call it `accent-text` (≥4.5:1). Accent is **never used at body size**. (These are usage rules; the confirmed brand accent hexes in the schemes table are unchanged.)
- **Highlight** — a brighter sibling of the accent for the in-focus subtask text, focus glow, and the creature's reaction glow.
- **Success** — completion only. The done-checkbox fill and the strike on a finished line. Never carried-forward tasks, never decoration.
- **Creature-tint** — the companion's body tone, harmonized per scheme.

There is **no alarm colour in the loop**. Carried-forward tasks ("still needs doing") use the named **`carryforward` token (`#8a9aa6`)** — a quiet muted slate, explicitly **NOT accent, NOT success, NOT destructive**. Its treatment is a **soft left tick/dot plus a persistent "still needs doing" text label** (a non-colour cue on every surface it appears). The treatment is **identical regardless of how many tasks carry, and never intensifies as a task ages** — no escalation by age *or* by volume (FR21) — never red, never a badge/count. Low-saturation category tints exist in the shipped Tailwind config but are **not surfaced in v1** — the on-screen model is pure priority.

### Color Schemes

Onboarding (FR1) offers **7 schemes — 4 dark, 3 light**. Every scheme re-skins the **same component primitives**: `.surface-raised`, `.btn-accent-3d`, `.input-glow`, the recessed `.checkbox`, the progress-wheel, the companion. Only the token values change. The white option (Soft Paper) and the colourblind-safe option (Accessible) together satisfy **NFR8**. Exact hexes are the memlog's confirmed anchors.

> 🎨 **Rendered reference:** all 7 schemes shown as mobile focus-view mockups in [mockups/palette-schemes.html](mockups/palette-schemes.html). Key screens (Focus · Onboarding · Plan, Deep Sea) in [mockups/key-screens.html](mockups/key-screens.html). These are references; **the spine wins on any conflict** with a mock.

| Scheme | Mode | Accent | Success | Creature-tint | Note |
|---|---|---|---|---|---|
| **Deep Sea** *(default)* | dark | `#008080` | `#2D6D54` | `#03243A` | Calm, submerged, nocturnal focus — the shipped identity. |
| **Forest / Sage** | dark | `#8aa98a` | `#3f6d4e` | `#243029` | Quiet woods at dusk. |
| **Twilight** | dark | `#a99cd6` | `#4a6a72` | `#2a2440` | Still, late twilight; muted violet. |
| **Soft Paper** | light | `#3f8f8a` | `#3f7a5c` | `#cbb89a` | Warm off-white daylight, not clinical white — the white option (NFR8). |
| **Accessible** | dark | `#e89c4a` | `#4a8fb0` | `#2c3e52` | Colourblind-safe blue/orange, lightness-differentiated, never red/green (NFR8). |
| **Soft Pink** | light | `#a86b72` | `#4d7a63` | `#c7a3a0` | Dusty clay-rose, grown-up — muted, never bubblegum (brand rule 6). |
| **Sky Blue** | light | `#3f86c4` | `#3f7a64` | `#aac4dc` | Airy daytime sky; deliberately distinct from Deep Sea's nocturnal depth. |

> **Creature-recolor constraint (architecture concern — referenced, not solved here).** The monkey art is a painterly multi-path SVG with deep-blue fills baked across ~243 paths. "A matching coloured creature per scheme" (NFR8) therefore needs a recolor *strategy* — CSS hue/filter retint, per-scheme art exports, or a recolorable single-fill silhouette — to be decided in the architecture phase. The `creature-tint` token above names the target per scheme; how the art reaches it is out of scope for this spec. Whatever strategy is chosen, it must keep the creature silhouette and its reaction glow **≥3:1 perceivable against its immediate background in every scheme**, and the glow is **never the sole signal** of a reaction — the companion copy line always carries it.

## Typography

Two families, mirroring the shipped stack:

- **Playfair Display (serif)** — `display` and `heading`. The voice of warmth and the editorial moments: the morning greeting, the hero task title in focus, the end-of-day line. Serif is chosen deliberately — it reads as *human and unhurried* against the cold of a plain checkbox app, without ever becoming decorative or loud.
- **Inter (sans)** — `body`, `body-strong`, `meta`. Everything functional: subtask text, captions, settings rows, buttons. Quiet, legible, gets out of the way.

Ramp (default sizes; schemes do not change type): `display`/`heading` ~21px+ Playfair 600 · `body` 15px Inter 400 · `body-strong` 14.5px Inter 600 (task titles in cards) · `meta` 12.5px Inter 400 muted (the wheel caption, subtask in-progress line). No all-caps shouting, no display sizes competing on the Focus surface — the one task is the largest thing on screen, never the chrome.

## Layout & Spacing

**Mobile form factor** — an iOS + Android **installable PWA** (per the architecture's decision of record, ARCHITECTURE-SPINE.md AD-1; supersedes the earlier "WebView-wrapped app" assumption). The mobile-layout evidence still holds: `env(safe-area-inset-*)` insets, `.pb-nav` bottom-nav clearance, `overscroll-behavior:none`, `-webkit-overflow-scrolling:touch`. Single column always.

- **Safe-area insets** are honored on every edge (`safe-top/bottom/left/right`); content never collides with notch or dynamic island.
- **Bottom-nav clearance** — scrollable surfaces pad to `nav-clearance` (`calc(4rem + env(safe-area-inset-bottom))`) so the 4-surface bottom nav (Focus · Plan · Archive · Settings, with the center +FAB as the single create path) never covers content.
- **Generous, calm spacing** — the scale (4 → 48px) leans to the larger end between major blocks. Breathing room is part of the restraint; nothing is compressed to fit more on screen.
- **One-thing-at-a-time density on Focus.** The doing surface shows a single task with at most two subtasks revealed (FR11/FR13). The full backlog is *forbidden* here (restraint contract §5) — it lives only on the neutral Plan surface. Density is intentionally low: the wall of tasks is the enemy.

## Elevation & Depth

Depth is **tactile and soft** — the identity's signature feel — but always quiet. Hierarchy comes from tone and light, never from hard edges or alarm.

- **Top-lit raised cards** (`.surface-raised`) — a soft top-down gradient, a light-catching top border (`rgba(255,255,255,0.08)`), and a tinted drop shadow so cards sit *above* the canvas. Elevation reads as a physical lift.
- **3D-lip accent button** (`.btn-accent-3d`) — an inner highlight, a solid coloured lip (`0 3px 0`) that **compresses on press** (`translateY(3px)`). The one place the UI feels mechanically satisfying to push.
- **Recessed inputs and checkboxes** — inputs and unchecked boxes sink in (inner shadow), the opposite gesture to a raised card; focus brings a soft outer **glow** rather than a hard ring.
- **Soft tinted shadows** — diffuse, low-opacity, hue-tinted toward the surface, never sharp black drop-shadows.
- **The creature's depth** — a soft glow on reaction (`highlight`) and a static, blurred **ground shadow** anchoring it to the surface. Both stay subtle; the creature sits *with* the user, it does not pop.

## Shapes

**0.75rem default radius** — the shipped `--radius`, soft enough to feel warm and tactile, restrained enough to never read as a toy bubble. The ramp steps inward in small increments (`md` = −2px, `sm` = −4px) so nested elements (a checkbox inside a subtask-card inside a card) stay visually consistent rather than fighting.

- **Soft, never hard.** No sharp 90° corners anywhere in the task loop; hard edges feel cold and clinical, against the brand.
- **`rounded-full` chips** — pill chips (`9999px`) for the existing shipped idiom (active = accent-tinted). Reserved for chips and the wheel; surfaces never go fully round.
- Imagery and inner fills follow their container's radius exactly.

## Components

- **Card** (`.surface-raised`) — the raised task container. Top-lit gradient, `{colors.border}` edge lifted by a white top-border, tinted shadow, `{rounded.DEFAULT}`. Holds the hero task title (`body-strong`) and its revealed subtasks. The carried-forward "still needs doing" state is a quiet fixed treatment on the card — never red, never escalating (see Carry-forward below).
- **Carry-forward** (`carryforward` / `{colors.carryforward}` `#8a9aa6`) — the "still needs doing" treatment: a **soft left tick/dot** plus a **persistent "still needs doing" text label** (a non-colour cue on every surface). The muted slate is explicitly **NOT accent, NOT success, NOT destructive**. The treatment is **identical regardless of how many tasks carry or how long one has aged** — no escalation by age or by volume; **never red, never a badge/count** (FR21).
- **Button-primary** (`.btn-accent-3d`) — the single accent action (e.g. "I'm done for today"). Accent gradient, inner highlight, solid lip, compresses on press. Foreground is `{colors.foreground}` on dark schemes / the scheme's near-black on light schemes for contrast. Here accent is a **fill** — its only sanctioned use at this scale; accent is never the colour of body-size text or links in running copy (see the accent text-contrast rule in Colors). The only loud-coloured element on screen — and it is still quiet.
- **Input** (`.input-glow`) — recessed neutral field; on focus, border shifts to `highlight` at 45% and a soft outer glow blooms. Calm, not aggressive. Primary home is the Plan/capture surface.
- **Checkbox** (`.checkbox`) — recessed unchecked box (2px `#5f93b5` border *(raised for WCAG 1.4.11 ≥3:1 non-text contrast)*, inner shadow); hover/focus ring in `highlight`; the **done state fills `{colors.success}`** with a white check. Completion is **never conveyed by success-green colour alone**: the **white check glyph and the line strike-through are REQUIRED** non-colour signals of the done state. Green appears *only* here and on the resulting strike — completion's single colour. (Light schemes must be re-checked at build.)
- **Subtask-card** (`.subtask-card`) — a flatter, slightly lighter mini-card with its own border (1px `#3a76a4`, *raised for WCAG 1.4.11 ≥3:1 non-text contrast*; light schemes re-check at build) so each subtask reads as discrete. On Focus, exactly **one** subtask is active/expanded; revealed two-at-a-time, the just-completed one removed from view (FR13/FR14). The active state carries a **structural non-colour signal** independent of tint — a **left indicator/accent bar** AND its **elevated/expanded state** AND the **"In progress — just this one."** `meta` label — so the active state survives `forced-colors: active` and colourblind use. The accent-tinted background and `highlight` text are **reinforcement, never the sole cue** (and accent is used here as tint/large-text reinforcement, never as body-size link colour — see the accent text-contrast rule in Colors).
- **Progress-wheel** — a **circular accumulation ring** near the creature on Focus: a faint track with an **accent fill** that only ever grows as completions rise (FR16). **No number, no denominator, no percentage, no "remaining," no shortfall, no cross-day comparison** (FR25). It has **no full/closed state and no closure animation** — it never visually completes within a day; it accrues continuously (it laps, or asymptotes and never reaches 100%) so "fullness" never reads as a finish line. Round line-caps; it can fill and keep counting, but can never imply how much is left. Kept **subordinate in scale** to the one task — ambient proof, never a goal (counter-metric: *anxiety-on-open*). Replaces the shipped horizontal bar (a placeholder): the architecture action is to **delete the shipped `RING_TARGET=8` constant**, not merely swap the bar for a ring.
- **Archive** — a VISUAL rule restating FR26: a **flat reverse-chronological list**. **NO date-grouping that reads as per-day tiles, NO calendar grid, NO section counts/totals/aggregates.** It is a quiet record, never a scoreboard.
- **Companion** (the monkey) — warm during *doing*, passive during *planning*. Visual/motion character only (timing belongs to EXPERIENCE.md): a slow **breathing idle**, a **gentle smile** + brief line on a subtask, a **little dance** (brief, small, low-amplitude — *never* confetti-scale) on a whole task, a **deep slow sigh** at day's end. Reactions carry a soft `highlight` glow; a static blurred ground shadow keeps it grounded. Tinted per scheme via `creature-tint`. Art is a three-pose set in `public/companion/` — `creature_soft.svg` (resting/breathing idle + day-end sigh), `creature_smile.svg` (greeting + subtask), `creature_grin.svg` (task win) — cross-faded by expression. (Replaced the earlier single `monkey_sit_laugh.svg`.)

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use exactly **one** accent per scheme, ~10% of screen | Introduce a second competing chromatic colour |
| Reserve **success-green for completion only** | Use green (or any colour) decoratively or as a category tint |
| Keep carried-forward tasks a quiet, fixed highlight | Use red, an "overdue" badge, or any alarm colour — anywhere |
| Let the carry-forward treatment stay constant | Intensify, accumulate, or count up staleness as a task ages |
| Keep motion **small and proportional** to the event tier | Use confetti, hype, bursts, or reactions that scale with volume/priority |
| Always show the state change (reduced-motion safe) | Hide a completion or win behind motion that reduced-motion drops |
| Show **one task at a time** on Focus | Render the full backlog on the doing surface |
| Let the progress-wheel **accumulate only** | Show a number, denominator, %, "remaining," or cross-day comparison |
| Keep the wheel free of any scoreboard encoding | Add streaks, totals, per-day tiles, or shortfall cues |
| Render the Archive as a flat reverse-chronological list | Group by date as per-day tiles, use a calendar grid, or show section counts/totals/aggregates |
| Keep surfaces soft, tactile, top-lit | Use hard edges, flat clinical fills, or sharp black shadows |
| Stay warm and plainspoken | Be cutesy, baby-talk, hyped, or loud |
