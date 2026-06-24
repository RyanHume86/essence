import React, { useState, useEffect } from "react";
import { format, addDays, nextSaturday } from "date-fns";
import { Flag } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { CATEGORIES, CATEGORY_STYLES } from "./TaskInput";
import { CATEGORY_ICONS } from "./CategoryBadge";
import RecurrenceEditor from "./RecurrenceEditor";
import { firstOccurrenceOnOrAfter } from "@/lib/recurrence";

const iso = (d) => format(d, "yyyy-MM-dd");

// Edit an existing task. Mirrors the capture controls (title, category, quick
// dates, note) and saves through the patch mutation. Create stays in TaskInput.
export default function TaskEditDrawer({ task, open, onOpenChange, onSave }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [comment, setComment] = useState("");
  const [priority, setPriority] = useState("normal");
  const [recurrence, setRecurrence] = useState(null);
  const [recurrenceReset, setRecurrenceReset] = useState(0);

  // Re-seed the fields whenever a task is opened for editing.
  useEffect(() => {
    if (open && task) {
      setTitle(task.title || "");
      setCategory(task.category || "Personal");
      setDueDate(task.due_date || "");
      setDueTime(task.due_time || "");
      setComment(task.comment || "");
      setPriority(task.priority || "normal");
      setRecurrence(task.recurrence ?? null);
      setRecurrenceReset((n) => n + 1);
    }
  }, [open, task]);

  // Enabling recurrence needs a seed date; default to today when none is set.
  const handleRecurrenceChange = (rule) => {
    setRecurrence(rule);
    if (rule && !dueDate) setDueDate(iso(new Date()));
  };

  const quickDates = [
    { label: "Today", value: iso(new Date()) },
    { label: "Tomorrow", value: iso(addDays(new Date(), 1)) },
    { label: "Weekend", value: iso(nextSaturday(new Date())) },
  ];

  const save = () => {
    const t = title.trim();
    if (!t) return;
    // RecurrenceEditor leaves this reference untouched unless the user actually
    // changes the rule, so reference equality is a reliable "did it change?".
    const ruleChanged = recurrence !== (task.recurrence ?? null);
    const due_date = recurrence
      ? firstOccurrenceOnOrAfter(recurrence, dueDate || iso(new Date()))
      : dueDate || null;
    const patch = {
      title: t,
      category,
      due_date,
      due_time: due_date ? (dueTime || null) : null,
      comment: comment.trim() || null,
      priority,
      recurrence,
    };
    // Only reset progress when the rule genuinely changed, so an unrelated edit
    // never wipes a partially-completed afterCount series.
    if (recurrence && ruleChanged) patch.occurrence_count = 0;
    onSave(patch);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">Edit task</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 space-y-4" style={{ paddingBottom: "0.5rem" }}>
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-4 py-3 surface-raised input-glow rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-sm font-body"
          />

          {/* Category */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
                    active ? CATEGORY_STYLES[cat] + " ring-1 ring-inset" : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick dates + date picker */}
          <div className="flex items-center gap-2">
            {quickDates.map((qd) => {
              const active = dueDate === qd.value;
              return (
                <button
                  key={qd.label}
                  type="button"
                  onClick={() => setDueDate((cur) => (cur === qd.value ? "" : qd.value))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
                    active ? "bg-primary/10 text-highlight border-primary/30" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {qd.label}
                </button>
              );
            })}
            <input
              type="date"
              value={dueDate || ""}
              onChange={(e) => { setDueDate(e.target.value); if (!e.target.value) setDueTime(""); }}
              className="ml-auto px-2 py-1 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 [color-scheme:dark]"
            />
            {dueDate && (
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                aria-label="Time of day"
                className={`px-2 py-1 rounded-full text-xs font-medium border bg-card focus:outline-none focus:ring-1 focus:ring-primary/40 [color-scheme:dark] ${
                  dueTime ? "text-highlight border-primary/30" : "text-muted-foreground border-border"
                }`}
              />
            )}
          </div>

          {/* Priority */}
          <button
            type="button"
            onClick={() => setPriority((p) => (p === "high" ? "normal" : "high"))}
            aria-pressed={priority === "high"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
              priority === "high"
                ? "bg-primary/10 text-highlight border-primary/30"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            High priority
          </button>

          {/* Recurrence */}
          <RecurrenceEditor
            value={recurrence}
            seedDate={dueDate}
            resetToken={recurrenceReset}
            onChange={handleRecurrenceChange}
          />

          {/* Note */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note…"
            rows={2}
            className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all duration-200 font-body"
          />
        </div>

        <DrawerFooter className="pt-2" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
          <button
            onClick={save}
            disabled={!title.trim()}
            className="w-full py-3.5 rounded-xl btn-accent-3d text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed select-none"
          >
            Save changes
          </button>
          <DrawerClose asChild>
            <button className="w-full py-3.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm transition-colors hover:bg-muted">
              Cancel
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
