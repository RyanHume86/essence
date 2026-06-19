import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const CONNECTOR_ID = "6a352aeee5ea6ecec4029b4f";
const CAL_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Google treats an all-day event's end.date as exclusive, so a single-day event
// must end on the following day.
function nextDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Syncs the current app user's task due dates to their Google Calendar as
// all-day events. Idempotent: each task stores its calendar event id, so
// re-running updates existing events instead of creating duplicates.
// Completed tasks or tasks with no due date have their event removed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    const tasks = await base44.asServiceRole.entities.Task.filter({ created_by_id: user.id });

    let created = 0;
    let updated = 0;
    let removed = 0;

    for (const task of tasks) {
      const shouldHaveEvent = !!task.due_date && !task.completed;

      if (shouldHaveEvent) {
        const eventBody = {
          summary: task.title,
          description: task.comment || "Task from Essence",
          start: { date: task.due_date },
          end: { date: nextDay(task.due_date) },
        };

        if (task.gcal_event_id) {
          const res = await fetch(`${CAL_URL}/${task.gcal_event_id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(eventBody),
          });
          if (res.ok) {
            updated++;
          } else if (res.status === 404 || res.status === 410) {
            // Event was deleted in the calendar — recreate it.
            const createRes = await fetch(CAL_URL, { method: "POST", headers, body: JSON.stringify(eventBody) });
            if (createRes.ok) {
              const ev = await createRes.json();
              await base44.asServiceRole.entities.Task.update(task.id, { gcal_event_id: ev.id });
              created++;
            }
          }
        } else {
          const res = await fetch(CAL_URL, { method: "POST", headers, body: JSON.stringify(eventBody) });
          if (res.ok) {
            const ev = await res.json();
            await base44.asServiceRole.entities.Task.update(task.id, { gcal_event_id: ev.id });
            created++;
          }
        }
      } else if (task.gcal_event_id) {
        // Task no longer belongs on the calendar — remove its event.
        const res = await fetch(`${CAL_URL}/${task.gcal_event_id}`, { method: "DELETE", headers });
        if (res.ok || res.status === 404 || res.status === 410) {
          await base44.asServiceRole.entities.Task.update(task.id, { gcal_event_id: null });
          removed++;
        }
      }
    }

    return Response.json({ success: true, created, updated, removed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});