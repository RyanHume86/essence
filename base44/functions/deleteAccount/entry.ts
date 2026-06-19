import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete all tasks owned by this user (service-role to bypass RLS).
    const tasks = await base44.asServiceRole.entities.Task.filter({ created_by_id: user.id });
    for (const task of tasks) {
      await base44.asServiceRole.entities.Task.delete(task.id);
    }

    // 2. Delete the user account.
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});