import React from "react";

const STYLES = {
  Work:     "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Personal: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Shopping: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Health:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Other:    "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export default function CategoryBadge({ category }) {
  if (!category) return null;
  const style = STYLES[category] ?? STYLES.Other;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>
      {category}
    </span>
  );
}