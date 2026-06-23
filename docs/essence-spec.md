# Essence: build spec for recurring tasks, calm overdue handling, and data ownership

> Source of truth: `src/lib/recurrence.js` (JavaScript with JSDoc) and `integration-notes.md`. This document is design rationale. The repo is JavaScript/JSX and Base44-backed, so the TypeScript snippets and the Date-object API shown below are illustrative only; the shipped engine uses a date-string API matching Base44's `due_date`. Where this document and the code or integration notes disagree, the code and integration notes win. In particular, Section 3 (data ownership) is superseded by `integration-notes.md`, because the app is already cloud-backed via Base44 rather than local-first.

Scope: three feature areas derived from forum and Reddit research on why people abandon to-do apps. The recurrence engine ships as `src/lib/recurrence.js` with `src/lib/recurrence.test.js` (37 tests, verified passing across UTC-8, UTC+2, and UTC+14 against the repo's date-fns, and ESLint-clean). See `integration-notes.md` for how it maps onto the existing repo, including the required Base44 entity migration.

A note on framing before you build: this research was about a competitive product category. Essence is your personal app. Treat the "ownership" and "anti-shame" sections as optional unless they match how you personally work. The recurring-task section is universally worth building because the bug it fixes is real, reproducible, and present in almost every major app.

---

## Build order (recommended)

1. Recurring-task model. Pure logic, no backend, highest leverage. Build first.
2. Export (JSON, ICS, Markdown). About 60 lines total, high trust value, no backend.
3. Calm overdue display. Pure derived state and styling.
4. In-app reminders, plus ICS hand-off to the OS calendar for anything that must fire in the background.
5. Base44 entity migration for `recurrence` and `occurrence_count`, verified to persist. This is a prerequisite for using recurrence in the app, not an afterthought. Do it and confirm the round trip before wiring the editor. See `integration-notes.md`, Step 1.

---

## 1. Recurring-task model

### The problem being solved

Every major app mishandles late completion of recurring tasks. Todoist can push a yearly task an entire year forward if completed a few days late. Microsoft To Do leaves daily tasks showing as overdue after completion. The root cause is conflating two distinct meanings of "repeat" and never surfacing the difference to the user.

The two meanings:

- Fixed (calendar-anchored): "every Monday", "the 1st of each month". Next occurrence is computed from the schedule, independent of when you actually finish.
- Completion-anchored: "4 weeks after each haircut", "every 3 days from when I last watered". Next occurrence is computed from the actual completion date.

The fix is not clever date maths. It is making the choice explicit at creation and showing a preview so behaviour is never surprising.

### Data model

```ts
type RecurrenceAnchor = 'fixed' | 'completion';
type RecurrenceUnit = 'day' | 'week' | 'month' | 'year';

interface RecurrenceEnd {
  type: 'never' | 'onDate' | 'afterCount';
  date?: string;   // ISO, when type === 'onDate'
  count?: number;  // when type === 'afterCount'
}

interface RecurrenceRule {
  anchor: RecurrenceAnchor;
  unit: RecurrenceUnit;
  interval: number;          // every N units, >= 1
  weekdays?: number[];       // 0 (Sun) to 6 (Sat). Only used for fixed weekly. v1: interval must be 1 if set.
  monthAnchorDay?: number;   // 1 to 31. Set by createRecurrenceRule for fixed monthly. Preserves "the 31st".
  end: RecurrenceEnd;
}

interface Task {              // The Base44 Task entity (see base44/entities/Task.jsonc)
  id?: string;               // Base44-assigned
  title: string;
  completed: boolean;        // boolean toggle, NOT a timestamp
  category?: string;         // enum: Work | Personal | Shopping | Health | Other
  due_date?: string;         // "YYYY-MM-DD". For a recurring task, the CURRENT occurrence's date
  comment?: string;
  subtasks?: Subtask[];      // nested one level deep
  recurrence?: RecurrenceRule | null;  // new field, requires entity migration
  occurrence_count?: number;           // new field, completed occurrences so far
}
```

The data model is the existing Base44 entity, not a fresh design. Two fields are new (`recurrence`, `occurrence_count`) and require a Base44 schema migration before use. The completion date needed for completion-anchored recurrence is "today" at the moment of toggling, since the entity stores no completion timestamp. The engine therefore works in date-only `"YYYY-MM-DD"` space throughout, matching `due_date`. See `integration-notes.md` for the migration and wiring.


`scheduledFor` always holds the due date of the occurrence currently in front of you. When you complete it, you compute the next `scheduledFor`, reset `completedAt` to null, and increment `occurrenceCount`. A recurring task is one row with a moving date, not a pile of rows.

### Date helpers

Month and year arithmetic is where hand-rolled code breaks (Jan 31 plus one month). These clamp correctly.

```ts
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const targetDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(targetDay, daysInTargetMonth)); // Jan 31 + 1 month -> Feb 28/29
  return d;
}

// Like addMonths, but clamps from a fixed anchor day rather than the input day.
// This is what lets a "monthly on the 31st" task return to 31 after a short month.
function addMonthsAnchored(date: Date, n: number, anchorDay: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(anchorDay, daysInTargetMonth));
  return d;
}

function addInterval(date: Date, unit: RecurrenceUnit, interval: number): Date {
  const d = new Date(date);
  switch (unit) {
    case 'day':   d.setDate(d.getDate() + interval); return d;
    case 'week':  d.setDate(d.getDate() + interval * 7); return d;
    case 'month': return addMonths(d, interval);
    case 'year':  return addMonths(d, interval * 12); // reuses month clamping, handles Feb 29
  }
}
```

If you would rather not own this, `date-fns` (`addMonths`, `addWeeks`) clamps the same way and is a small, tree-shakeable dependency. Given you pruned to 17 packages, the hand-rolled version above keeps the count flat.

### The core function

```ts
const DAY_MS = 86_400_000;

function computeNextOccurrence(
  rule: RecurrenceRule,
  scheduledFor: Date,
  completedAt: Date,
  today: Date = new Date()
): Date {

  // Completion-anchored: next = completion date + interval. The haircut case.
  if (rule.anchor === 'completion') {
    return addInterval(startOfDay(completedAt), rule.unit, rule.interval);
  }

  const floor = startOfDay(today);

  // Fixed weekly with specific weekdays, e.g. every Mon/Wed/Fri.
  if (rule.unit === 'week' && rule.weekdays && rule.weekdays.length > 0) {
    return nextWeekdayOccurrence(rule, scheduledFor, today);
  }

  // Fixed monthly: anchor to the original day-of-month so the 31st returns
  // after a short month, instead of clamping to 28 and staying there.
  if (rule.unit === 'month') {
    const anchor = rule.monthAnchorDay ?? startOfDay(scheduledFor).getDate();
    let next = addMonthsAnchored(startOfDay(scheduledFor), rule.interval, anchor);
    while (next < floor) next = addMonthsAnchored(next, rule.interval, anchor);
    return next;
  }

  // Fixed day / weekly-cadence / year: advance from the schedule, then roll
  // forward to the next slot not in the past. Anchoring to scheduledFor, NOT
  // completedAt, is what prevents the "skip an extra cycle" bug (Todoist yearly).
  let next = addInterval(startOfDay(scheduledFor), rule.unit, rule.interval);
  while (next < floor) {
    next = addInterval(next, rule.unit, rule.interval);
  }
  return next;
}

function nextWeekdayOccurrence(rule: RecurrenceRule, scheduledFor: Date, today: Date): Date {
  const days = [...(rule.weekdays as number[])].sort((a, b) => a - b);
  // Search from the day after the current occurrence, but never before today.
  const fromMs = Math.max(startOfDay(scheduledFor).getTime() + DAY_MS, startOfDay(today).getTime());
  const from = new Date(fromMs);
  for (let i = 0; i < 14; i++) {
    const cand = new Date(from);
    cand.setDate(cand.getDate() + i);
    if (days.includes(cand.getDay())) return cand;
  }
  return from; // unreachable for a non-empty weekday set
}
```

### The "roll forward, do not backlog" decision

When a fixed task is completed very late, the loop rolls to the next future slot rather than generating every missed instance. For a calm personal app this is the right default: a task missed for three weeks should not spawn three guilt-inducing copies.

If you ever want the opposite (genuine obligations where each missed instance matters, for example monthly invoices), generate intermediate occurrences instead of looping past them. Keep this as an explicit per-task option, not a global behaviour, and default it off.

### Honouring the end condition

After computing `next`, gate it:

```ts
function applyEnd(next: Date | null, rule: RecurrenceRule, nextCount: number): Date | null {
  if (!next) return null;
  if (rule.end.type === 'onDate' && rule.end.date) {
    return next > startOfDay(new Date(rule.end.date)) ? null : next;
  }
  if (rule.end.type === 'afterCount' && rule.end.count != null) {
    return nextCount >= rule.end.count ? null : next; // >= : end at exactly `count` occurrences
  }
  return next;
}
```

A null return means the series is finished. Mark the task done permanently rather than rescheduling.

### Completion handler (the glue)

```ts
function completeRecurring(task: Task, now: Date = new Date()): Task {
  if (!task.recurrence || !task.scheduledFor) {
    return { ...task, completedAt: now.toISOString(), updatedAt: now.toISOString() };
  }
  const raw = computeNextOccurrence(
    task.recurrence,
    new Date(task.scheduledFor),
    now,
    now
  );
  const nextCount = task.occurrenceCount + 1;
  const next = applyEnd(raw, task.recurrence, nextCount);

  if (!next) {
    // Series ended. Close it out.
    return { ...task, completedAt: now.toISOString(), recurrence: null, occurrenceCount: nextCount, updatedAt: now.toISOString() };
  }
  // Roll to the next occurrence: same row, new date, reopened.
  return {
    ...task,
    scheduledFor: startOfDay(next).toISOString(),
    completedAt: null,
    occurrenceCount: nextCount,
    updatedAt: now.toISOString(),
  };
}
```

### Construction and preview (call these from the editor)

Two helpers remove creation-time footguns and power the preview. Always build rules with `createRecurrenceRule`, never by writing a rule literal, so `monthAnchorDay` is never forgotten.

```ts
function createRecurrenceRule(
  seedDate: Date,
  opts: { anchor: RecurrenceAnchor; unit: RecurrenceUnit; interval?: number; weekdays?: number[]; end?: RecurrenceEnd; }
): RecurrenceRule {
  const interval = opts.interval ?? 1;
  if (interval < 1) throw new Error('interval must be >= 1');
  const hasWeekdays = opts.unit === 'week' && !!opts.weekdays && opts.weekdays.length > 0;
  if (hasWeekdays && interval > 1) throw new Error('Multi-weekday with interval > 1 is unsupported in v1');

  const rule: RecurrenceRule = { anchor: opts.anchor, unit: opts.unit, interval, end: opts.end ?? { type: 'never' } };
  if (hasWeekdays) rule.weekdays = [...(opts.weekdays as number[])].sort((a, b) => a - b);
  if (opts.unit === 'month' && opts.anchor === 'fixed') rule.monthAnchorDay = startOfDay(seedDate).getDate();
  return rule;
}

// Seed a task's scheduledFor correctly, including weekly-by-weekday starts.
function firstOccurrenceOnOrAfter(rule: RecurrenceRule, from: Date): Date {
  const start = startOfDay(from);
  if (rule.unit === 'week' && rule.weekdays && rule.weekdays.length > 0) {
    const days = [...rule.weekdays].sort((a, b) => a - b);
    for (let i = 0; i < 7; i++) {
      const cand = new Date(start);
      cand.setDate(cand.getDate() + i);
      if (days.includes(cand.getDay())) return cand;
    }
  }
  return start;
}

// The "Next N" preview. Assumes on-time completion. Truncates at series end.
function previewOccurrences(rule: RecurrenceRule, seedDate: Date, n: number): Date[] {
  if (n <= 0) return [];
  const out: Date[] = [];
  let current = firstOccurrenceOnOrAfter(rule, seedDate);
  let completed = 0;
  for (let i = 0; i < n; i++) {
    out.push(new Date(current));
    completed += 1;
    const next = applyEnd(computeNextOccurrence(rule, current, current, current), rule, completed);
    if (!next) break;
    current = startOfDay(next);
  }
  return out;
}
```

### UI legibility (this is half the value)

Two things prevent the silent-drift trust loss that kills these features:

1. Plain-language anchor choice at creation. Do not show the words "fixed" or "anchor". Show:
   - "On a set schedule" with example "every Monday, the 1st of the month"
   - "A set time after I finish" with example "4 weeks after each haircut"

2. A live three-occurrence preview under the recurrence editor:
   > Next 3: Mon 23 Jun, Mon 30 Jun, Mon 7 Jul

Generate it with `previewOccurrences(rule, seedDate, 3)`. If a user ever sees the preview disagree with their intent, they fix the rule before it ever misbehaves. This single component is why your recurring tasks will feel trustworthy when other apps do not.

### Edge cases to cover in tests

| Case | Expected |
|------|----------|
| Daily, completed same day | Next = tomorrow |
| Yearly Dec 10, completed Mar (3 months late), fixed | Next = Dec 10 same year, not next year |
| Monthly on 31st, fixed | Falls to 28/29/30 in short months, returns to 31 when available |
| Every 4 weeks, completion-anchored, done late | Next = completion + 4 weeks |
| Weekly Mon/Wed/Fri, completed Tue | Next = next Wed |
| afterCount = 5, completing the 5th | Series ends, no reschedule |
| onDate end passed | Series ends |

---

## 2. Calm overdue and reminder behaviour

This section is market positioning aimed at the anti-shame segment. Keep it only if a calm relationship with overdue tasks matches your own preference. The research basis: for the ADHD segment, red overdue badges and broken streaks actively trigger avoidance, and a single timed notification rarely lands when the person can act, then gets filtered out through habituation.

### Display rules

- No red. No "OVERDUE" labels. No exclamation badges. Overdue is communicated through quiet aging, not alarm.
- Show age as neutral signal: muted text reading "scheduled 2 days ago". Let the passage of time inform the user the way a notebook does, without shouting.
- One collapsible "Earlier" group for anything past its date, sitting above Today. Tasks roll into it quietly rather than accumulating in an angry historical list.
- No streaks, no streak-break penalties. If you want a reward primitive, reuse your existing Web Animations confetti, but fire it on comebacks (completing something that has been sitting a while) rather than on unbroken runs. Reward returning, not perfection.

```ts
type Bucket = 'earlier' | 'today' | 'upcoming' | 'someday';

function bucketFor(task: Task, today = new Date()): Bucket {
  if (!task.scheduledFor) return 'someday';
  const d = startOfDay(new Date(task.scheduledFor)).getTime();
  const t = startOfDay(today).getTime();
  if (d < t) return 'earlier';
  if (d === t) return 'today';
  return 'upcoming';
}

function ageInDays(task: Task, today = new Date()): number {
  if (!task.scheduledFor) return 0;
  return Math.round((startOfDay(today).getTime() - startOfDay(new Date(task.scheduledFor)).getTime()) / DAY_MS);
}
```

All of this is derived state. No storage changes needed.

### Reminder delivery: the honest constraint

Reliable background notifications do not exist in a pure client-side web app. Specifically:

- The `Notification` API only fires while a tab is open, unless backed by a service worker push, which needs a server and a push subscription.
- The experimental Notification Triggers API (scheduled local notifications without a server) is Chromium-only and not dependable cross-browser.
- iOS Safari gives installed PWAs web push only in recent versions, and scheduling is unreliable. Treat iOS background reminders as effectively unavailable.

Do not pretend otherwise. Two pragmatic routes:

1. In-app reminders only. When Essence is open, surface due and nearly-due tasks prominently. Honest about its limits, zero infrastructure.
2. Hand off to the OS calendar via ICS export (next section). The calendar app does the reminding, reliably, on every platform, with zero push infrastructure on your side. For a personal app this is the better answer and it reuses the export work.

If you later want true push, that is the point at which a backend becomes justified, not before.

---

## 3. Data ownership and export (Base44 reality)

> Superseded note: the original version of this section assumed a local-first app and recommended IndexedDB plus deferred sync. The repo is already Base44-backed with react-query, so that advice does not apply. This is the corrected version. See `integration-notes.md` for specifics.

### Storage is already handled

The app persists through Base44 (`@base44/sdk`) with react-query caching and optimistic updates. Sync across devices is the existing architecture, not a future decision, so there is no local-first layer to build and no Supabase conflict model to design. The "building on rented land" argument that drives people to self-hosted tools applies far less to your own personal app on a backend you control.

What remains worth doing is export, below, as a portability and backup convenience, not as a substitute for the backend.

### Export (about 60 lines, no backend)

Offer three formats:

- JSON: full fidelity, round-trippable. This is your real backup and import format.
- ICS: feeds tasks into any OS calendar, which doubles as your reliable reminder mechanism.
- Markdown: human-readable, for pasting anywhere.

```ts
function exportJSON(tasks: Task[]): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), tasks }, null, 2);
}

function exportMarkdown(tasks: Task[]): string {
  return tasks
    .map(t => `- [${t.completedAt ? 'x' : ' '}] ${t.title}${t.scheduledFor ? ` (${t.scheduledFor.slice(0, 10)})` : ''}`)
    .join('\n');
}

function exportICS(tasks: Task[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Essence//EN'];
  for (const t of tasks) {
    if (!t.scheduledFor) continue;
    const date = t.scheduledFor.slice(0, 10).replace(/-/g, '');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${t.id}@essence`);
    lines.push(`DTSTART;VALUE=DATE:${date}`);
    lines.push(`SUMMARY:${t.title.replace(/[,;\\]/g, m => '\\' + m)}`);
    // Only fixed recurrences map cleanly to RRULE. Completion-anchored ones
    // have no calendar equivalent by definition, so export just the next date.
    const rrule = toRRULE(t.recurrence);
    if (rrule) lines.push(rrule);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function toRRULE(rule: RecurrenceRule | null): string | null {
  if (!rule || rule.anchor !== 'fixed') return null; // completion-anchored cannot be an RRULE
  const freq = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY', year: 'YEARLY' }[rule.unit];
  const parts = [`FREQ=${freq}`, `INTERVAL=${rule.interval}`];
  if (rule.unit === 'week' && rule.weekdays?.length) {
    const map = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    parts.push(`BYDAY=${rule.weekdays.map(d => map[d]).join(',')}`);
  }
  if (rule.end.type === 'afterCount' && rule.end.count) parts.push(`COUNT=${rule.end.count}`);
  if (rule.end.type === 'onDate' && rule.end.date) parts.push(`UNTIL=${rule.end.date.slice(0, 10).replace(/-/g, '')}`);
  return `RRULE:${parts.join(';')}`;
}

