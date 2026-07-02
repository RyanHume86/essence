---
title: "Akha PRD — Addendum"
created: 2026-06-29
note: "Depth preserved from Discovery that belongs to downstream work (architecture, future strategy) or earned a place but does not fit the PRD body."
---

# Addendum

## Killed directions (keep killed)

From the idea-forging round. Recorded so they are not silently revived as "new ideas" later.

- **AI assistant as the basis — KILLED.** Rationale: the most commoditized, giant-owned capability; basing the product on it breaks free-core economics and was a reflex grab under competitive pressure. AI may appear, if ever, only as an optional add-on — never the foundation.
- **"Warmth alone retains" — KILLED.** A warm character you grow already exists at scale and habituates by roughly week six. Retention must come from the *integrated feeling* (visible progress + restraint tied to real goals), not the creature's warmth on its own.
- **Streak / statistics page — KILLED.** It *is* the guilt engine; it contradicts Brand rule 1. (Now enforced structurally by FR23/FR26.)
- **Scale / mass-market goal — SET ASIDE for v1.** The product is deliberately niche and build-for-yourself. Mass-market was abandoned on purpose, not failed.

## Moat reasoning (strategic context)

The defensibility argument behind the bet: the moat is **the feeling delivered with taste + genuine no-shame restraint, tied to real identity-level goals** — not the feature list. "Taste" and integrated restraint are hard to copy; a feature is not. This is why the restraint contract (PRD §5) is treated as a competitive asset, not a constraint.

## Future monetization shape (not v1)

v1 is unmonetized. When/if monetization is revisited, the researched starting shape was:

- **Free core** — full companion, focus view, and win-moments always free (Brand rule 7).
- **Paid "convenience/portability" tier** — backup, export, and cross-device extras only; never the feeling.
- **Pricing anchor** — roughly $20–40/yr, *identical on iOS and Android*, no surprise charges, no gacha/shop mechanics.
- **Gate to cross before monetizing** — an unbiased payment signal from a builder who is not the author (current demand evidence is n=2, one biased).

## Forge prerequisites (status note)

The forge framed two items as prerequisites to "real planning": (1) proving the felt win-moment lands on a stranger, and (2) an unbiased payment signal. The user has consciously chosen to proceed with a build-for-yourself v1 and treat both as **future gates before widening/monetizing** (PRD §6), rather than as blockers to this PRD.

## Shipped-reality notes for the architecture phase

- **Subtasks already exist** in the Base44 `Task` entity (array, one level deep, each with a `completed` flag) — verified in `base44/entities/Task.jsonc`. The subtask-level *reaction* and the two-at-a-time reveal are the new work, not the data model.
- **Archive + day-end sweep** need new Base44 completed-task retention and a client-triggered sweep (no server scheduler exists). Progress today is ephemeral, date-keyed `localStorage` that resets daily — it is not a history store.
- **Local-first target (NFR11)** conflicts with the shipped Base44 cloud backend; resolving it is the largest single architectural decision deferred from this PRD.
- **`src/lib` is unguarded** by ESLint/typecheck — Vitest only (NFR12).
- **Recurrence engine** is built and tested but unwired; out of scope for v1 (Ryan has no repeating tasks).
