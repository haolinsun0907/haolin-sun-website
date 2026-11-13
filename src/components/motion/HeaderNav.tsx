"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Item = { href: string; label: string };
type Pill = { left: number; width: number; hidden: boolean };

// Section links with a pill that slides to the section you're reading,
// plus a reading-progress bar along the bottom of the header.
export default function HeaderNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [pill, setPill] = useState<Pill | null>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;

      // Active section: the one crossing a line 40% down the viewport.
      // At the very bottom, the last section wins (the footer is short).
      const line = window.innerHeight * 0.4;
      let next: string | null = null;
      if (max > 0 && y >= max - 2) {
        next = items[items.length - 1]?.href ?? null;
      } else {
        for (const it of items) {
          const r = document.getElementById(it.href.slice(1))?.getBoundingClientRect();
          if (r && r.top <= line && r.bottom > line) {
            next = it.href;
            break;
          }
        }
      }
      setActive(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = active ? links.current.get(active) : null;
      // On phones the links scroll sideways: keep the active one in view.
      const nav = el?.parentElement;
      if (el && nav && nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: el.offsetLeft - (nav.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
      }
      setPill((prev) =>
        el
          ? { left: el.offsetLeft, width: el.offsetWidth, hidden: false }
          : prev && { ...prev, hidden: true },
      );
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <>
      <nav aria-label="Sections" className="nav">
        <span
          className="nav-pill"
          aria-hidden="true"
          style={
            pill
              ? {
                  transform: `translateX(${pill.left - 12}px)`,
                  width: pill.width + 24,
                  opacity: pill.hidden ? 0 : 1,
                }
              : { opacity: 0 }
          }
        />
        {items.map((n) => (
          <a
            key={n.href}
            href={n.href}
            ref={(el) => {
              if (el) links.current.set(n.href, el);
              else links.current.delete(n.href);
            }}
            className={active === n.href ? "is-active" : undefined}
            aria-current={active === n.href ? "location" : undefined}
          >
            {n.label}
          </a>
        ))}
      </nav>
      <div className="scroll-progress" ref={bar} aria-hidden="true" />
    </>
  );
}
