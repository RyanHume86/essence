import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ListChecks, RefreshCw } from "lucide-react";
import { parseISO, isToday, isTomorrow, isPast, format } from "date-fns";
import TaskInput from "../components/tasks/TaskInput";
import TaskItem from "../components/tasks/TaskItem";
import TaskStats from "../components/tasks/TaskStats";

// ─── Pull-to-Refresh hook ────────────────────────────────────────────────────
const PULL_THRESHOLD = 72; // px needed to trigger a refresh

function usePullToRefresh(onRefresh) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    // Only activate when already at the top of the scroll container
    if (window.scrollY === 0) startYRef.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startYRef.current === null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) setPullY(Math.min(delta * 0.45, PULL_THRESHOLD + 20));
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    startYRef.current = null;
  }, [pullY, refreshing, onRefresh]);

  return { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-created_date"),
  });

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh(handleRefresh);

  // Optimistic create
  const createMutation = useMutation({
    mutationFn: ({ title, category, due_date }) => base44.entities.Task.create({ title, completed: false, category, due_date }),
    onMutate: async ({ title, category, due_date }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData(["tasks"]);
      const optimistic = { id: `optimistic-${Date.now()}`, title, completed: false, category, due_date, created_date: new Date().toISOString() };
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

  // ── Group active tasks by due date ──────────────────────────────────────
  const groupLabel = (due_date) => {
    if (!due_date) return "No Due Date";
    const d = parseISO(due_date);
    if (isPast(d) && !isToday(d)) return "Overdue";
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "EEE, d MMM"); // e.g. "Wed, 18 Jun"
  };

  const GROUP_ORDER = ["Overdue", "Today", "Tomorrow"];

  const activeGroups = activeTasks.reduce((acc, task) => {
    const label = groupLabel(task.due_date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(task);
    return acc;
  }, {});

  // Sort group keys: Overdue → Today → Tomorrow → future dates → No Due Date
  const sortedGroupKeys = Object.keys(activeGroups).sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a);
    const ib = GROUP_ORDER.indexOf(b);
    if (a === "No Due Date") return 1;
    if (b === "No Due Date") return -1;
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    // Both are date strings — sort chronologically
    return new Date(a) - new Date(b);
  });
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex items-start justify-center px-4 py-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-30 flex items-end justify-center pointer-events-none"
        style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }}
        animate={{ height: pullY > 0 || refreshing ? pullY || 48 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={`mb-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-md transition-opacity duration-200 ${pullY > 0 || refreshing ? "opacity-100" : "opacity-0"}`}>
          <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${(pullY / PULL_THRESHOLD) * 180}deg)` }} />
        </div>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        {/* Page title */}
        <div className="text-center space-y-1 pt-2">
          <p className="text-muted-foreground text-sm">
            Stay organized, one task at a time.
          </p>
        </div>

        {/* Input */}
        <TaskInput onAdd={(title, category, due_date) => createMutation.mutate({ title, category, due_date })} />

        {/* Stats */}
        <TaskStats tasks={tasks} />

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Active tasks — grouped by due date */}
        {!isLoading && sortedGroupKeys.map((groupKey) => (
          <div key={groupKey} className="space-y-3">
            {/* Group header */}
            <div className="flex items-center gap-3 px-1">
              <span className={`text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${
                groupKey === "Overdue"
                  ? "text-red-400"
                  : groupKey === "Today"
                  ? "text-amber-400"
                  : groupKey === "Tomorrow"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}>
                {groupKey}
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground/60">{activeGroups[groupKey].length}</span>
            </div>
            <AnimatePresence mode="popLayout">
              {activeGroups[groupKey].map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(t) => updateMutation.mutate(t)}
                  onDelete={(t) => deleteMutation.mutate(t)}
                />
              ))}
            </AnimatePresence>
          </div>
        ))}

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