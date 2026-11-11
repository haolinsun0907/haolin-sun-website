"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "./useReducedMotion";

// Page-wide effects that work off plain attributes, so server components
// can opt in without becoming client components:
//   data-reveal     fades and slides the element in when it scrolls into view
//                   (stagger with style --i: 0, 1, 2…)
//   data-spotlight  soft glow that follows the cursor, plus a slight 3D tilt
export default function MotionRoot() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    // Reveal on scroll
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io?.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      els.forEach((el) => io?.observe(el));
    } else {
      els.forEach((el) => el.classList.add("is-in"));
    }

    // Cursor spotlight and tilt (mouse and trackpad only)
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const tilt = !prefersReducedMotion();
    let current: HTMLElement | null = null;

    const reset = (el: HTMLElement) => {
      el.classList.remove("is-lit");
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    };

    const onMove = (ev: PointerEvent) => {
      const target = ev.target instanceof Element ? ev.target : null;
      const el = target?.closest<HTMLElement>("[data-spotlight]") ?? null;
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.classList.add("is-lit");
      if (tilt) {
        el.style.setProperty("--rx", `${((y / r.height - 0.5) * -4).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${((x / r.width - 0.5) * 4).toFixed(2)}deg`);
      }
    };

    const onLeave = () => {
      if (current) reset(current);
      current = null;
    };

    if (finePointer) {
      document.addEventListener("pointermove", onMove, { passive: true });
      root.addEventListener("pointerleave", onLeave);
    }

    return () => {
      io?.disconnect();
      document.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
