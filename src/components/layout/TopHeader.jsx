import React, { useState } from "react";
import { ListChecks, ChevronLeft, Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "@/lib/SearchContext";

// Top-level tabs: none of these should show a back button.
const ROOT_PATHS = ["/", "/upcoming", "/browse", "/settings"];

export default function TopHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const canGoBack = !ROOT_PATHS.includes(pathname);

  const { query, setQuery } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);

  const closeSearch = () => {
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-14 flex items-center px-4 relative gap-2">
        {searchOpen ? (
          <>
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none"
            />
            <button
              onClick={closeSearch}
              aria-label="Close search"
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors duration-200 select-none flex-shrink-0"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </>
        ) : (
          <>
            {/* Back button — only on child routes */}
            {canGoBack && (
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
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

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search tasks"
              className="absolute right-4 w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors duration-200 select-none"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
