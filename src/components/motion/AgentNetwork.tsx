"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./useReducedMotion";

// Hero background: a slowly drifting graph of information sources.
// Round nodes are web pages, square ones documents. Pulses hop along edges
// like an agent's tool calls, and nodes near the cursor link up to it.
// Fills its parent element; the parent must be position: relative.

type Node = { x: number; y: number; vx: number; vy: number; r: number; doc: boolean; glow: number };
type Pulse = { from: number; to: number; t: number; speed: number; hops: number };

const LINK = 130;
const REACH = 170;

export default function AgentNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const still = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let colors = { accent: "#1f3a5f", highlight: "#2f6f4f", muted: "#5b6472" };
    const pointer = { x: 0, y: 0, active: false };
    let raf = 0;
    let running = false;
    let onScreen = true;
    let lastPulse = 0;

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      const get = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
      colors = {
        accent: get("--accent", colors.accent),
        highlight: get("--highlight", colors.highlight),
        muted: get("--muted", colors.muted),
      };
    };

    const seed = () => {
      const count = Math.round(Math.min(72, Math.max(26, (w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1.4 + Math.random() * 1.6,
        doc: Math.random() < 0.18,
        glow: 0,
      }));
      pulses = [];
    };

    const neighbor = (i: number) => {
      const a = nodes[i];
      const near: number[] = [];
      nodes.forEach((b, j) => {
        if (j !== i && Math.hypot(a.x - b.x, a.y - b.y) < LINK) near.push(j);
      });
      return near.length ? near[Math.floor(Math.random() * near.length)] : -1;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      if (!still) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          else if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          else if (n.y > h + 20) n.y = -20;
          const d = pointer.active ? Math.hypot(pointer.x - n.x, pointer.y - n.y) : Infinity;
          if (d < REACH && d > 1) {
            const pull = 0.35 * (1 - d / REACH);
            n.x += ((pointer.x - n.x) / d) * pull;
            n.y += ((pointer.y - n.y) / d) * pull;
            n.glow = Math.min(1, n.glow + 0.08);
          } else {
            n.glow = Math.max(0, n.glow - 0.02);
          }
        }
      }

      // Edges between nearby nodes
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.muted;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.globalAlpha = (1 - d / LINK) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Links to the cursor
      if (pointer.active && !still) {
        ctx.strokeStyle = colors.accent;
        for (const n of nodes) {
          const d = Math.hypot(pointer.x - n.x, pointer.y - n.y);
          if (d < REACH) {
            ctx.globalAlpha = (1 - d / REACH) * 0.55;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        ctx.globalAlpha = 0.5 + n.glow * 0.5;
        ctx.fillStyle = n.glow > 0.05 ? colors.accent : colors.muted;
        const r = n.r + n.glow * 1.5;
        ctx.beginPath();
        if (n.doc) ctx.rect(n.x - r * 1.3, n.y - r * 1.3, r * 2.6, r * 2.6);
        else ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulses hopping along edges
      if (!still) {
        if (now - lastPulse > 900 && pulses.length < 4) {
          lastPulse = now;
          const from = Math.floor(Math.random() * nodes.length);
          const to = neighbor(from);
          if (to >= 0) pulses.push({ from, to, t: 0, speed: 0.012 + Math.random() * 0.01, hops: 0 });
        }
        ctx.fillStyle = colors.highlight;
        pulses = pulses.filter((p) => {
          p.t += p.speed;
          const a = nodes[p.from];
          const b = nodes[p.to];
          if (p.t >= 1) {
            b.glow = 1;
            const next = p.hops < 3 && Math.random() < 0.6 ? neighbor(p.to) : -1;
            if (next < 0) return false;
            p.from = p.to;
            p.to = next;
            p.t = 0;
            p.hops++;
            return true;
          }
          const x = a.x + (b.x - a.x) * p.t;
          const y = a.y + (b.y - a.y) * p.t;
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });
      }

      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || still || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (Math.abs(rect.width - w) < 1 && Math.abs(rect.height - h) < 1) return;
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readColors();
      draw(performance.now());
    };

    readColors();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(host);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onScheme);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", onScheme);
    };
  }, []);

  return <canvas ref={ref} className="hero-net" aria-hidden="true" />;
}
