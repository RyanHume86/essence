import React from "react";
import { ListChecks, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Root paths that should NOT show a back button
const ROOT_PATHS = ["/", "/settings"];

export default function TopHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const canGoBack = !ROOT_PATHS.includes(pathname);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-14 flex items-center px-4 relative">
        {/* Back button — only on child routes */}
        {canGoBack && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors duration-200 select-none"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Brand — always centred */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <ListChecks className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading font-semibold text-lg text-foreground tracking-tight">
            Essence
          </span>
        </div>
      </div>
    </header>
  );
}