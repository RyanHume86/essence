**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

---

# Personal Task Layer (v1)

A local-first, offline-capable personal task app for a multi-stream workload
(clinical, locum, academic, dev, content, health, life-admin). Built on
**Supabase** (Postgres, Auth, RLS) with **PowerSync** for Postgres ⇄ on-device
SQLite sync. It shares the same Supabase auth as the existing Base44 stack
(NeuroRound, Nidus Recall), so the same login works across apps.

Open it at **`/tasks`** (linked from the home screen).

## What it does

- **Instant offline capture** to an inbox — single text field, no fields
  required at capture time.
- **Triage** inbox items into a *stream* and *context* (plus optional project,
  due date, recurrence).
- **Three working views**: by context, by stream, and a today/this-week
  deadline view (plus the inbox and an archive of done/dropped tasks).
- **Simple recurrence**: `daily`, `weekdays`, `weekly` only. On completion a
  recurring task spawns its next instance with the due date advanced.
- **Optional lightweight projects** within a stream.
- **Full offline reads and writes**, syncing when connectivity returns
  (last-write-wins, handled in the upload handler).

Out of scope for v1 (intentionally not built): subtasks/dependencies,
collaboration/sharing, AI breakdown, analytics, gamification, and complex
recurrence (RRULE).

## Architecture

| Layer    | Tech |
|----------|------|
| Backend  | Supabase (Postgres, Auth, RLS) — reuse the existing project |
| Sync     | PowerSync (Postgres → on-device SQLite); app reads/writes local SQLite |
| Frontend | React (this app) |
| Conflicts| Last-write-wins, in the PowerSync upload handler (not app logic) |

Key files:

- `supabase/migrations/0001_task_layer.sql` — schema, indexes, `updated_at`
  trigger, and RLS policies.
- `powersync/sync-rules.yaml` — one bucket per user (`user_data`).
- `src/lib/powersync/AppSchema.js` — local SQLite schema.
- `src/lib/powersync/SupabaseConnector.js` — `fetchCredentials` + `uploadData`.
- `src/lib/recurrence.js` — the single piece of domain logic (well-tested).
- `src/lib/tasks/` — write operations, view queries, constants.
- `src/pages/TaskLayer.jsx` + `src/components/tasklayer/*` — the UI.

## Setup

1. **Supabase**: run `supabase/migrations/0001_task_layer.sql` against your
   project (schema, RLS, triggers). Ensure **logical replication is enabled**
   for PowerSync (Supabase: Database → Replication / `wal_level = logical`).
2. **PowerSync**: create an instance pointed at the Supabase database, and load
   `powersync/sync-rules.yaml` as the sync rules.
3. **Env** — add to `.env.local`:

   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   VITE_POWERSYNC_URL=https://<instance>.powersync.journeyapps.com
   ```

4. Run the app: `npm run dev`, then open `/tasks`.

## Tests

The recurrence logic is the only real domain logic and is covered by the
Node built-in test runner (no extra deps):

```
node --test src/lib/recurrence.test.js
```

## ⚠️ Operational note: PowerSync + Supabase WAL / disk

PowerSync relies on Supabase **logical replication**. There is a known issue
where **idle Supabase instances accumulate WAL** (write-ahead log) because the
replication slot isn't being consumed, which can **max out disk**. Monitor disk
usage and keep the replication slot healthy (an inactive/lagging slot prevents
Postgres from reclaiming WAL). If the PowerSync service is down or disconnected
for a long time, watch `pg_replication_slots` and disk usage.
