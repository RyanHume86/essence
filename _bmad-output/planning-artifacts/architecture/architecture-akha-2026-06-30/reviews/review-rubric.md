# Architecture Spine — Rubric Review

**Target:** `architecture-akha-2026-06-30/ARCHITECTURE-SPINE.md`
**Reviewer role:** rubric-walker (good-spine checklist)
**Date:** 2026-06-30
**Verdict:** **PASS with concerns.** A tight, genuinely brownfield-ratifying spine. The decision dimensions it owns are well-fixed and enforceable. Two real gaps: **NFR7 (push-notification default-off) has no architectural home**, and the **operational/environmental envelope (deployment target, environments, env-vars, CI) is left silent as a dimension**. Plus one cosmetic diagram inconsistency.

---

## Checklist item 1 — Fixes the real divergence points for the level below; misses none

**PASS.**

The eleven ADs map cleanly onto the forks that would let two features/epics diverge:

- **Where state lives** (the shipped split-brain: tasks in Base44, win-count in `localStorage`) → AD-1 (port) + AD-6 (prefs local).
- **How mutations/rollback behave** → AD-2 (single optimistic funnel).
- **What "today's progress" / "carry-forward" mean** → AD-3 (derived, never stored).
- **Where business rules live and how they're tested** → AD-4 (pure fns in `src/lib`, Vitest-only).
- **Task schema / ranking home** → AD-5.
- **What "archived" means and what triggers it** → AD-7 (stamp, manual-only).
- **What Focus may expose** → AD-8 (one task, backlog only on Plan).
- **How the companion is wired** → AD-9 (transient tier-tagged emitter).
- **Recolor / theming approach** → AD-10 (one art set, token retint).
- **Motion/alarm cross-cut** → AD-11.

These are the dimensions where two epics built independently would actually collide. Nothing obvious is missing at the divergence level the initiative altitude owns — *except* the two silent dimensions flagged in items 6 and 7 below (NFR7 and the operational envelope).

## Checklist item 2 — Every AD's Rule is enforceable and prevents its stated divergence (not vague aspiration)

**PASS.**

Rules are mechanically checkable, not aspirational:

- AD-1: "only store modules may import the backend client" — grep-able (`base44.entities.*` outside `src/hooks`/`src/api`).
- AD-2: "compute the patch in **both** `onMutate` and `mutationFn` (no shared scope)" — this is exactly the shipped pattern in `useTasks.js` (the `toggleM` duplication, lines 87-97) and is verifiable by reading the mutation.
- AD-3: "today-progress = count of `completed_at` in local day; carry-forward = `incomplete && due_date < today`" — a concrete formula, plus "retire `winMoment`," which is a deletable artifact.
- AD-5: enumerates the four new fields and the two dropped ones; "round-trip-verified via a real read before wiring" is the named Nidus guard.
- AD-8: names the exact ordering function and tiebreak chain.
- AD-11: "`role="img"` … never `role="progressbar"`; delete `RING_TARGET=8`" — a literal constant to remove.

The only mild softness: AD-10's creature-recolor rule allows a per-scheme-export "fallback only if a filter can't hit a scheme's `creature-tint`." That's a sanctioned escape hatch, not a hole — it's bounded and the default is enforced — so it stays PASS.

## Checklist item 3 — Nothing load-bearing deferred (nothing under Deferred could let two units diverge)

**PASS.**

The Deferred list is genuinely post-v1 or trade-off-closed, not load-bearing-punted:

- Local-first / IndexedDB adapter, cross-device pref sync, full offline PWA — all sit *behind* the AD-1 port, so deferring them cannot cause divergence (the seam is already fixed). This is the correct thing to defer.
- Recurrence engine, Google Calendar sync, Category UI — kept dormant/unsurfaced with explicit gates (`CALENDAR_CONNECTED_KEY` default-false, `Task.category` kept-but-unsurfaced). No two units can diverge on something there's no v1 UI for.
- **Manual-`order` representation (float gap-key vs integer reindex)** — this one is the closest to load-bearing, because two features writing `order` differently *could* diverge. But the spine explicitly assigns it an owner ("owned by `lib/ordering` + the store at build time"), so it's a scoped build-time decision behind a single module, not an open fork. Acceptable.
- Never-swept accumulation — a deliberate UX consequence, not an architectural fork.

## Checklist item 4 — Named tech plausibly verified-current (versions ratified from the brownfield repo)

**PASS.**

