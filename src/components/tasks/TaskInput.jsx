import React, { useState } from "react";
import { Plus, CalendarClock, X } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const CATEGORIES = ["Personal", "Work", "Shopping", "Health", "Other"];

const CATEGORY_STYLES = {
  Work:     "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Personal: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Shopping: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Health:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Other:    "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export const CATEGORY_BADGE_STYLES = CATEGORY_STYLES;

export default function TaskInput({ onAdd }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), category, dueDate || null);
    setTitle("");
    setDueDate("");
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

      {/* Category pills + date picker row */}
      <div className="flex items-center justify-between gap-2 flex-wrap px-1">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
                category === cat
                  ? CATEGORY_STYLES[cat] + " ring-1 ring-offset-0 opacity-100"
                  : "bg-transparent border-border text-muted-foreground opacity-60 hover:opacity-90"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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
    </div>
  );
}