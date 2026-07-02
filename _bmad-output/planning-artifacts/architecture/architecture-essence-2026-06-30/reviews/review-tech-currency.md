# Technology-Currency Review — Essence Architecture Spine

- **Reviewer role:** technology-currency reviewer (part-brownfield spine)
- **Date:** 2026-06-30
- **Spine reviewed:** `architecture/architecture-essence-2026-06-30/ARCHITECTURE-SPINE.md`
- **Repo checked:** `package.json`, `vite.config.js`, `tailwind.config.js`, `src/components/companion/Companion.jsx`, `public/companion/*.svg`, `_bmad-output/project-context.md`
- **Brief understood:** Stack-table versions are *ratified* from the shipped project (`project-context.md`, 2026-06-23), not freshly chosen. The bar is "does the spine correctly ratify the real codebase, and is any NEW technology it introduces sound and current-practice" — not "are these the latest versions."

---

## Verdict

**PASS WITH ONE CORRECTION.** The ratified stack is real, current, and accurately transcribed (one stale patch-version on `@base44/sdk`). The two genuinely new technologies — the installable PWA shell on Vite 6, and the future IndexedDB local-first adapter — are sound and current-practice. The one finding that needs the architect's attention is **not** a dead/deprecated technology: it is the spine's repeated characterization of the creature SVG as **"near-monochrome,"** which the actual asset contradicts (470 distinct fills spanning the full luminance range). The retint *approach* is still viable — arguably more viable than the spine implies — but the framing and the current `<img src>` render path are reality-check gaps that will mislead implementation.

---

## 1. NEW technology the spine introduces — soundness check

### 1a. Installable PWA shell (manifest + service worker) on Vite 6 — SOUND, current-practice

- **Spine claims:** Stack note (line 148) — "The PWA shell (manifest + minimal service worker) is the only new surface area v1 adds." Deferred (line 220) — "v1 is Base44-online; the service worker is for installability only. Offline task editing waits on the local-first adapter."
- **Repo reality:** No PWA today. `vite.config.js` has only `@base44/vite-plugin` + `@vitejs/plugin-react`. No `manifest.webmanifest`, no `sw.js`/`service-worker.js`, nothing referencing `vite-plugin-pwa` / `VitePWA`. So this is genuinely net-new, consistent with the spine calling it the one new surface.
- **Currency:** `vite-plugin-pwa` (vite-pwa org, Workbox-based) is the going approach for PWA on Vite and explicitly supports the Vite 3.1–8.0 range, i.e. Vite 6 is in band. It generates the manifest and registers the service worker, and supports an "installability-only" posture (minimal/no runtime caching) — exactly the spine's intent. **Verdict: sound and current.** The spine does not name a tool, which is fine for a spine; if/when one is chosen, `vite-plugin-pwa` is the correct default and adds one *dev* dependency (does not violate the NFR1 ~17 *runtime*-dep budget — Workbox output is build-time).
- **Caveat to flag (not a defect):** an "installability-only" service worker still has lifecycle/caching consequences. With Base44 being a remote SPA, a precaching SW can serve a stale `index.html`/JS bundle after deploys unless update-handling (`registerType: 'autoUpdate'` or a prompt) is configured. The spine's "minimal service worker … for installability only" is achievable, but "minimal" is not "consequence-free." Worth a one-line invariant at build time (e.g. "SW auto-updates; never caches Base44 API responses in v1") so installability doesn't quietly become broken offline behavior. This belongs to the implementer, not a blocker for the spine.

### 1b. IndexedDB local-first adapter (future) — SOUND as deferred; correctly fenced

- **Spine claims:** AD-1 + Structural Seed + Deferred — Base44 today, IndexedDB local-first later, swappable behind the per-domain store port without touching callers.
- **Assessment:** IndexedDB is the correct, durable, current-practice browser store for local-first task data (localStorage is rightly reserved for small prefs in AD-6). The ports-and-adapters framing (AD-1) is exactly what keeps this cheap, and the spine explicitly defers the adapter itself to post-v1. No raw-IndexedDB-vs-wrapper (idb / Dexie) choice is asserted, which is appropriate for a deferred item — and any wrapper would be a *future* dependency, not a v1 NFR1 violation. **Verdict: technically sound, correctly scoped as deferred.** No reality-check failure here.

### 1c. CSS/SVG filter retint of the painterly creature SVG — APPROACH VIABLE, but the spine's premise is WRONG and the render path is unaddressed

This is the substantive finding. AD-10 (lines 109–112): *"The creature recolors via a per-scheme token-driven transform (filter retint) over one shared art set — never per-scheme baked art (per-scheme exports are a fallback only if a filter can't hit a scheme's `creature-tint`)."* The brief specifically asks whether a *luminance-preserving CSS/SVG filter tint of a near-monochrome SVG* is feasible.

