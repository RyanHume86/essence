# Essence: integrating the recurrence engine into the existing repo

This supersedes the parts of `essence-spec.md` that assumed a greenfield TypeScript, local-first app. The repo is JavaScript/JSX, Base44-backed, and already uses `date-fns` and react-query. The files below are written to that reality and verified against it.

## Canonical files

- `src/lib/recurrence.js` is the engine. JS with JSDoc types, imports `date-fns`, operates on Base44's `due_date` strings and `completed` boolean. Verified: 37 tests pass across UTC-8, UTC+2, UTC+14, and the file is ESLint-clean against the repo config.
- `src/lib/recurrence.test.js` is the suite. Needs vitest (see below).
- `base44/entities/Task.jsonc` is the updated entity, adding `recurrence` and `occurrence_count`. Diff it against the current file; everything existing is preserved.

The API is date-string based, not Date-object based, because that is what the entity stores. Functions take and return `"YYYY-MM-DD"`.

## Step 1: the Base44 entity migration (do this first, and verify it)

Replace `base44/entities/Task.jsonc` with the updated version, then push the schema to Base44. The two new fields are `recurrence` (object, nullable) and `occurrence_count` (integer, default 0).

This is the highest-risk step, and it is the exact failure mode from Nidus Recall, where new fields never actually synced to Base44 despite the local code expecting them. So before building any UI on top:

1. Push the schema change.
2. Create one test task with a recurrence object and a non-zero occurrence_count directly, then read it back through `base44.entities.Task.list()` (or the SDK fetch you use) and confirm both fields survive the round trip.
3. Only once you have seen the fields persist and return should you wire the engine into the app.

Do not assume the migration worked because the local optimistic state looks right. The optimistic cache will happily show fields that the backend silently dropped. Confirm against a real read.

## Step 2: add vitest

The repo has no test runner. Add one:

```
npm i -D vitest
```

Then `npx vitest run src/lib/recurrence.test.js`. No config file is required for this suite. Optionally add `"test": "vitest run"` to package.json scripts.

Note: `src/lib` is excluded from the jsconfig typecheck `include`, so `npm run typecheck` will not check `recurrence.js`. The JSDoc types are still useful in-editor, and vitest is the real safety net here.

## Step 3: wire completion in Home.jsx

The current toggle treats every completion as a boolean flip:

```js
// current
mutationFn: (task) => base44.entities.Task.update(task.id, { completed: !task.completed }),
```

For a recurring task, completing it should roll `due_date` forward and keep it active, not mark it done. Route completion through the engine. Add the import:

```js
import { completeRecurringTask } from "@/lib/recurrence";
```

Then change `updateMutation` so both the network call and the optimistic update use the engine's field set when a recurring task is being completed:

```js
const updateMutation = useMutation({
  mutationFn: (task) => {
    const fields = (!task.completed && task.recurrence)
      ? completeRecurringTask(task)
      : { completed: !task.completed };
    return base44.entities.Task.update(task.id, fields);
  },
  onMutate: async (task) => {
    await queryClient.cancelQueries({ queryKey: ["tasks"] });
    const previous = queryClient.getQueryData(["tasks"]);
    const fields = (!task.completed && task.recurrence)
      ? completeRecurringTask(task)
      : { completed: !task.completed };
    queryClient.setQueryData(["tasks"], (old = []) =>
      old.map((t) => (t.id === task.id ? { ...t, ...fields } : t))
    );
    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    toast({ variant: "destructive", title: "Could not update task", description: "Please try again." });
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
});
```

`fields` is computed in both callbacks rather than shared, because react-query runs `onMutate` before `mutationFn` and they do not share a scope. The only divergence risk is if local midnight passes between the two calls, which is negligible. If you want to remove even that, stash the result on a ref in `onMutate` and read it in `mutationFn`.

Un-completing a recurring task (the reverse toggle) keeps the simple `{ completed: false }` path, which the condition above already handles, since it only diverts when `!task.completed`.

## Step 4: the editor (not yet built)

The recurrence editor is the remaining UI work. It needs to:

- Build the rule with `createRecurrenceRule(seedDueDate, opts)`, never a hand-written literal, so `monthAnchorDay` is always set.
- Seed the task's `due_date` with `firstOccurrenceOnOrAfter(rule, pickedDate)` so weekly-by-weekday tasks start on a valid day.
- Show the live `previewOccurrences(rule, seedDueDate, 3)` strings as "Next 3: ...".

Format the preview strings for display with the same `date-fns` `format` the app already uses elsewhere (`format(parseISO(s), "EEE, d MMM")`).

## What in essence-spec.md is now superseded

- Section 3 (data ownership). The local-first IndexedDB recommendation and the "defer sync / use Supabase LWW" advice do not apply. The app is already Base44-backed with react-query. Sync is the existing architecture, not a future choice. Export remains a reasonable optional add, but it is a smaller win when Base44 already holds the data, and it is not a substitute for confirming the migration in Step 1.
- The TypeScript `Task` interface and Date-object API in the spec are illustrative only. `src/lib/recurrence.js` is canonical.
- Section 2 (calm overdue). The app already ships an "Overdue" group in `Home.jsx` and a highlight-coloured overdue chip in `TaskItem.jsx`. Adopting the calm design means editing those, not adding new code, and it remains an optional design choice rather than something the engine requires.

## What did not change

The recurrence semantics themselves: the two anchors, roll-forward on late completion, the monthly-31 fix, the explicit end conditions, and the preview. Those were sound and carried over unchanged in behaviour. Only the data contract around them was reconciled to the repo.
