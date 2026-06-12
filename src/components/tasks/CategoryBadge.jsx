import React from "react";

// Categories are decorative grouping, not status. With a single-accent palette
// (teal) and success reserved for semantics, categories are distinguished by
// their label on a neutral surface chip rather than by hue.
const CHIP = "bg-surface text-foreground border-border";

export default function CategoryBadge({ category }) {
  if (!category) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${CHIP}`}>
      {category}
    </span>
  );
}