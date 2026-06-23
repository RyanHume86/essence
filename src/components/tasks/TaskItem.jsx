import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Trash2, CalendarClock, CalendarPlus, ChevronDown, MessageSquare, Star, MoreVertical, Pencil, Flag, Repeat } from "lucide-react";
import CategoryBadge, { CATEGORY_BAR } from "./CategoryBadge";
import SubtaskTree from "./SubtaskTree";
import TaskEditDrawer from "./TaskEditDrawer";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

const SWIPE_THRESHOLD = 80; // px to trigger a swipe action

function DueDateChip({ due_date, due_time, completed }) {
  if (!due_date) return null;
  const date = parseISO(due_date);
  const overdue =
    !completed &&
    ((isPast(date) && !isToday(date)) ||
      (isToday(date) && !!due_time && isPast(parseISO(`${due_date}T${due_time}`))));
  const base = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "d MMM");
  const label = due_time ? `${base} ${due_time}` : base;
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

export default function TaskItem({ task, onToggle, onDelete, onUpdate, onDefer, onToggleToday, index = 0 }) {
  const hasExtras = task.comment || (task.subtasks && task.subtasks.length > 0);
  const [expanded, setExpanded] = useState(hasExtras);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Staggered entrance, gated behind reduced-motion. Items are keyed by id and
  // persist, so this only runs on mount, not when a task is toggled.
  const reduce = useReducedMotion();
  const delay = reduce ? 0 : Math.min(index * 0.04, 0.3);

  const subtaskCount = task.subtasks?.length ?? 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;

  const handleSubtasksChange = (newSubtasks) => {
    onUpdate(task, { subtasks: newSubtasks });
  };

  // Swipe right to complete, swipe left to defer to tomorrow.
  const handleDragEnd = (_e, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) onToggle(task);
    else if (info.offset.x < -SWIPE_THRESHOLD && !task.completed && onDefer) onDefer(task);
  };

  return (
    <motion.div
      layout
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: "easeOut", delay }}
      className="group relative rounded-2xl overflow-hidden select-none"
    >
      {/* Swipe action hints, revealed as the card slides */}
      <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none" aria-hidden="true">
        <span className="flex items-center gap-1.5 text-success text-sm font-medium">
          <Check className="w-4 h-4" /> Done
        </span>
        <span className="flex items-center gap-1.5 text-highlight text-sm font-medium">
          Tomorrow <CalendarPlus className="w-4 h-4" />
        </span>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragSnapToOrigin
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        className="relative surface-raised rounded-2xl hover:border-primary/20 transition-colors duration-300"
      >
      {/* Category accent bar */}
      {task.category && CATEGORY_BAR[task.category] && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${CATEGORY_BAR[task.category]}`} aria-hidden="true" />
      )}

      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <button
          onClick={() => onToggle(task)}
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`Mark "${task.title}" complete`}
          className={`checkbox ${task.completed ? "done" : ""} flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center`}
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
          <span className={`title-strike ${task.completed ? "done" : ""} text-base font-medium leading-snug transition-all duration-300 ${
            task.completed ? "text-muted-foreground/50" : "text-foreground"
          }`}>
            {task.title}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.priority === "high" && !task.completed && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-highlight/15 text-highlight border border-highlight/40">
                <Flag className="w-2.5 h-2.5" />
                High
              </span>
            )}
            {task.category && <CategoryBadge category={task.category} />}
            <DueDateChip due_date={task.due_date} due_time={task.due_time} completed={task.completed} />
            {/* Subtask progress pill */}
            {subtaskCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {completedSubtasks}/{subtaskCount}
              </span>
            )}
            {/* Recurrence indicator (recurrence is now a rule object) */}
            {task.recurrence && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Repeat className="w-2.5 h-2.5" />
                Repeats
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

        {/* Today flag */}
        {onToggleToday && (
          <button
            onClick={() => onToggleToday(task)}
            aria-label={task.today ? `Remove "${task.title}" from Today` : `Add "${task.title}" to Today`}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <Star className={`w-4 h-4 transition-colors duration-200 ${task.today ? "text-highlight fill-highlight" : "text-muted-foreground/40 hover:text-muted-foreground"}`} />
          </button>
        )}

        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-all duration-200"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* Actions menu (edit, defer, delete) — reachable on touch and desktop */}
        <button
          onClick={() => setActionsOpen(true)}
          aria-label={`Actions for "${task.title}"`}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
        >
          <MoreVertical className="w-4 h-4" />
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

      {/* Actions menu */}
      <Drawer open={actionsOpen} onOpenChange={setActionsOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base truncate">{task.title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 space-y-1" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
            <button
              onClick={() => { setActionsOpen(false); setEditOpen(true); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors text-left"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            {onDefer && !task.completed && (
              <button
                onClick={() => { onDefer(task); setActionsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors text-left"
              >
                <CalendarPlus className="w-4 h-4" /> Defer to tomorrow
              </button>
            )}
            <button
              onClick={() => { onDelete(task); setActionsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Edit drawer */}
      <TaskEditDrawer
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(patch) => onUpdate(task, patch)}
      />
    </motion.div>
  );
}