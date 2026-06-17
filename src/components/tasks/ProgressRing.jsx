import React, { useEffect, useRef } from "react";

// Hand-rolled SVG progress ring (no charting library). Radius 26, stroke 6,
// rotated so the arc starts at the top. On reaching 100% from a lower value it
// fires a one-shot pulse plus a light confetti burst via the Web Animations API.
const R = 26;
const STROKE = 6;
const CIRC = 2 * Math.PI * R;
const SIZE = (R + STROKE) * 2;
const CONFETTI_COLOURS = ["#69c4d2", "#7EB5A1", "#00a1a1", "#d4bd8f", "#c4a8c2"];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function ProgressRing({ completed = 0, total = 0 }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const offset = CIRC - (pct / 100) * CIRC;

  const ringRef = useRef(null);
  const burstRef = useRef(null);
  const prevPct = useRef(pct);

  useEffect(() => {
    const was = prevPct.current;
    prevPct.current = pct;

    if (pct !== 100 || was >= 100 || total <= 0 || prefersReducedMotion()) return;

    // One-shot celebration pulse.
    ringRef.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 520, easing: "ease-out" }
    );

    // Light confetti burst from the ring centre.
    const host = burstRef.current;
    if (!host) return;
    const count = 15;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("div");
      const colour = CONFETTI_COLOURS[i % CONFETTI_COLOURS.length];
      dot.style.cssText =
        `position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:9999px;background:${colour};pointer-events:none;`;
      host.appendChild(dot);

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 34 + Math.random() * 26;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const anim = dot.animate(
        [
          { transform: "translate(-50%, -50%) translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 },
        ],
        { duration: 700 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)" }
      );
      anim.onfinish = () => dot.remove();
    }
  }, [pct, total]);

  return (
    <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
      <div ref={burstRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      <svg
        ref={ringRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        role="img"
        aria-label={`${pct} percent complete, ${completed} of ${total} tasks`}
      >
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#0a3a52" strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#69c4d2"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-semibold text-foreground leading-none">{pct}%</span>
        <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}
