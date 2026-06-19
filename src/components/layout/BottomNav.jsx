import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckSquare, CalendarDays, LayoutGrid, Settings, Plus } from "lucide-react";

// Two side slots either side of the centre FAB.
const LEFT_ITEMS = [
  { label: "Today", path: "/", icon: CheckSquare },
  { label: "Upcoming", path: "/upcoming", icon: CalendarDays },
];
const RIGHT_ITEMS = [
  { label: "Browse", path: "/browse", icon: LayoutGrid },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  // The centre FAB never creates a task. It returns to Today (if needed) and
  // focuses the existing rich input, which stays the single create path.
  const focusQuickInput = () => {
    if (pathname !== "/") navigate("/");
    setTimeout(() => {
      const el = document.getElementById("task-quick-input");
      if (el) {
        el.focus();
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 60);
  };

  const renderSlot = ({ label, path, icon: Icon }) => {
    const active = isActive(path);
    return (
      <Link
        key={path}
        to={path}
        replace
        className="flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors duration-200"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            active ? "bg-primary/10" : "hover:bg-muted"
          }`}
        >
          <Icon className={`w-5 h-5 transition-colors duration-200 ${active ? "text-highlight" : "text-muted-foreground"}`} />
        </div>
        <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? "text-highlight" : "text-muted-foreground"}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center h-16">
        {LEFT_ITEMS.map(renderSlot)}

        {/* Centre FAB: focuses the rich input, lifted to overlap the nav edge */}
        <div className="flex-1 flex items-start justify-center">
          <button
            type="button"
            onClick={focusQuickInput}
            aria-label="Add a task"
            className="btn-accent-3d -mt-7 w-14 h-14 rounded-2xl text-primary-foreground flex items-center justify-center select-none"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {RIGHT_ITEMS.map(renderSlot)}
      </div>
    </nav>
  );
}
