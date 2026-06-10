import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { ListChecks } from "lucide-react";
import TaskInput from "../components/tasks/TaskInput";
import TaskItem from "../components/tasks/TaskItem";
import TaskStats from "../components/tasks/TaskStats";

export default function Home() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  // Optimistic create
  const createMutation = useMutation({
    mutationFn: (title) => base44.entities.Task.create({ title, completed: false }),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData(["tasks"]);
      const optimistic = { id: `optimistic-${Date.now()}`, title, completed: false, created_date: new Date().toISOString() };
      queryClient.setQueryData(["tasks"], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Optimistic toggle
  const updateMutation = useMutation({
    mutationFn: (task) => base44.entities.Task.update(task.id, { completed: !task.completed }),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old = []) =>
        old.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Optimistic delete
  const deleteMutation = useMutation({
    mutationFn: (task) => base44.entities.Task.delete(task.id),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old = []) => old.filter((t) => t.id !== task.id));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Page title */}
        <div className="text-center space-y-1 pt-2">
          <p className="text-muted-foreground text-sm">
            Stay organized, one task at a time.
          </p>
        </div>

        {/* Input */}
        <TaskInput onAdd={(title) => createMutation.mutate(title)} />

        {/* Stats */}
        <TaskStats tasks={tasks} />

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Active tasks */}
        {!isLoading && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(t) => updateMutation.mutate(t)}
                  onDelete={(t) => deleteMutation.mutate(t)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Completed section */}
        {!isLoading && completedTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-2">
              Completed
            </p>
            <AnimatePresence mode="popLayout">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(t) => updateMutation.mutate(t)}
                  onDelete={(t) => deleteMutation.mutate(t)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && tasks.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <ListChecks className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm">
              No tasks yet. Add one above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}