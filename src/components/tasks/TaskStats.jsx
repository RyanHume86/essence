import React from "react";

export default function TaskStats({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = total - completed;

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
      <span>{remaining} remaining</span>
      <span>
        {completed} of {total} done
      </span>
    </div>
  );
}