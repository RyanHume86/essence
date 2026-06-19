import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, Trash2 } from "lucide-react";
import TaskItem from "../components/tasks/TaskItem";
import PullToRefresh from "../components/PullToRefresh";
import EmptyState from "../components/EmptyState";
import { useTasks } from "@/hooks/useTasks";
import { useSearch } from "@/lib/SearchContext";
import { matchesQuery } from "@/lib/taskUtils";

export default function Completed() {
  const { tasks, isLoading, refetch, actions } = useTasks();
  const { query } = useSearch();
  const q = query.trim().toLowerCase();
  const [confirming, setConfirming] = useState(false);

  const completed = tasks
    .filter((t) => t.completed && matchesQuery(t, q))
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Completed</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reopen or clear finished tasks</p>
        </div>
        {completed.length > 0 && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors select-none"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Inline confirm for the destructive bulk clear */}
      {confirming && (
        <div className="surface-raised rounded-2xl p-4 space-y-3">
          <p className="text-sm text-foreground">
            Delete {completed.length} completed {completed.length === 1 ? "task" : "tasks"} permanently?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { actions.clearCompleted(); setConfirming(false); }}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm select-none"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-muted transition-colors select-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-center text-muted-foreground text-sm py-12">Loading…</p>}

      {!isLoading && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {completed.map((task, i) => (
              <TaskItem
                key={task.id}
                task={task}
                index={i}
                onToggle={actions.toggle}
                onDelete={actions.remove}
                onUpdate={actions.patch}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && completed.length === 0 && (
        <EmptyState icon={CheckCircle2} title={q ? "No matches" : "Nothing completed yet"} subtitle={q ? `No completed tasks match "${query}".` : "Finished tasks will appear here."} />
      )}
    </PullToRefresh>
  );
}
