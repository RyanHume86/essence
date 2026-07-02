import React, { useState } from "react";
import { format } from "date-fns";
import Companion from "@/components/companion/Companion";
import { recordCompletion, getTodayCount } from "@/lib/winMoment";

// DEV-ONLY, no-backend preview of the win-moment loop. Reachable at /preview via
// a short-circuit in App.jsx (before the Base44 AuthProvider), so it renders
// without login or real tasks — purely to *feel* the companion react. Not a real
// app route; safe to delete. Uncommitted scaffolding.
export default function CompanionPreview() {
  const [remount, setRemount] = useState(0);
  const [count, setCount] = useState(() => getTodayCount());

  const complete = () => setCount(recordCompletion());
  const reset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(`akha_win_${format(new Date(), "yyyy-MM-dd")}`);
    }
    setCount(0);
    setRemount((n) => n + 1); // remount Companion so it re-reads 0
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#012a41" }}
      className="flex flex-col items-center justify-center gap-6 p-6 text-foreground font-body"
    >
      <div className="text-center space-y-1">
        <h1 className="text-xl font-heading">Win-moment preview</h1>
        <p className="text-sm text-muted-foreground">Dev-only · no backend · feel the loop</p>
      </div>

      <div className="w-full max-w-sm">
        <Companion key={remount} />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={complete}
          className="px-5 py-3 rounded-xl btn-accent-3d text-primary-foreground font-semibold text-sm select-none"
        >
          Complete a task
        </button>
        <button
          onClick={reset}
          className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm transition-colors hover:bg-muted"
        >
          Reset day
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Today's completions: {count} · tip: toggle OS reduced-motion to see the calm path
      </p>
    </div>
  );
}
