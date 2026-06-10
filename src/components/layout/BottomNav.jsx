import React from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckSquare, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: CheckSquare },
  { label: "Settings", path: "/settings", icon: Settings },
];

// Each tab owns a "stack root". Tapping a tab navigates to its root,
// preserving the illusion of independent stacks (native-like behaviour).
export default function BottomNav() {
  const { pathname } = useLocation();

  // A tab is "active" if the current path starts with its root
  // (handles future child routes like /settings/privacy, etc.)
  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center h-16">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              // Replace so back-button doesn't cycle through tab switches
              replace
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors duration-200"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  active ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}