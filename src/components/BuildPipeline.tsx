"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./motion/useReducedMotion";

// How this site gets from an idea to production, played on a loop.
// Each step lights up in turn and prints a line to the mini terminal.
const steps = [
  { label: "Brief", sub: "What to build and why", log: '> brief: "add a Run the agent demo"' },
  { label: "Agent", sub: "Claude Code writes the change", log: "claude: editing AgentDemo.tsx…" },
  { label: "Review", sub: "Preview and check locally", log: "npm run dev → localhost:3000 ✓" },
  { label: "Push", sub: "Commit to GitHub", log: "$ git push origin main" },
  { label: "Build", sub: "Vercel builds the site", log: "▲ vercel: building…" },
  { label: "Live", sub: "About 30 seconds later", log: "✓ haolinsun.vercel.app is live" },
];
const last = steps.length - 1;

export default function BuildPipeline() {
  const [active, setActive] = useState(-1);
  const [onScreen, setOnScreen] = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !onScreen || paused) return;
    const delay = active === last ? 2600 : active < 0 ? 500 : 950;
    const t = setTimeout(() => setActive((a) => (a >= last ? -1 : a + 1)), delay);
    return () => clearTimeout(t);
  }, [active, onScreen, paused, reduced]);

  // With reduced motion, show the finished pipeline and no loop.
  const current = reduced ? last : active;
  const log = current >= 0 ? steps[current].log : "waiting for a brief…";
  const progress = current < 0 ? 0 : current / last;

  return (
    <div
      className={`pipe${current === last ? " is-live" : ""}`}
      ref={ref}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <p className="pipe-title">
        <span>How this site ships</span>
        <span className="pipe-hint">{paused && !reduced ? "paused" : ""}</span>
      </p>
      <ol className="pipe-steps" style={{ "--progress": progress } as React.CSSProperties}>
        {steps.map((s, i) => (
          <li
            key={s.label}
            className={`pipe-step${i < current ? " is-done" : ""}${i === current ? " is-active" : ""}`}
            aria-current={i === current ? "step" : undefined}
          >
            <span className="pipe-node" aria-hidden="true">
              {i < current || (i === current && i === last) ? "✓" : i + 1}
            </span>
            <span className="pipe-text">
              <strong>{s.label}</strong>
              <span>{s.sub}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="pipe-term" aria-live="off">
        <span className="pipe-term-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <code key={current}>{log}</code>
      </div>
    </div>
  );
}