Every version in the Stack table matches `_bmad-output/project-context.md` (dated 2026-06-23) exactly: React 18.2, Router 6.26, Vite 6.1, TanStack Query 5.84, Tailwind 3.4.17, lucide 0.475, framer-motion 11.16, date-fns 3.6, `@base44/sdk` 0.8.32, Vitest 4.1, ESLint 9.19 (flat). The spine correctly tags this as a *seed* ("the code owns this once it exists") and reproduces the NFR1 ~17-dep constraint. The brownfield `base44Client.js` confirms `@base44/sdk`'s `createClient` is the live API.

Minor: the spine lists `@base44/vite-plugin` without a version where project-context pins `1.0.23`, and omits `vaul 1.1` (drawers) and TypeScript 5.8 (`checkJs` only). Not a defect for an initiative-altitude seed, but worth a one-line note that the lockfile is the source of truth.

## Checklist item 5 — RATIFIES rather than contradicts the brownfield codebase

**PASS.** This is the spine's strongest dimension. Checked against the three named files:

- **`src/hooks/useTasks.js`** — AD-2's "one TanStack Query cache per domain (`["tasks"]`), optimistic, compute patch in both `onMutate` and `mutationFn`, rollback to `ctx.previous`, invalidate on settle" is a verbatim description of the shipped `useOptimisticMutation` factory and the `toggleM` no-shared-scope pattern. The "stable hook order / no conditional hooks" rule matches the "build every mutation unconditionally" comment.
- **`src/api/base44Client.js`** — AD-1's "only module that imports the backend SDK" matches: this file is the sole `createClient` caller. Ratified, not contradicted.
- **`src/lib`** — AD-4's "Vitest-only safety net, ESLint/typecheck exclude `src/lib`" matches project-context's documented scope gap exactly. `recurrence.js` / `createRecurrenceRule` / `winMoment.js` all exist as described.

The spine is honest about what it *changes* vs *ratifies*, and the changes are real shipped debt:
- `winMoment.js` is the localStorage day-keyed counter + emitter AD-3 retires — confirmed present.
- `Companion.jsx:20` still defines `RING_TARGET=8` — AD-11's "delete, not re-skin" is a real, load-bearing instruction (there is also a separate `ProgressRing.jsx` already at `role="img"`; the spine should be aware both exist).
- The `clearCompleted` mutation in `useTasks.js` **deletes** completed tasks (`Task.delete`) — exactly the behavior AD-7 replaces with archive-stamping. Correctly identified.

**One accuracy nit (not a fail):** AD-5 says it drops "the code's undeclared `due_time` and `today`." That's precise — `due_time`/`today` appear only in `useTasks.buildNew()` runtime code (lines 66, 68) and `taskUtils.isOverdue`, **not** in `Task.jsonc` (which has no such fields). So "undeclared" is the right word. Likewise `priority:"normal"` is a code literal (line 69), not a schema enum; AD-5's "becomes the integer" is the correct reconciliation. Schema-vs-code ratification is sound.

## Checklist item 6 — Covers the driving spec's capabilities (FR1-FR26, NFR1-NFR12)

**CONCERN.** All 26 FRs have a home; the gap is on the NFR side.

FR coverage (via Capability→Architecture Map): FR1-3/24 ✓, FR4-10 ✓, FR11-16/25 ✓, FR17-20 ✓, FR21 ✓, FR22-23/26 ✓. FR7 (nudge-to-decompose) and FR8 (planning-surface-neutral / creature passive) are UI behaviors that ride the capture row and AD-9's "reactions fire on transitions only"; no structural fork, acceptable. All FRs covered.

NFR coverage: NFR1 (Stack), NFR2/10/11 (AD-1, row 8), NFR3 (AD-11), NFR4/6 (AD-2), NFR5 (AD-10/AD-11), NFR8/9 (AD-6, AD-10, row 1), NFR12 (AD-4). That's 11 of 12.

