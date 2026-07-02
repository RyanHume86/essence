import React from "react";
import { Check } from "lucide-react";
import { SCHEMES } from "@/lib/prefs";

// Presentational 7-scheme picker shared by Onboarding and Settings. Each option
// shows a live per-scheme swatch: the nested `data-scheme={key}` wrapper scopes
// that scheme's CSS custom properties to the preview, so `bg-primary` /
// `bg-surface` / `bg-highlight` render in the option's own palette — token-pure,
// no hardcoded hex. `onSelect` receives the scheme key.
export default function SchemePicker({ value, onSelect }) {
  return (
    <div role="radiogroup" aria-label="Colour scheme" className="grid grid-cols-2 gap-3">
      {SCHEMES.map((s) => {
        const active = s.key === value;
        return (
          <button
            key={s.key}
            type="button"
            role="radio"
            onClick={() => onSelect?.(s.key)}
            aria-checked={active}
            aria-label={s.label}
            className={`relative surface-raised rounded-2xl p-3 text-left transition-shadow motion-reduce:transition-none ${
              active ? "ring-2 ring-highlight" : ""
            }`}
          >
            <div
              data-scheme={s.key}
              className="flex items-center gap-1.5 rounded-xl bg-background p-2 mb-2 border border-border"
            >
              <span className="w-6 h-6 rounded-full bg-primary flex-shrink-0" />
              <span className="w-4 h-6 rounded-md bg-surface border border-border flex-shrink-0" />
              <span className="w-2.5 h-6 rounded bg-highlight flex-shrink-0" />
            </div>
            <span className="text-xs font-medium text-foreground">{s.label}</span>
            {active && <Check className="absolute top-2.5 right-2.5 w-4 h-4 text-highlight" />}
          </button>
        );
      })}
    </div>
  );
}
