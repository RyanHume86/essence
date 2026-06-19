import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const CONNECTOR_ID = "6a352aeee5ea6ecec4029b4f";
const CAL_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Removes a single Google Calendar event for the current user. Called when a
// task is deleted in the app, so its event does not linger (the sync loop only
// sees tasks that still exist and cannot clean these up). The user's connector
// token only grants access to their own calendar, so passing an event id is safe.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await req.json().catch(() => ({}));
    if (!eventId) {
      return Response.json({ success: true, skipped: true });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const res = await fetch(`${CAL_URL}/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 404/410 mean the event is already gone, which is the desired end state.
    if (res.ok || res.status === 404 || res.status === 410) {
      return Response.json({ success: true });
    }
    return Response.json({ error: `Calendar delete failed (${res.status})` }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
