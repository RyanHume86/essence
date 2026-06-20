import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const CONNECTOR_ID = "6a352aeee5ea6ecec4029b4f";
const CAL_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const TIMED_DURATION_MIN = 30; // default block length for a task with a time

// Google treats an all-day event's end.date as exclusive, so a single-day event
// must end on the following day.
function nextDay(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Add minutes to a wall-clock date+time, returning "YYYY-MM-DDTHH:MM:SS".
function addMinutes(date, time, mins) {
  const d = new Date(`${date}T${time}:00Z`);
  d.setUTCMinutes(d.getUTCMinutes() + mins);
  return d.toISOString().slice(0, 19);
}

// Build the event body: a timed event when the task has a due_time (using the
// caller's IANA timeZone), otherwise an all-day event.
function buildEventBody(task, timeZone) {
  const base = { summary: task.title, description: task.comment || "Task from Akha" };
  if (task.due_time) {
    const date = task.due_date;
    const time = task.due_time;
    return {
      ...base,
      start: { dateTime: `${date}T${time}:00`, timeZone },
      end: { dateTime: addMinutes(date, time, TIMED_DURATION_MIN), timeZone },
    };
  }
  return {
    ...base,
    start: { date: task.due_date },
    end: { date: nextDay(task.due_date) },
  };
}

// Syncs the current app user's tasks to their Google Calendar. Tasks with a time
// become timed events, otherwise all-day. Idempotent via the stored event id;
// completed or date-cleared tasks have their event removed. Failures are counted
// and returned so the caller can report them.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { timeZone } = await req.json().catch(() => ({}));
    const tz = timeZone || "UTC";

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    const tasks = await base44.asServiceRole.entities.Task.filter({ created_by_id: user.id });

    let created = 0;
    let updated = 0;
    let removed = 0;
    let failed = 0;

    for (const task of tasks) {
      const shouldHaveEvent = !!task.due_date && !task.completed;

      if (shouldHaveEvent) {
        const eventBody = buildEventBody(task, tz);

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
            } else {
              failed++;
            }
          } else {
            failed++;
          }
        } else {
          const res = await fetch(CAL_URL, { method: "POST", headers, body: JSON.stringify(eventBody) });
          if (res.ok) {
            const ev = await res.json();
            await base44.asServiceRole.entities.Task.update(task.id, { gcal_event_id: ev.id });
            created++;
          } else {
            failed++;
          }
        }
      } else if (task.gcal_event_id) {
        // Task no longer belongs on the calendar — remove its event.
        const res = await fetch(`${CAL_URL}/${task.gcal_event_id}`, { method: "DELETE", headers });
        if (res.ok || res.status === 404 || res.status === 410) {
          await base44.asServiceRole.entities.Task.update(task.id, { gcal_event_id: null });
          removed++;
        } else {
          failed++;
        }
      }
    }

    return Response.json({ success: true, created, updated, removed, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});