**What the actual asset is** (measured, not assumed):
- `public/companion/creature_soft.svg`: **255,023 bytes**, **486 `<path>` elements**, **470 distinct `fill="#RRGGBB"` values**, **zero gradients/stops** (VTracer 0.6.12 raster-trace output — a flat painterly mosaic of solid-fill paths).
- Fills span the **full luminance range**, from `#00020A` (near-black) up through midtones like `#104356`/`#0F465A` to `#FCFDFD`/`#FDFEFE` (near-white). They are *currently tinted dark teal/blue*, but they are emphatically **not "near-monochrome"** — there is real, continuous luminance structure across hundreds of distinct colors.

**Why the spine's "near-monochrome" framing matters (FINDING):** A luminance-preserving retint works *because* an image has luminance variation to preserve. Calling the asset "near-monochrome" understates exactly the property that makes the retint feasible, and it risks an implementer reaching for a single-color flood/recolor (collapse-to-one-hue) that would destroy the painterly shading the art depends on. The correct mental model is: **desaturate to a luminance map, then map that luminance onto the per-scheme `creature-tint` ramp** — i.e. preserve L, replace H/S. The asset is a *good* candidate for that; the spine just describes it inaccurately.

**Technical viability of the retint itself — confirmed, with the right primitive:**
- Web-confirmed: single-target recoloring is "trivial in **SVG filters** using `feColorMatrix`" but only approximable in **CSS** by chaining `hue-rotate() + sepia() + saturate() + invert()` — and `hue-rotate()` is a non-linear RGB-matrix op that clips and does **not** reliably preserve saturation/lightness, especially across a wide luminance range. So the CSS-filter-chain path is the weak option and will *not* hold luminance accurately across 470 fills.
- The robust path is an **SVG `<filter>`**: `feColorMatrix type="saturate" values="0"` (→ luminance map) → tint via a single `feColorMatrix` (matrix column / channel weights toward `creature-tint`) **or** `feFlood` + `feBlend mode="multiply"`/`feComposite`. That is current-practice and is genuinely luminance-preserving. **The spine's AD-10 is achievable — but specifically via SVG filter primitives, not the CSS `filter:` shorthand chain.** The spine says "CSS/SVG filter" interchangeably; these are not equivalent for this asset and the distinction should be pinned.

**Unaddressed render-path conflict (FINDING):** `src/components/companion/Companion.jsx` (today) renders the art as **`<img src="/companion/creature_*.svg">`** (lines 110–123), three stacked `<img>` elements cross-fading. An external `<img>`-loaded SVG is an opaque raster from CSS's view: you can apply the *element-level* CSS `filter:` chain to it (the inaccurate path above), but you **cannot** reach its internal paths, and you cannot apply an **SVG `<filter>`** that references the document's `<feColorMatrix>` to an `<img>`-sourced SVG via `filter:url(#id)` cross-document. To use the robust SVG-filter retint, the creature must be **inlined into the DOM** (imported as a React component / `<svg>` inline, or referenced via `<use>` from an inline symbol) so a document `filter:url(#tint-<scheme>)` can apply. The spine's AD-10 invariant ("token-driven transform over one shared art set") therefore silently requires a **render-path change away from the shipped `<img>` approach** — which the spine does not state. This is the gap most likely to cause an implementer to discover late that "filter retint over one art set" doesn't compose with the current component. Recommend AD-10 explicitly note: *retint requires inline SVG (not `<img>`); the per-scheme transform is an SVG `<feColorMatrix>` filter, not the CSS hue-rotate chain.*

**Performance note (informational):** 470 paths × an SVG filter, inlined and re-applied on scheme change, is fine for a single ~84×90px companion. The 255 KB asset is shipped once. No concern at this scale; would only matter if many instances animated simultaneously.

**The fallback is correctly fenced:** AD-10 already allows per-scheme baked exports "if a filter can't hit a scheme's `creature-tint`." Given `hue-rotate`'s clipping, some saturated `creature-tint` targets may indeed be unreachable by a naive matrix — so the fallback is not theoretical, and keeping it is the right call. Good.

---

## 2. Named technology that no longer exists / is deprecated / poor fit

**None found.** Every named technology is real, maintained, and a reasonable fit:

- React 18.2, React Router 6.26, TanStack Query 5.84, framer-motion 11.16, date-fns 3.6, lucide-react 0.475, shadcn/Radix, Tailwind 3.4.17, Vite 6.1, Vitest, ESLint 9 (flat) — all present in `package.json`, all current/maintained, none deprecated.
- `@base44/sdk` / `@base44/vite-plugin` — proprietary but real and shipped (it's the backend of record; not the reviewer's place to second-guess platform choice in a brownfield ratification).
- Tailwind **3.4** (not 4.x) is a deliberate ratification of the shipped version, not a currency miss — the brief explicitly says versions are ratified, and the whole `tailwind.config.js` token system (CommonjS `module.exports`, `tailwindcss-animate`, the seablue/teal palette) is a v3 setup. Migrating to v4 is out of scope and correctly not asserted.
- No "ghost" libraries (no defunct/renamed packages, no abandoned PWA tooling named).