- **NFR7 (no push notifications by default; opt-in toggle that always starts off) has NO architectural home.** It is not in the Capability Map, not bound by any AD, and not in Deferred. The spine mentions a PWA service worker but scopes it to "installability only" — which actually *enables* push without any AD constraining the default-off policy. Given the restraint contract, a default-off notification posture is exactly the kind of invariant a spine should pin (and the service worker is the one new surface area v1 adds, per NFR1's own note). **Add an AD or a Deferred line that binds NFR7** — e.g. "no notification surface in v1; if added later, opt-in, default-off, behind `usePrefs`." Without it, two features (the PWA shell and a future settings toggle) could diverge on notification behavior.

## Checklist item 7 — Every dimension the initiative altitude owns is decided/deferred/open; no whole dimension silent (esp. operational/environmental envelope)

**CONCERN.** The structural, data, persistence, theming, motion, and testing dimensions are all explicitly decided or deferred. But the **operational/environmental envelope is largely silent as a dimension:**

- **Deployment target** — Where does the PWA ship? No host, no build-output contract, no "Base44-hosted vs static CDN" decision. Silent.
- **Environments** — dev vs prod, and the env-var contract (`VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `.env.local`, URL-query param fallback) are documented in project-context.md but **not ratified or referenced** by the spine. An epic touching config has no fixed seam.
- **Build** — partially covered (Vite 6.1 named, "PWA shell = manifest + minimal service worker" is the one new build surface). This sub-dimension is OK.
- **Test** — covered well (AD-4, Vitest-only, conventions table).
- **Infra / CI** — no mention of CI, the lint/typecheck/test gate sequence, or what runs on PR-to-`main` (project-context names conventional commits + merge-to-main but the spine doesn't ratify a gate). Silent.

This isn't fatal — v1 is build-for-yourself and the persistence containers diagram covers the *runtime* topology. But "deployment + environments + CI" is a whole dimension the initiative altitude owns, and right now it's neither decided nor explicitly deferred. **Recommend a short "Operational envelope" subsection** that at minimum: (a) names the deploy target, (b) ratifies the env-var contract from project-context, and (c) states the CI/quality-gate posture (or explicitly defers them with a reason). Even "v1 deploys as a Base44-hosted PWA; env-var contract per project-context; no CI gate beyond local `npm test`/lint — deferred" would close the silence.

## Diagrams & state machine — sanity check

**Mermaid #1 (Invariants `graph TD`):** Valid syntax. Consistent with the prose layering (Surfaces → Stores → Logic/Adapter; only adapter → Base44; `ST --> LS` for prefs; `A -.future.-> IDB`). One **cosmetic inconsistency:** the node defines `LS[("localStorage<br/>prefs — v1")]` and the edge is `ST --> LS`, i.e. the **store** writes localStorage — which matches AD-6 (`usePrefs` is "the local-first side of the port boundary"). But the prose Design Paradigm says the *adapter* is "the only module that imports the backend SDK" and lists prefs as living "local behind a `usePrefs` store." So `usePrefs` reaching `localStorage` directly (not via the `base44` adapter) is intentional and correct — the diagram is consistent, just worth noting `usePrefs` bypasses the adapter by design. Not a defect.

**Mermaid #2 (Structural Seed `graph LR`):** Valid. Consistent with #1 and the prose — `Stores --> Local` mirrors `ST --> LS`, `Adapter --> Base44`, future IDB dotted. The subgraph correctly frames the client as the installable PWA. Good.

**State diagram (`stateDiagram-v2`):** Valid syntax. Consistent with AD-7 and the lifecycle prose: Active↔Completed (complete/un-complete toggling `completed_at`), Completed→Archived only via the explicit "I'm done for today" sweep stamping `archived_at`, and delete reachable from all three states as "explicit only." Matches AD-7's "stamp never delete" and "archiving triggered only by that gesture — never by age/midnight/empty-list." **Minor completeness note:** the diagram has no transition for task *creation* into `[*] --> Active` carrying the schema defaults, and no edge showing carry-forward (which is derived, not a state transition — correctly so). Both are fine; carry-forward is a *read* derivation per AD-3, not a stored state, so its absence from the state machine is correct.

---

## Findings summary (severity-tagged)

1. **[Medium] NFR7 has no architectural home.** No-push-by-default / opt-in-off-by-default is unbound by any AD and absent from Deferred, while the v1 service worker actively opens the push surface. Add an AD or Deferred line binding it.
2. **[Medium] Operational/environmental envelope is silent as a dimension.** Deployment target, environments + env-var contract, and CI/quality-gate posture are neither decided nor deferred. Add a short "Operational envelope" subsection (decide or explicitly defer).
3. **[Low] Stack seed omits a few pinned items.** `@base44/vite-plugin 1.0.23`, `vaul 1.1`, TypeScript 5.8 (`checkJs`) are in project-context but not the table; note the lockfile as source of truth.
4. **[Low/cosmetic] Diagram note:** `usePrefs → localStorage` intentionally bypasses the `base44` adapter (per AD-6); correct but worth an explicit one-liner so a reader doesn't think it violates AD-1.
5. **[Info] `Companion.jsx` and `ProgressRing.jsx` both exist;** AD-11's "delete `RING_TARGET=8`" lives in `Companion.jsx:20`. The delete instruction is real and load-bearing — ensure the wheel work targets the right file.

Everything else passes. The spine ratifies the brownfield code faithfully, fixes the genuine divergence points, and its rules are enforceable rather than aspirational.
