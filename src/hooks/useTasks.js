import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays } from "date-fns";

const KEY = ["tasks"];
const tomorrowISO = () => format(addDays(new Date(), 1), "yyyy-MM-dd");

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
      onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });

  const buildNew = (v) => ({
    title: v.title,
    completed: false,
    category: v.category,
    due_date: v.due_date ?? null,
    comment: v.comment ?? null,
    today: !!v.today,
    priority: v.priority || "normal",
    subtasks: [],
  });

  const createM = useOptimisticMutation(
    (v) => base44.entities.Task.create(buildNew(v)),
    (old, v) => [{ id: crypto.randomUUID(), created_date: new Date().toISOString(), ...buildNew(v) }, ...old],
    "Could not add task"
  );

  const toggleM = useOptimisticMutation(
    (task) => base44.entities.Task.update(task.id, { completed: !task.completed }),
    (old, task) => old.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)),
    "Could not update task"
  );

  const patchM = useOptimisticMutation(
    ({ task, patch }) => base44.entities.Task.update(task.id, patch),
    (old, { task, patch }) => old.map((t) => (t.id === task.id ? { ...t, ...patch } : t)),
    "Could not save changes"
  );

  const deleteM = useOptimisticMutation(
    (task) => base44.entities.Task.delete(task.id),
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
