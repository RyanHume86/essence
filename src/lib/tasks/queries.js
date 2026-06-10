// The view queries (section 9), run against local SQLite via PowerSync's
// reactive useQuery hook. Each constant is a complete SQL statement; pass it to
// useQuery so the view re-renders whenever the underlying rows change.

// By context — for batching work in fragmented time.
export const BY_CONTEXT = `
  select * from tasks
  where status = 'active'
  order by
    case context
      when 'at_hospital' then 0
      when 'at_desk'     then 1
      when 'errand'      then 2
      when 'low_energy'  then 3
      else 4
    end,
    coalesce(sort_order, 1e9),
    created_at`;

// By stream — so no single stream drowns the rest.
export const BY_STREAM = `
  select * from tasks
  where status = 'active'
  order by stream, due_date nulls last, created_at`;

// Today / this week — time-bound clinical and academic commitments,
// everything due through the end of the current week.
export const THIS_WEEK = `
  select * from tasks
  where status = 'active'
    and due_date is not null
    and due_date <= date('now', 'weekday 0')
  order by due_date, created_at`;

// Inbox — the triage queue.
export const INBOX = `select * from tasks where status = 'inbox' order by created_at`;

// Active projects, for the triage / grouping UI.
export const ACTIVE_PROJECTS = `select * from projects where archived = 0 order by stream, name`;

// Done / dropped, most recently touched first (history & signal).
export const ARCHIVE = `
  select * from tasks
  where status in ('done','dropped')
  order by updated_at desc
  limit 200`;
