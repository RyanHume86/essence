import React, { useState } from "react";
import { Plus, CalendarClock, X, ChevronDown, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export const CATEGORIES = ["Personal", "Work", "Shopping", "Health", "Other"];

export const CATEGORY_STYLES = {
  Work:     "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Personal: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Shopping: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Health:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Other:    "bg-slate-500/15 text-slate-300 border-slate-500/30",
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

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-6 py-4 pr-14 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 text-base font-body"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!title.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity duration-200 select-none"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
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

      {/* Category trigger + date picker row */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Category selector button */}
        <button
          type="button"
          onClick={() => setCategoryDrawerOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none ${CATEGORY_STYLES[category]}`}
        >
          {category}
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {/* Comment toggle */}
        <button
          type="button"
          onClick={() => setShowComment((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
            showComment || comment
              ? "bg-primary/10 text-primary border-primary/30"
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
                <span>{cat}</span>
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