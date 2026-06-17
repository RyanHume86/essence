import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, CalendarClock, ChevronDown, MessageSquare } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import SubtaskTree from "./SubtaskTree";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

function DueDateChip({ due_date, completed }) {
  if (!due_date) return null;
  const date = parseISO(due_date);
  const overdue = !completed && isPast(date) && !isToday(date);
  const label = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "d MMM");
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
      overdue
        ? "bg-highlight/15 text-highlight border-highlight/40"
        : isToday(date)
        ? "bg-muted text-highlight border-border"
        : "bg-muted text-muted-foreground border-border"
    }`}>
      <CalendarClock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

export default function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const hasExtras = task.comment || (task.subtasks && task.subtasks.length > 0);
  const [expanded, setExpanded] = useState(hasExtras);

  const subtaskCount = task.subtasks?.length ?? 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;

  const handleSubtasksChange = (newSubtasks) => {
    onUpdate(task, { subtasks: newSubtasks });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group surface-raised rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all duration-300 select-none overflow-hidden"
    >
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <button
          onClick={() => onToggle(task)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
            task.completed
              ? "bg-success border-success"
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
          <span className={`text-base transition-all duration-300 ${
            task.completed ? "line-through text-muted-foreground/50" : "text-foreground"
          }`}>
            {task.title}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.category && <CategoryBadge category={task.category} />}
            <DueDateChip due_date={task.due_date} completed={task.completed} />
            {/* Subtask progress pill */}
            {subtaskCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {completedSubtasks}/{subtaskCount}
              </span>
            )}
            {/* Comment indicator */}
            {task.comment && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <MessageSquare className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-all duration-200"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>

        <button
          onClick={() => onDelete(task)}
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable section — comment + subtasks */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 border-t border-border/50 pt-3">
              {/* Comment */}
              {task.comment && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 rounded-lg px-3 py-2">
                  {task.comment}
                </p>
              )}
              {/* Subtasks */}
              <SubtaskTree subtasks={task.subtasks || []} onChange={handleSubtasksChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}