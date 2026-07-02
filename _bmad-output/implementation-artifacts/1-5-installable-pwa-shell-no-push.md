---
baseline_commit: 162182f40ff6756f6a09200a2b241dd94f30558b
---

# Story 1.5: Installable PWA shell (no push)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a builder,
I want to install Akha to my home screen and trust it will never nag me,
So that it pulls me back by being calm, not by notifications.

## Acceptance Criteria

1. **Installable, install + auto-update.** Given the app, when built, then a web manifest and a service worker (via `vite-plugin-pwa`) make it installable to the home screen, configured for install + auto-update. *(Delivery = installable PWA)*

2. **No push, no Base44 caching.** Given the service worker, when it registers, then it **NEVER** requests Push or Notification permissions **and** it does **NOT** runtime-cache the Base44 API (avoid stale data). *(AD-12, NFR7)*

3. **Auto-update on new deploy.** Given a new deploy, when the app is reopened, then the service worker auto-updates to the new bundle rather than serving a stale one.

## Tasks / Subtasks

- [x] **Task 1 — Add `vite-plugin-pwa` and wire it into the build (AC: 1, 3)**
  - [x] Install `vite-plugin-pwa` as a **devDependency** (`npm install -D vite-plugin-pwa`, latest compatible with Vite 6.1). It is a build-time plugin — it does **not** add to the 17-runtime-dep set (NFR1 is about runtime bundle deps; this ships nothing into the app bundle). It pulls `workbox-*` as build-time transitives.
  - [x] In `vite.config.js`, add `VitePWA({ ... })` to the `plugins` array **after** the shipped `base44()` and `react()` plugins. Config: `registerType: 'autoUpdate'`, `injectRegister: 'auto'`, `manifest: {...}` (Task 2), `workbox: {...}` (Task 3), and `devOptions: { enabled: false }` (SW off in `vite dev`; it matters for `vite build`/`vite preview`).
  - [x] `registerType: 'autoUpdate'` (plus the auto-injected registration) makes the SW fetch + activate the new bundle on next load — satisfies AC 3. Do not build a custom update prompt (restraint; no nagging).
- [x] **Task 2 — Web manifest (AC: 1)**
  - [x] Configure the `manifest` in `VitePWA`: `name: 'Akha'` / `short_name: 'Akha'` (**owner decision — keep Akha**, matches the current `<title>`; do NOT change the title), `description`, `display: 'standalone'`, `start_url: '/'`, `scope: '/'`, `background_color: '#04141f'`, `theme_color: '#04141f'` (Deep Sea — manifest colours are static; use the default scheme), `icons` (Task 4).
  - [x] **Remove the dangling static `<link rel="manifest" href="/manifest.json" />` from `index.html`** — there is no `public/manifest.json` (it currently 404s), and `VitePWA` injects its own `manifest.webmanifest` link. Keep the FOUC scheme `<script>` added in Story 1.1's review (it's unrelated).
  - [x] Add a `<meta name="theme-color" content="#04141f">` if not injected, and keep `<meta name="viewport">`.
- [x] **Task 3 — Service worker: no push, no Base44 caching (AC: 2)**
  - [x] Use the default Workbox `generateSW` (do **not** author a custom SW with push code). Precache **only the built app shell** via `workbox.globPatterns` (e.g. `['**/*.{js,css,html,svg,woff2}']`).
  - [x] **Never cache the Base44 API.** Do not add any `workbox.runtimeCaching` entry for the Base44 origin (`VITE_BASE44_APP_BASE_URL` / `*.base44.com`). Set `workbox.navigateFallback: '/index.html'` for SPA routing **and** `navigateFallbackDenylist: [/^\/api/, /base44/, /\/functions\//]` so navigations to API/backend paths are never served the cached shell. Net effect: the SW serves the static shell offline but every Base44 read/write goes to the network (no stale data — the "Nidus"-adjacent risk).
  - [x] **No push/notifications by construction (AD-12):** the generated SW must contain no `pushManager.subscribe`, no `self.registration.showNotification`, no `Notification.requestPermission`. `generateSW` adds none by default — just don't add any. This complements Story 1.4's off-by-default toggle: the SW *cannot* push even if the pref were on.
- [x] **Task 4 — App icons (AC: 1) — see the decision note in Dev Notes**
  - [x] Provide the manifest icons in `public/`: at minimum `pwa-192x192.png`, `pwa-512x512.png`, and a **maskable** `pwa-maskable-512x512.png` (`purpose: 'maskable'`) — browsers require ≥192 + 512 for the install prompt. Reference them from the `manifest.icons` array.
  - [x] Icons don't exist yet (only the companion SVGs). Follow the owner's decision (Dev Notes): a simple Deep-Sea-tile brand icon is fine for v1. Do not ship without at least the 192 + 512 PNGs, or the install prompt won't fire.
  - [x] Replace the external favicon (`index.html` currently points `rel="icon"` at `https://base44.com/logo_v2.svg`) with a local icon so the installed app isn't branded Base44.
