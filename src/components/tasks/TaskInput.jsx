import React, { useState } from "react";
import { Plus, CalendarClock, X, ChevronDown, MessageSquare } from "lucide-react";
import { format, addDays, nextSaturday } from "date-fns";
import { CATEGORY_ICONS } from "./CategoryBadge";

const iso = (d) => format(d, "yyyy-MM-dd");
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const CATEGORIES = ["Personal", "Work", "Shopping", "Health", "Other"];

// Quiet, low-saturation category tints (faint fill plus matching border),
// cohesive with the navy palette. Tokens live in tailwind.config.js.
export const CATEGORY_STYLES = {
  Work:     "bg-category-work/15 text-category-work border-category-work/30",
  Personal: "bg-category-personal/15 text-category-personal border-category-personal/30",
  Shopping: "bg-category-shopping/15 text-category-shopping border-category-shopping/30",
  Health:   "bg-category-health/15 text-category-health border-category-health/30",
  Other:    "bg-category-other/15 text-category-other border-category-other/30",
};

// Keep the legacy export name for backwards compat
export const CATEGORY_BADGE_STYLES = CATEGORY_STYLES;

export default function TaskInput({ onAdd }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), category, dueDate || null, comment.trim() || null);
    setTitle("");
    setDueDate("");
    setComment("");
    setShowComment(false);
  };

  const selectCategory = (cat) => {
    setCategory(cat);
    setCategoryDrawerOpen(false);
  };

  // Capture-time quick dates. Tapping a chip sets (or clears) the due date.
  const quickDates = [
    { label: "Today", value: iso(new Date()) },
    { label: "Tomorrow", value: iso(addDays(new Date(), 1)) },
    { label: "Weekend", value: iso(nextSaturday(new Date())) },
  ];
  const setQuickDate = (value) => setDueDate((cur) => (cur === value ? "" : value));

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <input
          id="task-quick-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-6 py-4 pr-14 surface-raised input-glow rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-300 text-base font-body"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="absolute right-3 top-2 w-10 h-10 rounded-xl btn-accent-3d text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed select-none"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Optional comment field */}
      {showComment && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a note or comment…"
          rows={2}
          className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all duration-200 font-body"
        />
      )}

      {/* Quick dates */}
      <div className="flex items-center gap-2 px-1">
        {quickDates.map((q) => {
          const active = dueDate === q.value;
          return (
            <button
              key={q.label}
              type="button"
              onClick={() => setQuickDate(q.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
                active
                  ? "bg-primary/10 text-highlight border-primary/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Category trigger + date picker row */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Category selector button */}
        <button
          type="button"
          onClick={() => setCategoryDrawerOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none ${CATEGORY_STYLES[category]}`}
        >
          {React.createElement(CATEGORY_ICONS[category], { className: "w-3.5 h-3.5" })}
          {category}
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {/* Comment toggle */}
        <button
          type="button"
          onClick={() => setShowComment((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
            showComment || comment
              ? "bg-primary/10 text-highlight border-primary/30"
              : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          Note
        </button>

        {/* Due date */}
        <div className="relative flex items-center">
          <CalendarClock className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="pl-7 pr-2 py-1 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200 [color-scheme:dark]"
          />
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate("")}
              className="absolute right-2 text-muted-foreground/60 hover:text-muted-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Category bottom-sheet drawer */}
      <Drawer open={categoryDrawerOpen} onOpenChange={setCategoryDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base">Select Category</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-2" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 select-none ${
                  category === cat
                    ? CATEGORY_STYLES[cat] + " ring-1 ring-inset"
                    : "bg-card border-border text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {React.createElement(CATEGORY_ICONS[cat], { className: "w-4 h-4" })}
                  {cat}
                </span>
                {category === cat && (
                  <div className="w-2 h-2 rounded-full bg-current opacity-70" />
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}