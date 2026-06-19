import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays } from "date-fns";
import { buildNextRecurringTask } from "@/lib/recurrence";

const KEY = ["tasks"];
const tomorrowISO = () => format(addDays(new Date(), 1), "yyyy-MM-dd");

// Auto-sync: after task changes settle, push to Google Calendar so it does not
// drift. Debounced so a burst of edits triggers a single reconcile, and gated on
// a connection flag (written by CalendarSync) so unconnected users incur no
// calls. Best-effort and silent; the manual "Sync now" still reports results.
export const CALENDAR_CONNECTED_KEY = "essence_calendar_connected";
let autoSyncTimer = null;
function scheduleAutoSync() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(CALENDAR_CONNECTED_KEY) !== "true") return;
  clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    base44.functions.invoke("syncTasksToCalendar", { timeZone }).catch(() => {});
  }, 2500);
}

// Shared task data plus optimistic mutations, so every view (Today, Upcoming,
// Browse) reads and writes the same cache. Returns the task list and an
// `actions` object with the handlers each view passes down to TaskItem.
export function useTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: KEY,
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  // Optimistic mutation factory: apply `apply` to the cached list, run `fn`, and
  // roll back with a toast on failure. Called unconditionally below so the hook
  // order stays stable.
  const useOptimisticMutation = (fn, apply, errorTitle) =>
    useMutation({
      mutationFn: fn,
      onMutate: async (vars) => {
        await queryClient.cancelQueries({ queryKey: KEY });
        const previous = queryClient.getQueryData(KEY);
        queryClient.setQueryData(KEY, (old = []) => apply(old, vars));
        return { previous };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) queryClient.setQueryData(KEY, ctx.previous);
        toast({ variant: "destructive", title: errorTitle, description: "Please try again." });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: KEY });
        scheduleAutoSync();
      },
    });

  const buildNew = (v) => ({
    title: v.title,
    completed: false,
    category: v.category,
    due_date: v.due_date ?? null,
    due_time: v.due_date ? (v.due_time ?? null) : null,
    comment: v.comment ?? null,
    today: !!v.today,
    priority: v.priority || "normal",
    recurrence: v.recurrence || "none",
    subtasks: [],
  });

  const createM = useOptimisticMutation(
    (v) => base44.entities.Task.create(buildNew(v)),
    (old, v) => [{ id: crypto.randomUUID(), created_date: new Date().toISOString(), ...buildNew(v) }, ...old],
    "Could not add task"
  );

  // Toggle is recurrence-aware: completing a recurring task also spawns its next
  // instance. Written out (not via the factory) because of that extra write.
  const toggleM = useMutation({
    mutationFn: async (task) => {
      const completing = !task.completed;
      await base44.entities.Task.update(task.id, { completed: completing });
      if (completing) {
        const next = buildNextRecurringTask(task);
        if (next) await base44.entities.Task.create(next);
      }
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData(KEY);
      const completing = !task.completed;
      queryClient.setQueryData(KEY, (old = []) => {
        let list = old.map((t) => (t.id === task.id ? { ...t, completed: completing } : t));
        if (completing) {
          const next = buildNextRecurringTask(task);
          if (next) list = [{ id: crypto.randomUUID(), created_date: new Date().toISOString(), ...next }, ...list];
        }
        return list;
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(KEY, ctx.previous);
      toast({ variant: "destructive", title: "Could not update task", description: "Please try again." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      scheduleAutoSync();
    },
  });

  const patchM = useOptimisticMutation(
    ({ task, patch }) => base44.entities.Task.update(task.id, patch),
    (old, { task, patch }) => old.map((t) => (t.id === task.id ? { ...t, ...patch } : t)),
    "Could not save changes"
  );

  const deleteM = useOptimisticMutation(
    async (task) => {
      await base44.entities.Task.delete(task.id);
      // Best-effort: remove the linked calendar event so it does not orphan.
      // A failure here must not roll back the (already done) task deletion.
      if (task.gcal_event_id) {
        try {
          await base44.functions.invoke("deleteCalendarEvent", { eventId: task.gcal_event_id });
        } catch {
          /* calendar cleanup is best-effort */
        }
      }
    },
    (old, task) => old.filter((t) => t.id !== task.id),
    "Could not delete task"
  );

  const deferM = useOptimisticMutation(
    (task) => base44.entities.Task.update(task.id, { due_date: tomorrowISO(), today: false }),
    (old, task) => old.map((t) => (t.id === task.id ? { ...t, due_date: tomorrowISO(), today: false } : t)),
    "Could not defer task"
  );

  const todayM = useOptimisticMutation(
    (task) => base44.entities.Task.update(task.id, { today: !task.today }),
    (old, task) => old.map((t) => (t.id === task.id ? { ...t, today: !t.today } : t)),
    "Could not update task"
  );

  const clearCompletedM = useOptimisticMutation(
    async () => {
      const done = (queryClient.getQueryData(KEY) || []).filter((t) => t.completed);
      await Promise.all(done.map((t) => base44.entities.Task.delete(t.id)));
    },
    (old) => old.filter((t) => !t.completed),
    "Could not clear completed tasks"
  );

  const actions = {
    create: (vars) => createM.mutate(vars),
    toggle: (task) => toggleM.mutate(task),
    patch: (task, patch) => patchM.mutate({ task, patch }),
    remove: (task) => deleteM.mutate(task),
    defer: (task) => deferM.mutate(task),
    toggleToday: (task) => todayM.mutate(task),
    clearCompleted: () => clearCompletedM.mutate(),
  };

  return { tasks, isLoading, refetch, actions };
}
