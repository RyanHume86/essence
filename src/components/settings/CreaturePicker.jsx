import React from "react";
import { CREATURES } from "@/lib/prefs";

// Presentational creature picker shared by Onboarding and Settings. v1 offers a
// single preset (the shipped art); the list is data-driven so more presets are a
// data change. Per-scheme recolor is Story 3.7. `onSelect` receives the key.
export default function CreaturePicker({ value, onSelect }) {
  return (
    <div role="radiogroup" aria-label="Companion" className="flex justify-center gap-3">
      {CREATURES.map((c) => {
        const active = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            onClick={() => onSelect?.(c.key)}
            aria-checked={active}
            aria-label={c.label}
            className={`surface-raised rounded-2xl p-4 transition-shadow motion-reduce:transition-none ${
              active ? "ring-2 ring-highlight" : ""
            }`}
          >
            <img src={c.art} alt={c.label} className="w-24 h-24 object-contain mx-auto" />
            <span className="mt-2 block text-xs font-medium text-foreground">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
