---
project_name: 'akha'
user_name: 'Ryanr'
date: '2026-06-23'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 27
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core:** JavaScript + JSX — **no TypeScript source** (`components.json` → `tsx:false`); types via JSDoc · React 18.2 · React Router 6.26 · Vite 6.1 (`@vitejs/plugin-react`) + `@base44/vite-plugin` 1.0.23
**Backend:** `@base44/sdk` 0.8.32 (auth, entities, serverless functions) — no custom server
**Data/UI:** TanStack Query 5.84 · Tailwind 3.4.17 (+ `tailwind-merge` 3.0, `clsx`, `class-variance-authority`) · shadcn "new-york" (Radix) · lucide-react 0.475 · framer-motion 11.16 · vaul 1.1 (drawers) · date-fns 3.6
**Tooling:** Vitest 4.1 (no dedicated config — via `vite.config.js`) · ESLint 9.19 flat · TypeScript 5.8 (`checkJs` only)
**Constraint:** dependency set is deliberately lean (~17 runtime deps). Prefer existing deps (especially date-fns) over adding new ones.

## Critical Implementation Rules

### Language-Specific Rules

- JS/JSX only — no `.ts`/`.tsx`. Type with JSDoc (`@typedef`, `@param`).
- Always import via the `@/` alias (`@/lib/…`, `@/components/…`); configured in `jsconfig.json` + Vite.
- Unused imports/vars are **errors** (`unused-imports`); prefix intentionally-unused with `_` (e.g. `_err`, `_vars`).

### Framework-Specific Rules (React · Base44 · Query)

- **All Task reads/writes go through `useTasks()`** (`src/hooks/useTasks.js`). Don't call `base44.entities.Task.*` in components — add a mutation to `useTasks`; it owns optimistic update, rollback, and debounced calendar auto-sync.
- Optimistic mutations compute the patch in **both** `onMutate` and `mutationFn` (no shared scope); roll back to `ctx.previous` on error and `invalidateQueries(["tasks"])` on settle.
- Backend is Base44: entities in `base44/entities/*.jsonc`; serverless via `base44.functions.invoke(name, args)`.
- Keep hook order stable — `useTasks` builds every mutation unconditionally. No conditional hooks.
- framer-motion must respect `useReducedMotion()` (gate entrance/stagger animations).

### Recurrence Engine Rules (`src/lib/recurrence.js`)

- Works entirely in date-only `"YYYY-MM-DD"` strings (matches Base44 `due_date`). **Never** introduce Date-object/ISO-datetime public APIs — `parseISO` = local midnight, round-trips without UTC drift.
- Build rules **only** via `createRecurrenceRule(seed, opts)` — never a hand-written literal (it sets `monthAnchorDay`, sorts weekdays, validates interval).
- Complete recurring tasks via `completeRecurringTask(task)` (rolls `due_date` forward or ends the series). Seed with `firstOccurrenceOnOrAfter`, preview with `previewOccurrences`.
- v1 limit: multi-weekday weekly forces `interval=1` (constructor throws otherwise).
- `recurrence` JSON keys are **camelCase by design** (opaque, engine-owned), even though Base44 fields are snake_case (`due_date`, `occurrence_count`).

### Testing Rules

- Vitest, no dedicated config (resolved via `vite.config.js`). Run `npm test` or `npx vitest run <file>`.
- `src/lib` is the tested layer — colocate `*.test.js`. It is the **only** safety net for `src/lib` (see scope gaps below).
- Recurrence tests assert across UTC-8/+2/+14 — preserve that invariant when extending.

### Code Quality & Style Rules

- ⚠️ **Lint/typecheck scope gaps:** ESLint lints only `src/components/**`, `src/pages/**`, `src/Layout.jsx` and **ignores `src/lib/**` and `src/components/ui/**`**. `typecheck` **excludes** `src/lib`, `src/api`, `src/components/ui`. → engine changes are caught by Vitest only.
- Naming: components `PascalCase.jsx`, hooks `useX.js`, lib `camelCase.js`, pages `PascalCase.jsx`.
- Reuse the existing UI idiom: `rounded-full` chips (active = `bg-primary/10 text-highlight border-primary/30`), tokens `surface-raised` / `btn-accent-3d` / category tokens, CSS variables from `tailwind.config.js`. **No hardcoded hex.**
- `src/components/ui/**` is generated shadcn — treat as vendor, don't hand-edit.

### Development Workflow Rules

- Env: `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL` in `.env.local` (gitignored); app id also in `base44/.app.jsonc`. Params can also pass via URL query (`?app_id=&app_base_url=`).
- Vite suppresses its ready banner (`logLevel:'error'`) — the dev server still serves on `:5173`.
- Conventional-style commit subjects; PRs merge to `main`.

### Critical Don't-Miss Rules

- ⚠️ **Verify Base44 entity migrations round-trip** — after editing `base44/entities/*.jsonc`, create→read-back through the SDK; don't trust the optimistic cache (the documented "Nidus" failure: new fields silently don't persist while local state looks fine).
- Don't bypass `useTasks` for task mutations (breaks optimistic UX + calendar sync).
- Don't hand-roll date math in components (month/year clamping is subtle, e.g. Jan 31 + 1mo) — use date-fns / the recurrence helpers.
- Completion-anchored recurrences have **no** RRULE/calendar equivalent — emit a single dated event, never a fake RRULE.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when the technology stack or core patterns change.
- Review periodically; remove rules that become obvious over time.

Last Updated: 2026-06-23
