import React from "react";
import { Briefcase, User, Heart, ShoppingBag, MoreHorizontal } from "lucide-react";

// Quiet, low-saturation category tints: a faint fill plus a matching border,
// kept cohesive with the navy palette. The accent (teal) and success green are
// reserved, so categories use their own muted family.
const STYLES = {
  Work:     "bg-category-work/15 text-category-work border-category-work/30",
  Personal: "bg-category-personal/15 text-category-personal border-category-personal/30",
  Health:   "bg-category-health/15 text-category-health border-category-health/30",
  Shopping: "bg-category-shopping/15 text-category-shopping border-category-shopping/30",
  Other:    "bg-category-other/15 text-category-other border-category-other/30",
};

// Leading icon per category, shared with the input picker so chips and picker match.
export const CATEGORY_ICONS = {
  Work: Briefcase,
  Personal: User,
  Health: Heart,
  Shopping: ShoppingBag,
  Other: MoreHorizontal,
};

// Solid category colour for the card's left accent bar.
export const CATEGORY_BAR = {
  Work: "bg-category-work",
  Personal: "bg-category-personal",
  Health: "bg-category-health",
  Shopping: "bg-category-shopping",
  Other: "bg-category-other",
};

export default function CategoryBadge({ category }) {
  if (!category) return null;
  const style = STYLES[category] ?? STYLES.Other;
  const Icon = CATEGORY_ICONS[category] ?? MoreHorizontal;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>
      <Icon className="w-3 h-3" />
      {category}
    </span>
  );
}