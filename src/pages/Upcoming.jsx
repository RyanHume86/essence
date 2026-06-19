import React from "react";
import { parseISO, isTomorrow, format } from "date-fns";
import TaskGroup from "../components/tasks/TaskGroup";
import PullToRefresh from "../components/PullToRefresh";
import { useTasks } from "@/hooks/useTasks";
import { inUpcoming } from "@/lib/taskUtils";

function groupLabel(task) {
  if (!task.due_date) return "No Due Date";
  const d = parseISO(task.due_date);
  return isTomorrow(d) ? "Tomorrow" : format(d, "EEE, d MMM");
}

export default function Upcoming() {
  const { tasks, isLoading, refetch, actions } = useTasks();

  // Sort by due date (dateless last), then group preserving chronological order.
  const sorted = [...tasks].filter(inUpcoming).sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });

  const groups = {};
  for (const t of sorted) {
    const label = groupLabel(t);
    (groups[label] ||= []).push(t);
  }
  const keys = Object.keys(groups);

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="pt-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Upcoming</h1>
        <p className="text-sm text-muted-foreground mt-0.5">What is coming up, by date</p>
      </div>

      {isLoading && <p className="text-center text-muted-foreground text-sm py-12">Loading…</p>}

      {!isLoading && keys.map((label) => (
        <TaskGroup
          key={label}
          label={label}
          labelClass={label === "Tomorrow" ? "text-highlight" : label === "No Due Date" ? "text-muted-foreground" : "text-foreground/70"}
          tasks={groups[label]}
          actions={actions}
        />
      ))}

      {!isLoading && keys.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">
          Nothing upcoming. You are all caught up.
        </p>
      )}
    </PullToRefresh>
  );
}
