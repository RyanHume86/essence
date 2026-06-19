import React from "react";
import { format } from "date-fns";
import TaskInput from "../components/tasks/TaskInput";
import TaskGroup from "../components/tasks/TaskGroup";
import ProgressRing from "../components/tasks/ProgressRing";
import PullToRefresh from "../components/PullToRefresh";
import { useTasks } from "@/hooks/useTasks";
import { inToday, isOverdue, isDueToday } from "@/lib/taskUtils";

function greetingForHour(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="surface-raised rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="skeleton w-6 h-6 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/5 rounded" />
            <div className="skeleton h-3 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Today() {
  const { tasks, isLoading, refetch, actions } = useTasks();

  const todayActive = tasks.filter(inToday);
  const overdue = todayActive.filter(isOverdue);
  const dueNow = todayActive.filter((t) => !isOverdue(t)); // due today or flagged
  const doneToday = tasks.filter((t) => t.completed && (isDueToday(t) || t.today));

  return (
    <PullToRefresh onRefresh={refetch}>
      {/* Focal header: greeting, date, and a Today-scoped progress ring */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">
            {greetingForHour(new Date().getHours())}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, d MMMM")}
          </p>
        </div>
        <ProgressRing completed={doneToday.length} total={todayActive.length + doneToday.length} />
      </div>

      {/* Capture: the single create path */}
      <TaskInput onAdd={(title, category, due_date, comment, today) => actions.create({ title, category, due_date, comment, today })} />

      {isLoading && <LoadingRows />}

      {!isLoading && (
        <>
          <TaskGroup label="Overdue" labelClass="text-destructive" tasks={overdue} actions={actions} />
          <TaskGroup label="Today" labelClass="text-highlight" tasks={dueNow} actions={actions} />

          {doneToday.length > 0 && (
            <TaskGroup label="Completed" labelClass="text-muted-foreground" tasks={doneToday} actions={actions} />
          )}

          {todayActive.length === 0 && doneToday.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-12">
              Nothing for today. Capture something above, or check Upcoming.
            </p>
          )}
        </>
      )}
    </PullToRefresh>
  );
}