function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

Note the deliberate honesty in `toRRULE`: completion-anchored recurrences have no calendar representation, so they export as a single dated event. That is correct, not a limitation to paper over.

Import is the inverse of `exportJSON`: parse, validate `version`, replace or merge by `id`.

### Sync already exists: the real risk is the migration

There is no sync to build. Base44 already does it. The relevant Nidus lesson is not about sync correctness in the abstract, it is specific and present: when you add the `recurrence` and `occurrence_count` fields, confirm they actually persist to Base44 before building on them. On Nidus, new fields silently failed to sync while local optimistic state looked correct. After the entity migration, create a task with those fields and read it back through the SDK to verify the round trip. This check is the single most important safety step in the whole feature. See `integration-notes.md`, Step 1.

---

## What this gives you

Built in order, you get: recurring tasks that behave the way users expect and competitors do not, an optional calm overdue surface, reminders via calendar export without push infrastructure, and optional data export on top of the Base44 backend you already have. The highest-risk step is not sync, which already exists, but the Base44 entity migration for the two new fields, which must be verified to persist before anything is built on it.

One caveat carried from the research: a large share of to-do app abandonment is driven by life changes, not product flaws. Build expecting that retention will not look like a habit app, and you will make saner design calls than if you chase daily-active-use stickiness.
