import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getTodayCount, subscribe } from "@/lib/winMoment";

// Win-moment companion: an illustrated little creature that rests with a slow,
// subtle breath, gives a soft smile on arrival, and breaks into a grin when you
// complete something — then settles back. A slim bar tracks today's progress.
// Pleased, not hyped: a gentle hop and soft glow, no confetti, no streaks, never
// shows remaining work.
//
// The art lives in /public/companion as three aligned poses cut from the same
// body, so beats simply cross-fade the expression:
//   soft  — resting / breathing idle (and, later, the day-end sigh)
//   smile — the greeting on open (and, later, a subtask completed)
//   grin  — a completion win (and, later, the whole-task little dance)
// Tier-aware events (subtask vs task vs "done for today") aren't emitted yet;
// when winMoment carries an event type, `pose` can branch on it. All motion
// gates on useReducedMotion (the pose still changes; only the fade is dropped).

const RING_TARGET = 8; // today's bar reads "full" at this many completions
const LINES = ["Nice.", "That's one done.", "Good move.", "Onward.", "Mm — well done.", "There you go."];

/** Aligned poses, cut from the same body so they cross-fade cleanly. */
const POSES = {
  soft: "/companion/creature_soft.svg",
  smile: "/companion/creature_smile.svg",
  grin: "/companion/creature_grin.svg",
};

/** @param {number} count @returns {number} 0..1 */
const fillFor = (count) => Math.min(count / RING_TARGET, 1);

export default function Companion() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(() => getTodayCount());
  const [line, setLine] = useState(null);
  const [reacting, setReacting] = useState(false);
  const [greeting, setGreeting] = useState(true); // soft smile on arrival, then settles
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

  // The greeting smile settles into the resting pose shortly after arrival.
  useEffect(() => {
    const t = setTimeout(() => setGreeting(false), 2200);
    return () => clearTimeout(t);
  }, []);

  const fill = fillFor(count);

  // Pose priority: a completion win > the arrival greeting > resting.
  const pose = reacting ? "grin" : greeting ? "smile" : "soft";

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

        {/* Ground-contact shadow — grounds the creature for depth. Static (does
            not breathe), sits BEHIND the creature (z-0 vs the creature's z-10). */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-0"
          style={{ bottom: -2, width: 58, height: 14, borderRadius: "50%", background: "rgba(0,5,12,0.9)", filter: "blur(5px)" }}
        />

        {/* Slow, subtle breath — a gentle vertical swell anchored at the feet.
            z-10 keeps the creature painting above the ground shadow. */}
        <motion.div
          className="relative w-full h-full z-10"
          style={{
            transformOrigin: "50% 92%",
            filter: "drop-shadow(0 0 16px rgba(105,196,210,0.18))",
          }}
          animate={reduce ? undefined : { scaleX: [1, 1.012, 1], scaleY: [1, 1.03, 1], y: [0, -1, 0] }}
          transition={reduce ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Three aligned poses stacked; the active one fades in. Rendering all
              three keeps them preloaded, so a beat never flashes an unloaded SVG. */}
          {Object.entries(POSES).map(([key, src]) => {
            const active = key === pose;
            return (
              <img
                key={key}
                src={src}
                alt={active ? "Your companion" : ""}
                aria-hidden={active ? undefined : "true"}
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                style={{ opacity: active ? 1 : 0, transition: reduce ? undefined : "opacity .45s ease" }}
              />
            );
          })}
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
