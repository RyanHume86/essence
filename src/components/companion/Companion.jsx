import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getTodayCount, subscribe } from "@/lib/winMoment";

// Win-moment companion: a soft, fluffy, eared creature framed by a growth ring
// that fills with today's completions. ONLY the creature breathes (the ring is a
// static frame); on a completion it hops, its eyes curve happy, cheeks blush,
// and a glow blooms — then it settles back to breathing. One short true line
// accompanies the reaction and self-dismisses (~1.5s). Pleased, not hyped — no
// confetti, no streaks, never shows remaining work.
//
// Design: Calm's "Calmlings" — rounded, plush, gentle. Breathing is a gentle
// chest-rise (mostly vertical, from the feet), not a uniform zoom, so it reads
// as breath rather than growing/shrinking. All motion gates on useReducedMotion.

const VB = 100;
const C = 50;
const R = 42;
const STROKE = 5;
const CIRC = 2 * Math.PI * R;
const RING_TARGET = 8;

const EYE_Y = 53;
const EYE_DX = 8.5;
const INK = "#06323f";

// Fluffy body: a cluster of perimeter "puffs" around a core ellipse reads as fur.
const BODY_CX = 50;
const BODY_CY = 56;
const BODY_RX = 19;
const BODY_RY = 20;
const PUFFS = Array.from({ length: 12 }, (_, i) => {
  const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
  return {
    x: BODY_CX + Math.cos(a) * BODY_RX,
    y: BODY_CY + Math.sin(a) * BODY_RY,
    r: 6.5 + (Math.sin(a) > 0 ? 1.5 : 0), // slightly longer fluff toward the bottom
  };
});
// Long fluffy fur hanging at the bottom.
const TUFTS = [
  { x: 41, y: 73 },
  { x: 50, y: 75 },
  { x: 59, y: 73 },
];

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
      <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
        {/* STATIC layer: ground shadow + growth ring. Does not breathe. */}
        <svg className="absolute inset-0" width="96" height="96" viewBox={`0 0 ${VB} ${VB}`} aria-hidden="true">
          <ellipse cx={C} cy={88} rx={18} ry={3.4} fill="#001a24" opacity="0.18" />
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
        </svg>

        {/* Glow behind the creature on a reaction */}
        {reacting && !reduce && (
          <motion.div
            className="absolute inset-0 rounded-full bg-highlight/20 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            aria-hidden="true"
          />
        )}

        {/* CREATURE layer: reaction hop (outer) wraps the breathing loop (inner).
            Breathing is mostly vertical, anchored near the feet — a chest-rise. */}
        <motion.div
          className="absolute inset-0"
          animate={reduce ? false : { scale: reacting ? 1.035 : 1, y: reacting ? -1.5 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <motion.div
            style={{ width: "100%", height: "100%", transformOrigin: "50% 90%" }}
            animate={reduce ? undefined : { scaleX: [1, 1.007, 1], scaleY: [1, 1.02, 1], y: [0, -0.4, 0] }}
            transition={reduce ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="96" height="96" viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="Your companion">
              <defs>
                <radialGradient id="cBody" cx="36%" cy="26%" r="82%">
                  <stop offset="0%" stopColor="#46cdd0" />
                  <stop offset="100%" stopColor="#0b727a" />
                </radialGradient>
              </defs>

              {/* Long fluffy fur hanging at the bottom (behind body) */}
              {TUFTS.map((p, i) => (
                <ellipse key={`tuft-${i}`} cx={p.x} cy={p.y} rx={5.5} ry={10} fill="#108b93" />
              ))}

              {/* Ears (behind body so the base tucks under the fluff) */}
              <g>
                <ellipse cx={36} cy={30} rx={7} ry={11} transform={`rotate(-16 36 30)`} fill="#15969d" />
                <ellipse cx={36} cy={31} rx={3.4} ry={6} transform={`rotate(-16 36 31)`} fill="#cdeef0" opacity="0.85" />
                <ellipse cx={64} cy={30} rx={7} ry={11} transform={`rotate(16 64 30)`} fill="#15969d" />
                <ellipse cx={64} cy={31} rx={3.4} ry={6} transform={`rotate(16 64 31)`} fill="#cdeef0" opacity="0.85" />
              </g>

              {/* Fur puffs around the perimeter (the fluffy silhouette) */}
              {PUFFS.map((p, i) => (
                <circle key={`puff-${i}`} cx={p.x} cy={p.y} r={p.r} fill="#108b93" />
              ))}

              {/* Body core */}
              <ellipse cx={BODY_CX} cy={BODY_CY} rx={BODY_RX} ry={BODY_RY} fill="url(#cBody)" />
              {/* Gloss highlight */}
              <ellipse cx={BODY_CX - 7} cy={BODY_CY - 11} rx={7} ry={4.5} fill="#ffffff" opacity="0.20" />

              {/* Forehead fur fringe */}
              <g fill="#3bc1c6">
                <ellipse cx={43} cy={41} rx={4} ry={3} />
                <ellipse cx={50} cy={40} rx={4.2} ry={3.2} />
                <ellipse cx={57} cy={41} rx={4} ry={3} />
              </g>

              {/* Belly patch */}
              <ellipse cx={BODY_CX} cy={62} rx={12} ry={13} fill="#d8f3f1" opacity="0.8" />

              {/* Cheeks — fade in on a reaction */}
              <g style={{ transition: "opacity .3s ease", opacity: reacting ? 1 : 0 }} aria-hidden="true">
                <circle cx={C - 13} cy={57} r="3.2" fill="#ff9aa2" opacity="0.4" />
                <circle cx={C + 13} cy={57} r="3.2" fill="#ff9aa2" opacity="0.4" />
              </g>

              {/* Eyes */}
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
                  <circle cx={C - EYE_DX} cy={EYE_Y} r="3.8" fill={INK} />
                  <circle cx={C + EYE_DX} cy={EYE_Y} r="3.8" fill={INK} />
                  <circle cx={C - EYE_DX - 1.2} cy={EYE_Y - 1.4} r="1.2" fill="#ffffff" opacity="0.92" />
                  <circle cx={C + EYE_DX - 1.2} cy={EYE_Y - 1.4} r="1.2" fill="#ffffff" opacity="0.92" />
                </>
              )}

              {/* Mouth */}
              <path
                d={reacting ? `M ${C - 6} 64 Q ${C} 71 ${C + 6} 64` : `M ${C - 4} 65 Q ${C} 68 ${C + 4} 65`}
                fill="none"
                stroke={INK}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>

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
