import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getTodayCount, subscribe } from "@/lib/winMoment";

// Win-moment companion: a small, warm character framed by a growth ring that
// fills with today's completions. On a completion it gives a brief, gentle
// reaction (a soft scale + glow) and surfaces one short, true line that
// self-dismisses (~1.5s). Pleased, not hyped — no confetti, no streaks, and it
// never shows remaining work.
//
// Source of truth is @/lib/winMoment: useTasks emits on a real completion, this
// component subscribes. All motion is gated on useReducedMotion — reduced motion
// shows the new state with no animation.

// Ring geometry. The ring reads "full" around RING_TARGET completions, but the
// count keeps counting beyond that (the ring simply stays full).
const RING_TARGET = 8;
const R = 30;
const STROKE = 4;
const CIRC = 2 * Math.PI * R;
const SIZE = (R + STROKE) * 2 + 8;
const CENTER = SIZE / 2;

// One short, true line per reaction. No numbers, no "what's left", no streaks.
const LINES = ["Nice.", "That's one done.", "Good move.", "Onward.", "Well done."];

/** @param {number} count @returns {number} 0..1 ring fill */
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
      // Let the line linger briefly, then fade. The ring state itself persists.
      hideTimer.current = setTimeout(() => {
        setReacting(false);
        setLine(null);
      }, 1500);
    });
    return () => {
      unsubscribe();
      clearTimeout(hideTimer.current);
    };
  }, []);

  const fill = fillFor(count);
  const offset = CIRC - fill * CIRC;

  return (
    <div className="surface-raised rounded-2xl px-4 py-3 flex items-center gap-4">
      {/* Character + growth ring */}
      <motion.div
        className="relative flex-shrink-0"
        style={{ width: SIZE, height: SIZE }}
        animate={reduce ? false : { scale: reacting ? 1.06 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
      >
        {/* Soft glow behind the character on a reaction */}
        <AnimatePresence>
          {reacting && !reduce && (
            <motion.div
              key="glow"
              className="absolute inset-0 rounded-full bg-highlight/30 blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="Your companion"
        >
          {/* Growth ring — track + progress, rotated so it fills from the top */}
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="#0a3a52" strokeWidth={STROKE} />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={R}
              fill="none"
              stroke="#69c4d2"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={reduce ? undefined : { transition: "stroke-dashoffset .6s ease" }}
            />
          </g>

          {/* Inline-SVG character: a small, warm face. Hardcoded hex is allowed
              here (character art only). It gives a tiny smile on a reaction. */}
          <circle cx={CENTER} cy={CENTER} r={R - 9} fill="#0e3d5e" stroke="#1a5077" strokeWidth="1.5" />
          <circle cx={CENTER - 7} cy={CENTER - 3} r="2.4" fill="#69c4d2" />
          <circle cx={CENTER + 7} cy={CENTER - 3} r="2.4" fill="#69c4d2" />
          <path
            d={
              reacting
                ? `M ${CENTER - 8} ${CENTER + 5} Q ${CENTER} ${CENTER + 12} ${CENTER + 8} ${CENTER + 5}`
                : `M ${CENTER - 7} ${CENTER + 6} Q ${CENTER} ${CENTER + 9} ${CENTER + 7} ${CENTER + 6}`
            }
            fill="none"
            stroke="#69c4d2"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* One short, restrained line — only present during a reaction */}
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          {line && (
            <motion.p
              key={line + count}
              className="text-sm font-medium text-highlight"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              {line}
            </motion.p>
          )}
        </AnimatePresence>
        {!line && (
          <p className="text-sm text-muted-foreground">Here with you today.</p>
        )}
      </div>
    </div>
  );
}
