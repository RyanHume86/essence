import React from "react";
import { PRIORITY_MIN, PRIORITY_MAX } from "@/lib/priority";

const LEVELS = Array.from({ length: PRIORITY_MAX - PRIORITY_MIN + 1 }, (_, i) => PRIORITY_MIN + i);

// Calm 1–5 priority selector (5 = most important). A quiet planning aid, never an
// alarm — reuses the shared pill-chip idiom (active = bg-primary/10 …). Exposed as
// a radiogroup for accessibility, mirroring SchemePicker. Shared by capture
// (TaskInput) and edit (TaskEditDrawer). `value` is the current integer level.
export default function PriorityPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Priority</span>
      <div role="radiogroup" aria-label="Priority" className="flex items-center gap-1.5">
        {LEVELS.map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Priority ${n}${n === PRIORITY_MAX ? " (most important)" : ""}`}
              onClick={() => onChange(n)}
              className={`w-7 h-7 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
                active
                  ? "bg-primary/10 text-highlight border-primary/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
