import React from "react";
import { ListChecks } from "lucide-react";

export default function TopHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-14 flex items-center justify-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading font-semibold text-lg text-foreground tracking-tight">
            To Do
          </span>
        </div>
      </div>
    </header>
  );
}