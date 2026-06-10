// Task write operations, executed against the local PowerSync SQLite database.
// Every write is instant and offline; PowerSync flushes it to Supabase when
// connectivity returns.
import { db } from '@/lib/powersync/db';
import { supabase } from '@/lib/supabaseClient';
import { buildNextRecurringTask, todayISO } from '@/lib/recurrence';

const nowISO = () => new Date().toISOString();
const newId = () => crypto.randomUUID();

async function currentUserId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

/**
 * Capture — the critical path. Instant, offline, no fields required.
 * Inserts { title, status: 'inbox' } and nothing else.
 */
export async function captureTask(title) {
  const trimmed = title.trim();
  if (!trimmed) return null;

  const id = newId();
  const user_id = await currentUserId();
  const created = nowISO();

  await db.execute(
    `INSERT INTO tasks (id, user_id, title, status, created_at, updated_at)
     VALUES (?, ?, ?, 'inbox', ?, ?)`,
    [id, user_id, trimmed, created, created],
  );
  return id;
}

/**
 * Triage — move an inbox item live and assign its facets. Stream is required to
 * go active; context / project / due date are optional.
 */
export async function triageTask(id, { stream, context = null, project_id = null, due_date = null }) {
  await db.execute(
    `UPDATE tasks
       SET status = 'active', stream = ?, context = ?, project_id = ?, due_date = ?, updated_at = ?
     WHERE id = ?`,
    [stream, context, project_id, due_date, nowISO(), id],
  );
}

/** Update an active task's facets without changing its status. */
export async function updateTask(id, { stream, context, project_id, due_date, recurrence }) {
  await db.execute(
    `UPDATE tasks
       SET stream = ?, context = ?, project_id = ?, due_date = ?, recurrence = ?, updated_at = ?
     WHERE id = ?`,
    [stream, context, project_id, due_date, recurrence, nowISO(), id],
  );
}

/**
 * Complete a task. If it recurs, spawn the next instance (active, completion
 * cleared, due date advanced). This is the only place recurrence is materialised.
 */
export async function completeTask(task) {
  const completedAt = nowISO();
  await db.execute(
    `UPDATE tasks SET status = 'done', completed_at = ?, updated_at = ? WHERE id = ?`,
    [completedAt, completedAt, task.id],
  );

  const next = buildNextRecurringTask(task, todayISO());
  if (next) {
    const id = newId();
    const user_id = task.user_id ?? (await currentUserId());
    const created = nowISO();
    await db.execute(
      `INSERT INTO tasks
        (id, user_id, title, stream, context, project_id, due_date, status, recurrence, sort_order, created_at, updated_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, NULL)`,
      [
        id,
        user_id,
        next.title,
        next.stream,
        next.context,
        next.project_id,
        next.due_date,
        next.recurrence,
        next.sort_order,
        created,
        created,
      ],
    );
    return id;
  }
  return null;
}

/** Drop — consciously abandon. Never deleted; kept as signal. */
export async function dropTask(id) {
  await db.execute(
    `UPDATE tasks SET status = 'dropped', updated_at = ? WHERE id = ?`,
    [nowISO(), id],
  );
}

/** Re-open a done/dropped task back to active. */
export async function reactivateTask(id) {
  await db.execute(
    `UPDATE tasks SET status = 'active', completed_at = NULL, updated_at = ? WHERE id = ?`,
    [nowISO(), id],
  );
}

// --- Projects (lightweight grouping within a stream) -----------------------

export async function createProject(name, stream) {
  const id = newId();
  const user_id = await currentUserId();
  await db.execute(
    `INSERT INTO projects (id, user_id, name, stream, archived, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [id, user_id, name.trim(), stream, nowISO()],
  );
  return id;
}

export async function archiveProject(id) {
  await db.execute(`UPDATE projects SET archived = 1 WHERE id = ?`, [id]);
}
