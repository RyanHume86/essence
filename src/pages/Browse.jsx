import React from "react";
import { LayoutGrid } from "lucide-react";
import TaskGroup from "../components/tasks/TaskGroup";
import PullToRefresh from "../components/PullToRefresh";
import EmptyState from "../components/EmptyState";
import { useTasks } from "@/hooks/useTasks";
import { CATEGORIES } from "../components/tasks/TaskInput";
import { CATEGORY_ICONS } from "../components/tasks/CategoryBadge";

const CAT_TEXT = {
  Work: "text-category-work",
  Personal: "text-category-personal",
  Health: "text-category-health",
  Shopping: "text-category-shopping",
  Other: "text-category-other",
};

export default function Browse() {
  const { tasks, isLoading, refetch, actions } = useTasks();
  const active = tasks.filter((t) => !t.completed);

  const order = [...CATEGORIES];
  const byCategory = order.map((cat) => ({
    cat,
    items: active.filter((t) => (t.category || "Other") === cat),
  }));
  // Anything with an unknown category falls under Other.
  const known = new Set(order);
  const orphans = active.filter((t) => !known.has(t.category || "Other"));
  if (orphans.length) byCategory.find((g) => g.cat === "Other").items.push(...orphans);

  const hasAny = byCategory.some((g) => g.items.length > 0);

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="pt-2">
        <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">Browse</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your active tasks by category</p>
      </div>

      {isLoading && <p className="text-center text-muted-foreground text-sm py-12">Loading…</p>}

      {!isLoading && byCategory.map(({ cat, items }) => (
        <TaskGroup
          key={cat}
          label={cat}
          labelClass={CAT_TEXT[cat] || "text-foreground/70"}
          leading={React.createElement(CATEGORY_ICONS[cat] || CATEGORY_ICONS.Other, { className: "w-3.5 h-3.5" })}
          tasks={items}
          actions={actions}
        />
      ))}

      {!isLoading && !hasAny && (
        <EmptyState icon={LayoutGrid} title="No active tasks" subtitle="Add one from Today." />
      )}
    </PullToRefresh>
  );
}