---

## 3. Asserted version/capability that should have been reality-checked

| # | Spine assertion | Reality | Severity |
|---|---|---|---|
| F1 | Creature recolors via luminance-preserving filter retint over one **"near-monochrome"** SVG (AD-10) | Asset is **470 distinct fills, full luminance range, 486 paths** — painterly, not near-monochrome. Retint is *more* feasible than "near-monochrome" implies, but the framing is wrong and risks a flood/collapse implementation. Robust path is **SVG `feColorMatrix`**, not the CSS `hue-rotate` chain (which clips and won't preserve luminance). | **Medium** — approach survives; premise + primitive need correcting so implementation doesn't go down the lossy CSS-filter route. |
| F2 | "filter retint over one shared art set" with no mention of render path | `Companion.jsx` ships the art as **`<img src>`** (3 stacked imgs). A document SVG `filter:url(#…)` can't reach an `<img>`-sourced SVG; robust retint **requires inlining the SVG**. The spine's invariant silently mandates a render-path change it doesn't state. | **Medium** — latent rework; cheap to fix now by adding the constraint to AD-10. |
| F3 | Stack table: `@base44/sdk` **0.8.32** | `package.json` pins **`^0.8.34`**; `project-context.md` says 0.8.32. Patch-level drift only (the spine even says "the code owns this once it exists"). | **Low** — cosmetic; reconcile to `0.8.34` for accuracy. |
| F4 | "the service worker is for installability only" (Deferred) | True and achievable on `vite-plugin-pwa`/Vite 6, but a precaching SW over a remote Base44 SPA needs an explicit update strategy (autoUpdate / no API caching) or it can serve stale bundles after deploy. Not stated. | **Low** — implementer-level invariant worth one line; not a stack defect. |

Everything else in the Stack table (lines 135–148) matches `package.json` and `project-context.md`: React 18.2, Router 6.26, Vite 6.1, TanStack Query 5.84, Tailwind 3.4.17 + tailwind-merge/clsx/cva, lucide 0.475, framer-motion 11.16, date-fns 3.6, Vitest 4.1, ESLint 9.19 flat. The ~17-runtime-dep / NFR1 budget claim is consistent with the 17 `dependencies` entries in `package.json`. The "JS/JSX only, JSDoc types, lint/typecheck scope gaps" conventions all match `project-context.md` and the repo. The retired `winMoment` (AD-3) and the `RING_TARGET=8` deletion (AD-11) are corroborated by `Companion.jsx`, which still imports `@/lib/winMoment` and defines `const RING_TARGET = 8` — i.e. the spine is accurately describing *shipped state it intends to retire*, not misdescribing current code.

---

## Recommendations (in priority order)

1. **(F1) Rewrite AD-10's asset characterization.** Drop "near-monochrome." State the asset as a full-luminance painterly multi-path SVG, and specify the retint as **desaturate-to-luminance → map onto `creature-tint` via SVG `feColorMatrix`** (preserve L, replace H/S). Explicitly distinguish this from the CSS `filter: hue-rotate(...)` chain, which clips and is the fallback-trigger, not the method.
2. **(F2) Add the render-path constraint to AD-10:** retint requires the creature **inlined as SVG in the DOM** (not the current `<img src>`), so `filter:url(#tint-<scheme>)` can apply. Note this is a deliberate change from the shipped `Companion.jsx` render path.
3. **(F3) Reconcile `@base44/sdk` to `0.8.34`** in the Stack table (or add "patch drift owned by `package.json`").
4. **(F4) Add a one-line PWA invariant:** SW auto-updates and never caches Base44 API responses in v1 (installability without stale-bundle/false-offline behavior). `vite-plugin-pwa` on Vite 6 is the endorsed tool.

No blocking defects. The spine ratifies the real codebase faithfully and its two new infrastructure bets (PWA shell, future IndexedDB adapter) are sound. The corrections are concentrated entirely in the creature-retint invariant (AD-10), where the spine asserted a property of the art ("near-monochrome") and a filter mechanism that the actual asset and the shipped render path don't support as written.

---

### Sources
- [vite-plugin-pwa (vite-pwa org) — GitHub](https://github.com/vite-pwa/vite-plugin-pwa) and [docs](https://vite-pwa-org.netlify.app/guide/) — Vite 3.1–8.0 support (incl. Vite 6), Workbox-based manifest + SW generation, installability-only posture.
- [MDN — hue-rotate()](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/hue-rotate) and [w3c/fxtf-drafts #334 "Add recolor()"](https://github.com/w3c/fxtf-drafts/issues/334) — single-color recolor is trivial via SVG `feColorMatrix`, only approximable (and clipping/non-luminance-preserving) via the CSS hue-rotate/sepia/saturate/invert chain.
- Repo: `package.json`, `vite.config.js`, `tailwind.config.js`, `src/components/companion/Companion.jsx`, `public/companion/creature_soft.svg` (measured), `_bmad-output/project-context.md`.
