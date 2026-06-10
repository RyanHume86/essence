import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { ListChecks, Layers } from "lucide-react";
import TaskInput from "../components/tasks/TaskInput";
import TaskItem from "../components/tasks/TaskItem";
import TaskStats from "../components/tasks/TaskStats";

export default function Home() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (title) => base44.entities.Task.create({ title, completed: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (task) => base44.entities.Task.update(task.id, { completed: !task.completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (task) => base44.entities.Task.delete(task.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-12 md:py-20">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3">
            <ListChecks className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold text-foreground tracking-tight">
            To Do
          </h1>
          <p className="text-muted-foreground text-sm">
            Stay organized, one task at a time.
          </p>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline pt-1"
          >
            <Layers className="w-4 h-4" />
            Open Task Layer
          </Link>
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
          <div className="space-y-3 pt-4">
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