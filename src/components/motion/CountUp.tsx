"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./useReducedMotion";

const NUM = /\d[\d,]*(?:\.\d+)?/g;

// Counts every number in `value` up to its final value, keeping the rest of
// the text ("~$", "M", "%") as is. For "before → after" values the count runs
// from the first number to the second, so "25% → 62%" climbs from 25 to 62.
function render(value: string, t: number) {
  const first = value.match(NUM)?.[0];
  const base = value.includes("→") && first ? parseFloat(first.replace(/,/g, "")) : 0;
  return value.replace(NUM, (m) => {
    const decimals = m.includes(".") ? m.split(".")[1].length : 0;
    const target = parseFloat(m.replace(/,/g, ""));
    const n = base + (target - base) * t;
    return n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: m.includes(","),
    });
  });
}

export default function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [t, setT] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    setT(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now() + 300;
        const tick = (now: number) => {
          const p = Math.min(1, Math.max(0, (now - start) / duration));
          setT(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration]);

  return (
    <span ref={ref} className="count">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{render(value, t)}</span>
    </span>
  );
}
