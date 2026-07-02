# Akha — Glossary

Load-bearing terms for the Akha contract. Cited by `SPEC.md`; shared vocabulary for every downstream consumer.

- **The builder** — the target user (Ryan, 40): someone moving real, identity-level goals, swamped and quietly dreading the day's list. Plain checkbox apps are too cold for him; loud companion apps too childish.
- **Focus view** — the single-task "doing" surface (CAP-3–5). Shows only the highest-ranked incomplete task; the backlog is off-screen. The creature and progress wheel live here.
- **Plan (capture/planning) surface** — the neutral utility screen where tasks are added and prioritized (CAP-2). The full list may be visible; the creature sits passively and does not react.
- **Archive** — the calm, flat reverse-chronological "what I did" history of completed work (CAP-8). Proof of progress, never a scoreboard.
- **The creature / companion** — the warm, restrained character (a monkey). Warm during *doing*, passive during *planning*. Reacts on a three-tier ladder; recolored per scheme.
- **Reaction ladder** — the three proportional, always-quiet tiers, set by event type only and flat within a tier: **tier 1** subtask complete → gentle smile + brief line; **tier 2** whole-task complete → little dance + progress-wheel growth; **tier 3** "I'm done for today" → deep, slow sigh. Never intensifies by priority, milestone, or volume. *(detail in EXPERIENCE.md)*
- **Progress wheel** — the daily **accumulation-only** indicator near the creature (CAP-5). Shows progress *made*, never progress *remaining*: no denominator, percentage, "remaining," or cross-day comparison; no full/closed state.
- **"I'm done for today"** — the explicit, optional gesture that ends the day, sweeps completed tasks into the Archive, and triggers the creature's sigh (CAP-6). Never auto-triggered by an empty list.
- **Carry-forward / "still needs doing"** — the calm treatment for incomplete tasks that roll to the next day (CAP-7). Never "overdue," never red, never escalating by age or volume.
- **The restraint contract** — the eight-line gate (SPEC Constraints; PRD §5) that any feature must pass to ship. The product's competitive moat, treated as an asset, not a limitation.
- **Subtask** — a one-level-deep child of a task (already in the shipped `Task` entity); revealed two-at-a-time in Focus, with exactly one active.
