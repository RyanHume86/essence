import React from "react";
import { motion } from "framer-motion";
import { Check, Trash2, CalendarClock } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

function DueDateChip({ due_date, completed }) {
  if (!due_date) return null;
  const date = parseISO(due_date);
  const overdue = !completed && isPast(date) && !isToday(date);
  const label = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "d MMM");
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
      overdue
        ? "bg-red-500/15 text-red-400 border-red-500/30"
        : isToday(date)
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-primary/10 text-primary/80 border-primary/20"
    }`}>
      <CalendarClock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all duration-300 select-none"
    >
      <button
        onClick={() => onToggle(task)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
          task.completed
            ? "bg-primary border-primary"
            : "border-border hover:border-primary/50"
        }`}
      >
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </motion.div>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <span
          className={`text-base transition-all duration-300 ${
            task.completed
              ? "line-through text-muted-foreground/50"
              : "text-foreground"
          }`}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.category && <CategoryBadge category={task.category} />}
          <DueDateChip due_date={task.due_date} completed={task.completed} />
        </div>
      </div>

      <button
        onClick={() => onDelete(task)}
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}