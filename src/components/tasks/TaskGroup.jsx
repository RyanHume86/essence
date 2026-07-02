import React from "react";
import { AnimatePresence } from "framer-motion";
import TaskItem from "./TaskItem";
import { byPriorityDesc } from "@/lib/priority";

// A labelled group of tasks with a count, used across the views. `actions` is
// the object returned by useTasks; the relevant handlers are passed to each row.
export default function TaskGroup({ label, labelClass = "text-foreground/70", tasks, actions, leading = null }) {
  if (!tasks.length) return null;
  // Higher priority (5→1) sorts first within the group (stable otherwise). The
  // canonical total ordering (priority→due→added→manual) arrives in Story 2.4.
  const ordered = [...tasks].sort(byPriorityDesc);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest whitespace-nowrap ${labelClass}`}>
          {leading}
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground/60">{tasks.length}</span>
      </div>
      <AnimatePresence mode="popLayout">
        {ordered.map((task, i) => (
          <TaskItem
            key={task.id}
            task={task}
            index={i}
            onToggle={actions.toggle}
            onDelete={actions.remove}
            onUpdate={actions.patch}
            onDefer={actions.defer}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