- [x] **Task 5 — Verify the build artifacts (AC: 1–3)**
  - [x] `npm run build` succeeds and emits `dist/manifest.webmanifest` + `dist/sw.js` (+ `workbox-*.js`). `npm run lint` / `npx vitest run` stay green.
  - [x] Grep the generated `dist/sw.js`: **no** `pushManager`, `showNotification`, `requestPermission`; **no** Base44 origin in any `runtimeCaching`/precache URL list.
  - [x] Confirm the manifest has name/short_name/icons(192+512+maskable)/`display:standalone`/`start_url`/theme+background colours.
  - [x] **Runtime install test is a real-browser step (deferred to /verify):** `vite build && vite preview`, open in Chrome, confirm the install prompt appears, install, reopen; deploy a change and confirm it auto-updates; confirm DevTools → Application shows no push subscription and Network shows Base44 calls are **not** served from the SW cache.

## Dev Notes

### ✅ Decision (resolved) — app icons
**Owner decision (2026-07-01): option (a) — generate a simple SVG-based brand icon and rasterize it** to `pwa-192x192.png` / `pwa-512x512.png` / `pwa-maskable-512x512.png`. A Deep-Sea tile (`#04141f` ground, `#008080`/`#69c4d2` mark) is fine for v1; replace with polished art later. Implementation: author `public/icon.svg`, rasterize via a one-off script (a wasm rasterizer like `@resvg/resvg-js`, or `sharp`, installed as a dev-only tool; or `@vite-pwa/assets-generator`). If PNG rasterization tooling can't install cleanly in the build environment, fall back to shipping the SVG icon in the manifest (modern browsers accept it) and note that PNG generation should be run in a real environment — do not block the rest of the story on it.

### ✅ Decision (resolved) — installed app name
**Owner decision (2026-07-01): keep "Akha".** Manifest `name`/`short_name` = `Akha` (matches the current `index.html` `<title>`). Do **not** rename to Akha and do **not** change the `<title>`.

