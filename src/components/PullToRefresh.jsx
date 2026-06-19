import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 72; // px needed to trigger a refresh

// Find the nearest scrollable ancestor of a node. The list scrolls inside the
// <main> in AppLayout, not the window, so we read that element's scrollTop.
function getScrollParent(node) {
  let el = node instanceof Element ? node : null;
  while (el && el !== document.body) {
    const overflowY = window.getComputedStyle(el).overflowY;
    if (/(auto|scroll)/.test(overflowY) && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

function usePullToRefresh(onRefresh) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);
  const scrollElRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const scrollEl = getScrollParent(e.target);
    scrollElRef.current = scrollEl;
    startYRef.current = (scrollEl?.scrollTop ?? 0) <= 0 ? e.touches[0].clientY : null;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startYRef.current === null) return;
    if ((scrollElRef.current?.scrollTop ?? 0) > 0) {
      startYRef.current = null;
      setPullY(0);
      return;
    }
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) setPullY(Math.min(delta * 0.45, PULL_THRESHOLD + 20));
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    startYRef.current = null;
  }, [pullY, refreshing, onRefresh]);

  return { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}

// Page shell with pull-to-refresh and the shared centred, max-width column.
export default function PullToRefresh({ onRefresh, children }) {
  const { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(onRefresh);

  return (
    <div
      className="flex items-start justify-center px-4 py-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <motion.div
        className="fixed top-0 left-0 right-0 z-30 flex items-end justify-center pointer-events-none"
        style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top))" }}
        animate={{ height: pullY > 0 || refreshing ? pullY || 48 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={`mb-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-md transition-opacity duration-200 ${pullY > 0 || refreshing ? "opacity-100" : "opacity-0"}`}>
          <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${(pullY / PULL_THRESHOLD) * 180}deg)` }} />
        </div>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">{children}</div>
    </div>
  );
}
