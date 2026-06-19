import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const CONNECTOR_ID = "6a352aeee5ea6ecec4029b4f";

// Lightweight connection check: succeeds only if the current app user has a
// live Google Calendar connection. Used by the frontend to detect status.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    return Response.json({ connected: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});