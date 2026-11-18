"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../motion/useReducedMotion";

// Plays a scene step by step, on a loop, while it is on screen.
// durations[i] is how long step i stays up before the next one.
// Hovering pauses. With reduced motion the scene holds on its last step,
// which shows the finished picture.
export function useTimeline(durations: number[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const last = durations.length - 1;

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setOnScreen(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !onScreen || paused) return;
    const t = setTimeout(() => {
      if (step >= last) {
        setStep(0);
        setCycle((c) => c + 1);
      } else {
        setStep(step + 1);
      }
    }, durations[step]);
    return () => clearTimeout(t);
    // durations is a constant per scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, onScreen, paused, reduced, last]);

  return {
    ref,
    step: reduced ? last : step,
    cycle,
    // Has been on screen at least once (always true with reduced motion)
    seen: seen || reduced,
    reduced,
    paused: paused && !reduced,
    hover: {
      onPointerEnter: () => setPaused(true),
      onPointerLeave: () => setPaused(false),
    },
  };
}

// Text that types itself out once `on` turns true. The untyped part keeps
// its space (invisible), so nothing around it jumps while it types.
export function Typed({ text, on, speed = 28 }: { text: string; on: boolean; speed?: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!on) {
      setN(0);
      return;
    }
    if (reduced) {
      setN(text.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(text.length, i + 1 + Math.floor(Math.random() * 2));
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [on, text, reduced, speed]);

  return (
    <>
      {text.slice(0, n)}
      {on && n < text.length && <span className="caret caret-typing" />}
      <span className="stream-rest">{text.slice(n)}</span>
    </>
  );
}

// Title bar shared by the project scenes: name on the left, a segmented
// progress bar with the current stage's name on the right.
export function VizHead({
  title,
  stages,
  current,
  paused,
}: {
  title: string;
  stages: string[];
  current: number;
  paused: boolean;
}) {
  return (
    <div className="viz-head">
      <span className="viz-title">{title}</span>
      <span className="viz-stage">
        <span className="viz-stage-name">{paused ? "paused" : stages[current]}</span>
        <span className="viz-segs" aria-hidden="true">
          {stages.map((_, i) => (
            <i key={i} className={i < current ? "is-done" : i === current ? "is-now" : undefined} />
          ))}
        </span>
      </span>
    </div>
  );
}
