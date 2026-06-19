import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const CONNECTOR_ID = "6a352aeee5ea6ecec4029b4f";
const CAL_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await base44.asServiceRole.entities.Task.filter({ created_by_id: user.id });

    // 1. Best-effort: remove any synced calendar events so they do not orphan.
    //    Skipped entirely if the user has no calendar connection.
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
      for (const task of tasks) {
        if (!task.gcal_event_id) continue;
        await fetch(`${CAL_URL}/${task.gcal_event_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {});
      }
    } catch {
      // No calendar connection (or it failed) — proceed with account deletion.
    }

    // 2. Delete all tasks owned by this user (service-role to bypass RLS).
    for (const task of tasks) {
      await base44.asServiceRole.entities.Task.delete(task.id);
    }

    // 3. Delete the user account.
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
