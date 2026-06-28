import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getTodayCount, subscribe } from "@/lib/winMoment";

// Win-moment companion: an illustrated little creature that rests with a slow,
// subtle breath and breaks into a grin when you complete a task — then settles
// back. A slim bar tracks today's progress. Pleased, not hyped: a gentle hop and
// soft glow, no confetti, no streaks, never shows remaining work.
//
// The art lives in /public/companion as two aligned poses (idle + grin) cut from
// the same body, so the win simply cross-fades the expression. All motion gates
// on useReducedMotion.

const RING_TARGET = 8; // today's bar reads "full" at this many completions
const LINES = ["Nice.", "That's one done.", "Good move.", "Onward.", "Mm — well done.", "There you go."];

/** @param {number} count @returns {number} 0..1 */
const fillFor = (count) => Math.min(count / RING_TARGET, 1);

export default function Companion() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(() => getTodayCount());
  const [line, setLine] = useState(null);
  const [reacting, setReacting] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribe((newCount) => {
      setCount(newCount);
      setLine(LINES[(newCount - 1) % LINES.length]);
      setReacting(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setReacting(false);
        setLine(null);
      }, 1600);
    });
    return () => {
      unsubscribe();
      clearTimeout(hideTimer.current);
    };
  }, []);

  const fill = fillFor(count);

  return (
    <div className="surface-raised rounded-2xl px-4 py-3 flex items-center gap-3">
      {/* Reaction hop + pop (outer) wraps the slow breath (inner). */}
      <motion.div
        className="relative flex-shrink-0"
        style={{ width: 84, height: 90 }}
        animate={reduce ? false : { scale: reacting ? 1.04 : 1, y: reacting ? -2 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        {/* Soft glow on a reaction */}
        {reacting && !reduce && (
          <motion.div
            className="absolute inset-0 rounded-full bg-highlight/25 blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          />
        )}

        {/* Slow, subtle breath — a gentle vertical swell anchored at the feet. */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformOrigin: "50% 92%",
            filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 8px rgba(105,196,210,0.3))",
          }}
          animate={reduce ? undefined : { scaleX: [1, 1.012, 1], scaleY: [1, 1.03, 1], y: [0, -1, 0] }}
          transition={reduce ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Idle + grin stacked; the win cross-fades to the grin. */}
          <img
            src="/companion/monkey_sit_smile.svg"
            alt="Your companion"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            style={{ opacity: reacting ? 0 : 1, transition: reduce ? undefined : "opacity .18s ease" }}
          />
          <img
            src="/companion/monkey_clasp_laugh2.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            style={{ opacity: reacting ? 1 : 0, transition: reduce ? undefined : "opacity .18s ease" }}
          />
        </motion.div>
      </motion.div>

      {/* Line + today's progress */}
      <div className="min-w-0 flex-1">
        <motion.p
          key={line ? line + count : "idle"}
          className={line ? "text-sm font-medium text-highlight" : "text-sm text-muted-foreground"}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {line || "Here with you today."}
        </motion.p>
        <div className="mt-2 h-1.5 w-full max-w-[180px] rounded-full bg-black/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-highlight"
            style={{ width: `${fill * 100}%`, transition: reduce ? undefined : "width .5s ease" }}
          />
        </div>
      </div>
    </div>
  );
}
