import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckSquare, CalendarDays, Archive, Settings, Plus } from "lucide-react";

// The four surfaces, two either side of the centre +FAB.
const LEFT_ITEMS = [
  { label: "Focus", path: "/", icon: CheckSquare },
  { label: "Plan", path: "/plan", icon: CalendarDays },
];
const RIGHT_ITEMS = [
  { label: "Archive", path: "/archive", icon: Archive },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Track the current focus-session so repeated FAB taps never stack listeners.
  const keydownCleanup = useRef(null);
  const rafId = useRef(0);
  useEffect(
    () => () => {
      keydownCleanup.current?.();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    },
    [],
  );

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  // The centre +FAB never creates a task. It goes to Plan (if needed) and
  // focuses the quick-input there, which stays the single create path. On
  // dismiss (Escape) focus returns to the FAB.
  const focusQuickInput = () => {
    // Tear down any previous focus-session (no stacked keydown listeners) and
    // cancel an in-flight poll before starting a new one.
    keydownCleanup.current?.();
    keydownCleanup.current = null;
    if (rafId.current) cancelAnimationFrame(rafId.current);

    const settle = (el) => {
      el.focus();
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const onKey = (e) => {
        if (e.key !== "Escape") return;
        keydownCleanup.current?.();
        keydownCleanup.current = null;
        el.blur();
        document.getElementById("create-fab")?.focus();
      };
      el.addEventListener("keydown", onKey);
      keydownCleanup.current = () => el.removeEventListener("keydown", onKey);
    };

    // Poll across frames rather than a single fixed timeout, so the focus still
    // lands if the Plan route mounts slowly (bounded to ~0.5s).
    let tries = 0;
    const poll = () => {
      const el = document.getElementById("task-quick-input");
      if (el) {
        settle(el);
        return;
      }
      if (tries++ < 30) rafId.current = requestAnimationFrame(poll);
    };

    if (pathname !== "/plan") navigate("/plan");
    poll();
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
            id="create-fab"
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
