import React from "react";

// Calm, consistent empty and all-done state.
export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
        {Icon && <Icon className="w-7 h-7 text-muted-foreground/50" />}
      </div>
      <p className="text-foreground font-medium">{title}</p>
      {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
    </div>
  );
}