### What this story is (and is NOT)
This is the **delivery shell** — the last Epic 1 story. It makes Akha installable and self-updating, with a service worker that is calm by construction: no push, and no caching of the Base44 API (so data is never stale). [Source: epics.md#Story 1.5; ARCHITECTURE-SPINE.md — "Delivery = installable PWA"]

**NOT in this story:**
- **Offline data / local-first / IndexedDB** — explicitly a *deferred future adapter, not v1* (the SW caches the static shell only, never the Base44 API). [Source: epics.md Additional Requirements; NFR11]
- **Push notifications of any kind** — AD-12; the SW never registers push. Story 1.4 already added the off-by-default toggle; this story guarantees the SW can't push regardless.
- **A custom update UI / "new version available" prompt** — `autoUpdate` handles it silently (no nagging).

### Current build state (what you're changing)
[Source: current `vite.config.js`, `index.html`, `package.json`, `public/`]
- `vite.config.js`: `plugins: [ base44({...}), react() ]`, `logLevel: 'error'`. Add `VitePWA(...)` to this array. The `base44` plugin handles SDK/legacy imports + dev proxy — leave it untouched; `VitePWA` composes alongside it.
- `index.html`: has a **dangling** `<link rel="manifest" href="/manifest.json">` (no such file → 404) and `<link rel="icon" href="https://base44.com/logo_v2.svg">` (external Base44 favicon). Also holds the FOUC scheme `<script>` (Story 1.1 review — keep it) and `<script type="module" src="/src/main.jsx">`. Remove the dangling manifest link (plugin injects its own) and the external favicon (use a local icon).
- `main.jsx`: mounts `<PrefsProvider><App/></PrefsProvider>`. With `injectRegister: 'auto'`, `VitePWA` injects SW registration into the built HTML — **no manual `navigator.serviceWorker.register` needed** in `main.jsx`. (If you prefer explicit control, `import { registerSW } from 'virtual:pwa-register'` with `{ immediate: true }` and `onNeedRefresh` left to auto — but the auto path is simplest and matches `autoUpdate`.)
- `package.json`: 17 runtime deps (the deliberate lean set) — **do not change** them; `vite-plugin-pwa` goes in `devDependencies`.
- No existing service worker anywhere (confirmed).

### Workbox config — the two hard guarantees (AC 2)
[Source: ARCHITECTURE-SPINE.md#AD-12; epics.md#Story 1.5; project-context "Nidus" stale-data caution]
- **No Base44 API caching:** the single most important line. `generateSW` precaches the built assets (via `globPatterns`) — that's the app *shell*, which is fine and desired. The danger is a `runtimeCaching` rule (or a too-broad `navigateFallback`) that caches Base44 responses, which would serve **stale tasks/prefs**. So: add **no** `runtimeCaching` for the Base44 origin, and set `navigateFallbackDenylist` to exclude API/function/base44 paths. When in doubt, ship **no** `runtimeCaching` at all — precache-shell-only is the safe default.
- **No push:** `generateSW` output contains no push code by default. Verify by grepping `dist/sw.js` (Task 5). Never add `importScripts` for push, never call `showNotification`.

### Testing reality (be honest about what's verifiable)
- **No unit tests** — this is build-tooling + config; `src/lib` gains no logic (nothing to Vitest). The regression guard is that `npm run build` still succeeds and existing tests stay green.
- **The meaningful checks are build-artifact assertions** (manifest emitted, sw.js emitted, no push/no-Base44-cache strings) — do these in Task 5. A shell script grep over `dist/` is the pragmatic "test."
- **True install/update/offline behaviour requires a real browser** over `vite preview` (SW needs a build + a secure context; `localhost` counts). This is a `/verify` step — the CI/dev-story environment is Base44-auth-gated and headless, so document it rather than claim it.

### Previous-story intelligence (Epic 1, 1.1–1.4)
- 1.1 added a FOUC `<script>` in `index.html` (keep it) and `data-scheme` on `<html>`. The manifest `theme_color`/`background_color` are **static** (can't be per-scheme) — use Deep Sea (`#04141f`), the default.
- The lean-dep discipline held across 1.1–1.4 (no new *runtime* deps). `vite-plugin-pwa` is the first added dependency of Epic 1 — dev-only, justified, and explicitly named by the architecture. The dev agent should **HALT for user approval before `npm install`** per the dev-story dependency rule, even though it's specified here.
- Verification across 1.1–1.4 was blocked by the Base44 auth-gate + flaky preview tooling; expect the same here — lean on build-artifact assertions.

### Project Structure Notes
- Updated: `vite.config.js` (add VitePWA), `index.html` (drop dangling manifest link + external favicon), `package.json` (+devDependency). New: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512x512.png` (+ a local `favicon`/icon). No `src/**` logic changes expected.
- `@/` alias / JS-JSX conventions per `project-context.md`. The manifest/SW are generated into `dist/` at build — don't hand-author `public/sw.js` or `public/manifest.json`.

### References
- [Source: epics.md#Story 1.5] — the three ACs (installable via `vite-plugin-pwa`, install+auto-update; SW never requests push/notification + no Base44 API cache; auto-update on new deploy).
- [Source: ARCHITECTURE-SPINE.md#AD-12] — notifications off by construction; the PWA service worker never registers push; opt-in toggle (Story 1.4) starts off.
- [Source: epics.md Additional Requirements "Delivery = installable PWA"] — web manifest + SW for install + auto-update, **not** caching the Base44 API; local-first/IndexedDB is a deferred future adapter, not v1.
- [Source: SPEC.md#Constraints "Notifications off by construction"; #Open Questions] — installable PWA is the delivery decision of record (supersedes the UX docs' WebView assumption).
- [Source: PRD NFR1] — lean runtime dep set (17); NFR7 — no push by default.
- [Source: implementation-readiness-report-2026-07-01.md] — Story 1.5 builds the PWA shell (no push, no Base44 caching); the WebView→PWA doc-drift is resolved in favor of PWA.
- Current code: `vite.config.js` (plugins array), `index.html` (dangling manifest link + external favicon + FOUC script), `src/main.jsx` (PrefsProvider mount), `package.json` (17 runtime deps), `public/` (no icons, no manifest).

## Review Findings (code review 2026-07-01)

- [x] [Review][Patch] `<meta name="theme-color">` doesn't track the active scheme — **FIXED**: `PrefsProvider` now updates the `theme-color` meta to the active scheme's resolved `--background` on every scheme change (OS chrome tracks the scheme; the manifest splash `background_color` remains static by nature).
- [x] [Review][Patch] Manifest has no explicit `id` — **FIXED**: added `id: '/'` to the manifest (verified `"id":"/"` in the built `manifest.webmanifest`).
- [x] [Review][Defer] `autoUpdate` (skipWaiting/clientsClaim) could swap the shell mid-session → chunk-load error **if** `React.lazy`/dynamic imports are added later — routes are all statically imported today, so no active risk. Future watch-item.
- [x] [Review][Defer] Offline: `authError.type === 'unknown'` has no branch in `App.jsx` (pre-existing) → the installed shell loads offline but Base44 calls fail, showing a degraded state. Offline data is explicitly out of v1 scope (NFR11); consider a calm "can't reach the server" message later.
- [x] [Review][Defer] OAuth-callback navigation is served the precached `index.html` — **benign** (the `?access_token=…` is read from `window.location.search` at runtime, survives), but confirm login works with the SW active at /verify.
- [x] [Review][Defer] Maskable icon is byte-identical to the standard 512 (no distinct safe-zone padding); `apple-touch-icon` may clip the ring slightly on iOS — cosmetic; owner accepted the simple v1 icon. Purpose-built padded maskable art later.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.8) — bmad-dev-story workflow

### Debug Log References

- `npm install -D vite-plugin-pwa` → added `vite-plugin-pwa@^1.3.0` (+ workbox build-time transitives). Dev-only; the 17 **runtime** deps are unchanged.
- `npm run build` → **exit 0**; emits `dist/manifest.webmanifest`, `dist/sw.js`, `dist/workbox-*.js`, `dist/registerSW.js`, and the icons; `dist/index.html` has `registerSW.js` + `manifest.webmanifest` injected.
- SW guarantee greps on `dist/sw.js`: **no** `pushManager`/`showNotification`/`requestPermission`; precache list is **shell-only** (index.html, hashed JS/CSS, icons, manifest) — no Base44 URL and no `runtimeCaching`. The only `base44` token is the **navigation-fallback denylist** exclusion (correct).
- `npm run lint` → 0; `npx vitest run` → **72 pass** (0 regressions).

### Completion Notes List

**PWA wired via `vite-plugin-pwa` (Task 1):** added to `vite.config.js` after `base44()`/`react()` with `registerType: 'autoUpdate'`, `injectRegister: 'auto'`, `devOptions.enabled: false`. Auto-registration is injected into the built HTML — no `main.jsx` change.

**Manifest (Task 2):** `name`/`short_name` = **"Akha"** (owner decision), `display: standalone`, `start_url`/`scope` `/`, Deep-Sea `#04141f` theme/background, 3 icons (192, 512, maskable). Removed the dangling `<link rel="manifest" href="/manifest.json">` (VitePWA injects `manifest.webmanifest`), swapped the external Base44 favicon for a local `/favicon.png`, added `apple-touch-icon` + `theme-color`. The Story 1.1 FOUC scheme `<script>` is preserved.

**Service worker guarantees (Task 3, AD-12/AC-2):** default Workbox `generateSW`, `globPatterns: ['**/*.{js,css,html}']` — precache the **shell only**. **No `runtimeCaching`** → the Base44 API is never cached (always fresh; avoids the Nidus stale-read risk). `navigateFallbackDenylist` keeps the SPA fallback off `/api`, `/functions/`, and any `base44` path. No push/notification code anywhere — verified in the built `sw.js`. `skipWaiting()` + `clientsClaim()` give the silent auto-update (AC-3).

**Icons (Task 4):** authored `public/icon.svg` (Deep-Sea tile + accumulation-ring motif, sized inside the maskable safe zone) and rasterized to `pwa-192x192.png` / `pwa-512x512.png` / `pwa-maskable-512x512.png` + `favicon.png` via a one-off `sharp` script. `sharp` was then **uninstalled** (one-off tool; the PNGs + `icon.svg` source remain) to keep devDeps clean; the build works without it.

**⚠️ Verification scope / handoff to /verify:** all three ACs verified via **build-artifact assertions** (manifest content, SW precache list, no-push/no-Base44 greps, injected registration) — the honest ceiling in a headless, Base44-auth-gated environment. **The actual install / update / offline behaviour needs a real browser** (`vite preview` over localhost): confirm the install prompt appears + installs; deploy a change and confirm silent auto-update; DevTools → Application shows no push subscription and Base44 calls are served from network (not the SW cache).

**Note:** `npm install` reported build-toolchain vulnerabilities (workbox/transitives) — all in dev-only deps; did not `audit fix` to avoid destabilizing the build.

### Change Log

- 2026-07-01 — Implemented Story 1.5: installable PWA shell via `vite-plugin-pwa` (autoUpdate; manifest "Akha"; Deep-Sea icons). Service worker precaches the app shell only, never the Base44 API, and registers no push (AD-12). New icons + `icon.svg`; `vite.config.js` + `index.html` updated. 72 tests pass, lint/build clean. Status → review.

### File List

**New:**
- `public/icon.svg` — brand icon source
- `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512x512.png` — manifest icons
- `public/favicon.png` — local favicon

**Modified:**
- `vite.config.js` — `VitePWA(...)` plugin (manifest + workbox: shell-only precache, no push, no Base44 cache)
- `index.html` — local favicon + `apple-touch-icon` + `theme-color`; removed dangling `/manifest.json` link
- `package.json` / `package-lock.json` — `vite-plugin-pwa` devDependency (sharp added then removed)
