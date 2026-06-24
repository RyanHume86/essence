import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getTodayCount, subscribe } from "@/lib/winMoment";

// Win-moment companion: a soft little creature (a "sprout-ling") framed by a
// growth ring that fills with today's completions. It breathes and blinks at
// rest; on a completion it hops, its eyes curve happy, cheeks blush, and a glow
// blooms — then it settles back to breathing. One short true line accompanies
// the reaction and self-dismisses (~1.5s). Pleased, not hyped — no confetti,
// no streaks, never shows remaining work.
//
// Design language: Calm's "Calmlings" — rounded, plush, gentle; an actual
// creature with a body, belly, stubby limbs and a growth-sprout (which nods at
// the "watch it grow" motif). Aliveness is the point: idle breathing + blinking
// are what stop it reading as a flat glyph. All motion gates on useReducedMotion.

const VB = 100; // SVG viewBox (square)
const C = 50; // center
const R = 42; // ring radius
const STROKE = 5;
const CIRC = 2 * Math.PI * R;
const RING_TARGET = 8;

const EYE_Y = 50;
const EYE_DX = 9;
const INK = "#06323f"; // dark teal-navy for facial features (contrast on the body)

const LINES = ["Nice.", "That's one done.", "Good move.", "Onward.", "Mm — well done.", "There you go."];

/** @param {number} count @returns {number} 0..1 ring fill */
const fillFor = (count) => Math.min(count / RING_TARGET, 1);

export default function Companion() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(() => getTodayCount());
  const [line, setLine] = useState(null);
  const [reacting, setReacting] = useState(false);
  const [blink, setBlink] = useState(false);
  const hideTimer = useRef(null);

  // React to completions: surface a line that lingers, then fades.
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

  // Blink loop on a randomized cadence — paused under reduced motion.
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

  const offset = CIRC - fillFor(count) * CIRC;
  const eyesClosed = blink && !reacting;

  return (
    <div className="surface-raised rounded-2xl px-4 py-3 flex items-center gap-4">
      {/* Outer wrapper: the reaction hop + pop. */}
      <motion.div
        className="relative flex-shrink-0"
        style={{ width: 96, height: 96 }}
        animate={reduce ? false : { scale: reacting ? 1.07 : 1, y: reacting ? -3 : 0 }}
        transition={{ type: "spring", stiffness: 460, damping: 15 }}
      >
        {/* Glow behind the creature on a reaction */}
        {reacting && !reduce && (
          <motion.div
            className="absolute inset-0 rounded-full bg-highlight/30 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          />
        )}

        {/* Inner wrapper: continuous breathing, scaling up from the feet so the
            body visibly swells and settles. Independent of the reaction above. */}
        <motion.div
          style={{ width: "100%", height: "100%", transformOrigin: "50% 86%" }}
          animate={reduce ? undefined : { scale: [1, 1.05, 1], y: [0, -1.5, 0] }}
          transition={reduce ? undefined : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="96" height="96" viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="Your companion">
            <defs>
              <radialGradient id="cBody" cx="36%" cy="28%" r="80%">
                <stop offset="0%" stopColor="#46cdd0" />
                <stop offset="100%" stopColor="#0b727a" />
              </radialGradient>
              <radialGradient id="cLeaf" cx="40%" cy="25%" r="85%">
                <stop offset="0%" stopColor="#7ed79a" />
                <stop offset="100%" stopColor="#3fa86b" />
              </radialGradient>
            </defs>

            {/* Ground shadow */}
            <ellipse cx={C} cy={87} rx={19} ry={3.6} fill="#001a24" opacity="0.18" />

            {/* Growth ring (static), filling from the top */}
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

            {/* Feet (behind body) */}
            <ellipse cx={C - 9} cy={79} rx={6} ry={4} fill="#0a6b73" />
            <ellipse cx={C + 9} cy={79} rx={6} ry={4} fill="#0a6b73" />

            {/* Growth sprout on top — stem + two leaves */}
            <path d={`M ${C} 30 Q ${C - 1} 22 ${C + 0.5} 16`} fill="none" stroke="#2f9e6a" strokeWidth="2.4" strokeLinecap="round" />
            <ellipse cx={C - 4.5} cy={16} rx={5} ry={3} transform={`rotate(-35 ${C - 4.5} 16)`} fill="url(#cLeaf)" />
            <ellipse cx={C + 4} cy={13.5} rx={4.2} ry={2.6} transform={`rotate(30 ${C + 4} 13.5)`} fill="url(#cLeaf)" />

            {/* Arms (behind body so they read as attached) */}
            <ellipse cx={C - 23} cy={58} rx={4} ry={7.5} transform={`rotate(24 ${C - 23} 58)`} fill="#179098" />
            <ellipse cx={C + 23} cy={58} rx={4} ry={7.5} transform={`rotate(-24 ${C + 23} 58)`} fill="#179098" />

            {/* Body */}
            <ellipse cx={C} cy={54} rx={24} ry={25} fill="url(#cBody)" />
            {/* Gloss highlight */}
            <ellipse cx={C - 8} cy={42} rx={8} ry={5} fill="#ffffff" opacity="0.20" />
            {/* Belly patch */}
            <ellipse cx={C} cy={61} rx={14} ry={15} fill="#d8f3f1" opacity="0.85" />

            {/* Cheeks — fade in on a reaction */}
            <g style={{ transition: "opacity .3s ease", opacity: reacting ? 1 : 0 }} aria-hidden="true">
              <circle cx={C - 15} cy={56} r="3.4" fill="#ff9aa2" opacity="0.6" />
              <circle cx={C + 15} cy={56} r="3.4" fill="#ff9aa2" opacity="0.6" />
            </g>

            {/* Eyes — happy arcs on a win, a thin line on a blink, else round
                with a living catch-light. */}
            {reacting ? (
              <>
                <path d={`M ${C - EYE_DX - 4} ${EYE_Y + 1.5} Q ${C - EYE_DX} ${EYE_Y - 3.5} ${C - EYE_DX + 4} ${EYE_Y + 1.5}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
                <path d={`M ${C + EYE_DX - 4} ${EYE_Y + 1.5} Q ${C + EYE_DX} ${EYE_Y - 3.5} ${C + EYE_DX + 4} ${EYE_Y + 1.5}`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
              </>
            ) : eyesClosed ? (
              <>
                <line x1={C - EYE_DX - 3.5} y1={EYE_Y} x2={C - EYE_DX + 3.5} y2={EYE_Y} stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
                <line x1={C + EYE_DX - 3.5} y1={EYE_Y} x2={C + EYE_DX + 3.5} y2={EYE_Y} stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx={C - EYE_DX} cy={EYE_Y} r="4" fill={INK} />
                <circle cx={C + EYE_DX} cy={EYE_Y} r="4" fill={INK} />
                <circle cx={C - EYE_DX - 1.3} cy={EYE_Y - 1.5} r="1.3" fill="#ffffff" opacity="0.92" />
                <circle cx={C + EYE_DX - 1.3} cy={EYE_Y - 1.5} r="1.3" fill="#ffffff" opacity="0.92" />
              </>
            )}

            {/* Mouth — fuller, warmer on a reaction; a small content one at rest. */}
            <path
              d={
                reacting
                  ? `M ${C - 6} 62 Q ${C} 70 ${C + 6} 62`
                  : `M ${C - 4} 63 Q ${C} 66 ${C + 4} 63`
              }
              fill="none"
              stroke={INK}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* One short, restrained line — present during a reaction, idle text else. */}
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
