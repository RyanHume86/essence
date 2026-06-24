import React from "react";
import { format } from "date-fns";
import { PartyPopper, Coffee, Search } from "lucide-react";
import TaskInput from "../components/tasks/TaskInput";
import TaskGroup from "../components/tasks/TaskGroup";
import ProgressRing from "../components/tasks/ProgressRing";
import Companion from "../components/companion/Companion";
import PullToRefresh from "../components/PullToRefresh";
import EmptyState from "../components/EmptyState";
import { useTasks } from "@/hooks/useTasks";
import { useSearch } from "@/lib/SearchContext";
import { inToday, isOverdue, isDueToday, matchesQuery } from "@/lib/taskUtils";

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
  const { query } = useSearch();
  const q = query.trim().toLowerCase();

  // Full Today set (drives the ring) and the search-filtered view (drives lists).
  const todayActiveAll = tasks.filter(inToday);
  const doneTodayAll = tasks.filter((t) => t.completed && (isDueToday(t) || t.today));

  const overdue = todayActiveAll.filter((t) => isOverdue(t) && matchesQuery(t, q));
  const dueNow = todayActiveAll.filter((t) => !isOverdue(t) && matchesQuery(t, q));
  const doneToday = doneTodayAll.filter((t) => matchesQuery(t, q));

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
        <ProgressRing completed={doneTodayAll.length} total={todayActiveAll.length + doneTodayAll.length} />
      </div>

      {/* Win-moment companion: reacts as tasks are completed */}
      <Companion />

      {/* Capture: the single create path */}
      <TaskInput onAdd={(vals) => actions.create(vals)} />

      {isLoading && <LoadingRows />}

      {!isLoading && q && overdue.length === 0 && dueNow.length === 0 && doneToday.length === 0 && (
        <EmptyState icon={Search} title="No matches" subtitle={`Nothing for today matches "${query}".`} />
      )}

      {!isLoading && !(q && overdue.length === 0 && dueNow.length === 0 && doneToday.length === 0) && (
        <>
          <TaskGroup label="Overdue" labelClass="text-destructive" tasks={overdue} actions={actions} />
          <TaskGroup label="Today" labelClass="text-highlight" tasks={dueNow} actions={actions} />

          {doneToday.length > 0 && (
            <TaskGroup label="Completed" labelClass="text-muted-foreground" tasks={doneToday} actions={actions} />
          )}

          {!q && todayActiveAll.length === 0 && (
            doneTodayAll.length > 0 ? (
              <EmptyState icon={PartyPopper} title="All clear for today" subtitle="Every task for today is done. Nice work." />
            ) : (
              <EmptyState icon={Coffee} title="Nothing for today" subtitle="Capture something above, or check Upcoming." />
            )
          )}
        </>
      )}
    </PullToRefresh>
  );
}
