import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getTodayCount, subscribe } from "@/lib/winMoment";

// Win-moment companion: a small, *alive* creature framed by a growth ring that
// fills with today's completions. It breathes and blinks at rest, and on a
// completion it gives a brief, warm reaction (a soft hop, happy eyes, a glow)
// plus one short true line that self-dismisses (~1.5s). Pleased, not hyped —
// no confetti, no streaks, never shows remaining work.
//
// Aliveness is the point: a static face reads as dead. Idle breathing + blinking
// are what make it feel present. All motion is gated on useReducedMotion —
// reduced motion holds a calm static pose and only swaps expression on a win.

// Ring + creature geometry. Larger than a glyph so the creature has presence.
const RING_TARGET = 8;
const R = 38;
const STROKE = 5;
const CIRC = 2 * Math.PI * R;
const SIZE = (R + STROKE) * 2 + 10;
const C = SIZE / 2;
const BODY = 27;

// Feature colors (dark on the teal body for contrast). Hardcoded hex is the
// character art, allowed by spec.
const INK = "#05303d";

// One short, true line per reaction. No numbers, no "what's left", no streaks.
const LINES = ["Nice.", "That's one done.", "Good move.", "Onward.", "Mm — well done.", "There you go."];

/** @param {number} count @returns {number} 0..1 ring fill */
const fillFor = (count) => Math.min(count / RING_TARGET, 1);

const EYE_DX = 8;
const EYE_Y = C - 4;

export default function Companion() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(() => getTodayCount());
  const [line, setLine] = useState(null);
  const [reacting, setReacting] = useState(false);
  const [blink, setBlink] = useState(false);
  const hideTimer = useRef(null);

  // Subscribe to win events: react + surface a line that lingers, then fades.
  useEffect(() => {
    const unsubscribe = subscribe((newCount) => {
      setCount(newCount);
      setLine(LINES[(newCount - 1) % LINES.length]);
      setReacting(true);
      clearTimeout(hideTimer.current);
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

  // Blink loop — the single biggest "alive" tell. Randomized cadence, paused
  // under reduced motion (eyes simply stay open).
  useEffect(() => {
    if (reduce) return;
    let cancelled = false;
    let t;
    const loop = () => {
      t = setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        setTimeout(() => !cancelled && setBlink(false), 130);
        loop();
      }, 2600 + Math.random() * 3200);
    };
    loop();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [reduce]);

  const fill = fillFor(count);
  const offset = CIRC - fill * CIRC;
  const eyesClosed = blink && !reacting;

  return (
    <div className="surface-raised rounded-2xl px-4 py-3 flex items-center gap-4">
      {/* Reaction hop + pop live on the outer wrapper; breathing lives inside. */}
      <motion.div
        className="relative flex-shrink-0"
        style={{ width: SIZE, height: SIZE }}
        animate={reduce ? false : { scale: reacting ? 1.08 : 1, y: reacting ? -3 : 0 }}
        transition={{ type: "spring", stiffness: 480, damping: 15 }}
      >
        {/* Soft glow behind the creature on a reaction */}
        {reacting && !reduce && (
          <motion.div
            className="absolute inset-0 rounded-full bg-highlight/30 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          />
        )}

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Your companion">
          <defs>
            <radialGradient id="companionBody" cx="36%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#39c2c6" />
              <stop offset="100%" stopColor="#0a6b73" />
            </radialGradient>
          </defs>

          {/* Growth ring — track + progress, filling from the top (static) */}
          <g transform={`rotate(-90 ${C} ${C})`}>
            <circle cx={C} cy={C} r={R} fill="none" stroke="#0a3a52" strokeWidth={STROKE} />
            <circle
              cx={C}
              cy={C}
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

          {/* The living creature — breathes continuously (gentle rise/fall). */}
          <motion.g
            animate={reduce ? undefined : { y: [0, -2, 0] }}
            transition={reduce ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: "0px", originY: "0px" }}
          >
            {/* Body + gloss highlight */}
            <circle cx={C} cy={C} r={BODY} fill="url(#companionBody)" />
            <ellipse cx={C - 7} cy={C - 10} rx="7" ry="4.5" fill="#ffffff" opacity="0.18" />

            {/* Cheeks — fade in on a reaction */}
            <g style={{ transition: "opacity .3s ease", opacity: reacting ? 1 : 0 }} aria-hidden="true">
              <circle cx={C - 14} cy={C + 5} r="3.2" fill="#ff9aa2" opacity="0.55" />
              <circle cx={C + 14} cy={C + 5} r="3.2" fill="#ff9aa2" opacity="0.55" />
            </g>

            {/* Eyes — happy arcs on a win, a thin closed line on a blink, else
                round eyes with a living highlight. */}
            {reacting ? (
              <>
                <path d={`M ${C - EYE_DX - 3.5} ${EYE_Y + 1.5} Q ${C - EYE_DX} ${EYE_Y - 3} ${C - EYE_DX + 3.5} ${EYE_Y + 1.5}`} fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
                <path d={`M ${C + EYE_DX - 3.5} ${EYE_Y + 1.5} Q ${C + EYE_DX} ${EYE_Y - 3} ${C + EYE_DX + 3.5} ${EYE_Y + 1.5}`} fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
              </>
            ) : eyesClosed ? (
              <>
                <line x1={C - EYE_DX - 3} y1={EYE_Y} x2={C - EYE_DX + 3} y2={EYE_Y} stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
                <line x1={C + EYE_DX - 3} y1={EYE_Y} x2={C + EYE_DX + 3} y2={EYE_Y} stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx={C - EYE_DX} cy={EYE_Y} r="3.4" fill={INK} />
                <circle cx={C + EYE_DX} cy={EYE_Y} r="3.4" fill={INK} />
                <circle cx={C - EYE_DX - 1} cy={EYE_Y - 1.3} r="1.1" fill="#ffffff" opacity="0.9" />
                <circle cx={C + EYE_DX - 1} cy={EYE_Y - 1.3} r="1.1" fill="#ffffff" opacity="0.9" />
              </>
            )}

            {/* Mouth — a fuller, warmer smile on a reaction; a soft one at rest. */}
            <path
              d={
                reacting
                  ? `M ${C - 6.5} ${C + 7} Q ${C} ${C + 15} ${C + 6.5} ${C + 7}`
                  : `M ${C - 4.5} ${C + 8} Q ${C} ${C + 11} ${C + 4.5} ${C + 8}`
              }
              fill="none"
              stroke={INK}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </motion.g>
        </svg>
      </motion.div>

      {/* One short, restrained line — only present during a reaction. */}
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
      </div>
    </div>
  );
}
