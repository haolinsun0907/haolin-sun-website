"use client";

import { useEffect, useRef, useState } from "react";
import { cheetahTask } from "../content/demo";
import { prefersReducedMotion } from "./motion/useReducedMotion";

// Half-Cheetah Task 3 from the paper, animated. A 2D "half cheetah" (two legs,
// six joints: hip, knee and foot on each) runs the route A → B → C → B → C → D.
// The reward machine strip underneath shows which subgoal (RM state) is active.
// "Final goal only" shows the same robot without a reward machine: with reward
// only at D it has no guidance and mostly wanders.

const seq = cheetahTask.sequence;
const GROUND = 150;
const HIP_H = 49;

// Track layout for a scene `w` units wide. Phones get a narrower scene so the
// robot and labels are drawn larger relative to the screen.
function layout(w: number) {
  const X: Record<string, number> = { A: 0.11 * w, B: 0.36 * w, C: 0.64 * w, D: 0.9 * w };
  const start = 0.235 * w;
  return {
    w,
    X,
    start,
    vmax: 0.2 * w, // scene units per second
    segments: seq.map((t, i) => ({ from: i === 0 ? start : X[seq[i - 1]], to: X[t] })),
  };
}
const WIDE = layout(800);
const NARROW = layout(440);

type Mode = "rm" | "goal";

// Leg forward kinematics. Angles are measured from straight down,
// positive pointing toward the head.
function leg(hx: number, hy: number, angles: number[], lengths: number[]) {
  const pts = [[hx, hy]];
  let t = 0;
  angles.forEach((a, i) => {
    t += a;
    const [px, py] = pts[pts.length - 1];
    pts.push([px + lengths[i] * Math.sin(t), py + lengths[i] * Math.cos(t)]);
  });
  return pts;
}

function pose(phase: number, moving: number) {
  const s = (o: number) => Math.sin(phase + o) * moving;
  // Back leg bends backward at the knee, front leg forward, like the
  // MuJoCo half-cheetah. The two legs swing in opposite phase.
  const back = leg(-38, 3, [-0.55 + 0.42 * s(0), 1.15 + 0.3 * s(1.0), -0.9 + 0.25 * s(2.0)], [22, 22, 13]);
  const front = leg(36, 3, [0.45 + 0.42 * s(Math.PI), -0.95 + 0.3 * s(Math.PI + 1.0), 1.25 + 0.25 * s(Math.PI + 2.0)], [22, 22, 10]);
  return { back, front, bob: 2.5 * Math.sin(phase * 2) * moving, tilt: 2.5 * Math.sin(phase) * moving };
}

const fmt = (pts: number[][]) => pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");

export default function CheetahTask() {
  const [mode, setMode] = useState<Mode>("rm");
  const [idx, setIdx] = useState(0); // current RM state; seq.length means finished
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const [still, setStill] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const L = narrow ? NARROW : WIDE;
  const { X, start: START, segments } = L;

  const wrap = useRef<HTMLDivElement>(null);
  const body = useRef<SVGGElement>(null);
  const flip = useRef<SVGGElement>(null);
  const backLeg = useRef<SVGPolylineElement>(null);
  const frontLeg = useRef<SVGPolylineElement>(null);
  const joints = useRef<(SVGCircleElement | null)[]>([]);

  // Simulation state lives in a ref so the frame loop doesn't re-render React
  const sim = useRef({ x: START, dir: -1, phase: 0, idx: 0, wait: 0, hold: 0, wanderTo: START, wanderT: 0, t: 0 });

  const draw = (x: number, dir: number, phase: number, moving: number) => {
    const p = pose(phase, moving);
    body.current?.setAttribute("transform", `translate(${x.toFixed(1)} ${(GROUND - HIP_H + p.bob).toFixed(1)})`);
    flip.current?.setAttribute("transform", `scale(${dir} 1) rotate(${p.tilt.toFixed(2)})`);
    backLeg.current?.setAttribute("points", fmt(p.back));
    frontLeg.current?.setAttribute("points", fmt(p.front));
    [...p.back.slice(0, 3), ...p.front.slice(0, 3)].forEach(([cx, cy], i) => {
      joints.current[i]?.setAttribute("cx", cx.toFixed(1));
      joints.current[i]?.setAttribute("cy", cy.toFixed(1));
    });
  };

  const reset = (m: Mode) => {
    sim.current = { x: START, dir: -1, phase: 0, idx: 0, wait: 0.6, hold: 0, wanderTo: START, wanderT: 0, t: 0 };
    setIdx(0);
    draw(START, m === "rm" ? -1 : 1, 0, 0);
  };

  useEffect(() => {
    setStill(prefersReducedMotion());
    const mq = window.matchMedia("(max-width: 560px)");
    const onMq = () => setNarrow(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // Reduced motion: show the finished task as a still picture
  useEffect(() => {
    if (!still) return;
    if (mode === "rm") {
      setIdx(seq.length);
      draw(X.D, 1, 0, 0);
    } else {
      setIdx(0);
      draw(START + 40, 1, 0, 0);
    }
  }, [still, mode, narrow]);

  useEffect(() => {
    if (!prefersReducedMotion()) reset(mode);
  }, [mode, narrow]);

  useEffect(() => {
    if (still || !playing || !onScreen) return;
    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      s.t += dt;
      let target: number;

      if (mode === "rm") {
        if (s.idx >= seq.length) {
          // Finished: hold on the reward, then run it again
          s.hold += dt;
          draw(s.x, s.dir, s.phase, 0);
          if (s.hold > 2.8) reset(mode);
          raf = requestAnimationFrame(step);
          return;
        }
        target = X[seq[s.idx]];
      } else {
        // No reward machine: pick a new random heading every so often
        s.wanderT -= dt;
        if (s.wanderT <= 0) {
          s.wanderTo = X.A + 20 + Math.random() * (X.B + 0.1 * L.w - X.A);
          s.wanderT = 0.7 + Math.random() * 1.2;
        }
        target = s.wanderTo;
        if (s.t > 11) reset(mode);
      }

      if (s.wait > 0) {
        s.wait -= dt;
        draw(s.x, s.dir, s.phase, 0);
        raf = requestAnimationFrame(step);
        return;
      }

      const dist = target - s.x;
      const vmax = mode === "rm" ? L.vmax : L.vmax * 0.55;
      const v = Math.min(vmax, Math.abs(dist) * 4 + 30);
      const move = Math.sign(dist) * Math.min(Math.abs(dist), v * dt);
      if (Math.abs(dist) > 0.5) s.dir = dist > 0 ? 1 : -1;
      s.x += move;
      s.phase += Math.abs(move) * 0.11;
      const moving = Math.min(1, v / 60);

      if (mode === "rm" && Math.abs(target - s.x) < 0.6) {
        s.idx += 1;
        s.wait = s.idx >= seq.length ? 0 : 0.35;
        setIdx(s.idx);
      }

      draw(s.x, s.dir, s.phase, Math.abs(dist) > 0.5 ? moving : 0);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mode, playing, onScreen, still, narrow]);

  const done = mode === "rm" && idx >= seq.length;
  const current = mode === "rm" && !done ? seq[idx] : null;
  const caption =
    mode === "goal"
      ? "Reward only at D. With no subgoals to guide it, the robot gets no signal until it happens to reach D, so early training is mostly aimless exploration."
      : done
        ? `Reached D: the reward machine pays ${cheetahTask.reward}. Task complete.`
        : `Subgoal ${idx + 1} of ${seq.length}: run to ${current}. The reward machine is in state u${idx}.`;

  return (
    <div className="cheetah" ref={wrap} data-reveal>
      <div className="cheetah-head">
        <div>
          <p className="eyebrow">The paper in one picture · Half-Cheetah, Task 3</p>
          <p className="cheetah-task">
            The robot must touch <b>A</b>, then <b>B</b>, <b>C</b>, back to <b>B</b>, <b>C</b> again, and finish at{" "}
            <b>D</b>. A reward machine turns that into a checklist of six subgoals, so it always knows what comes next.
          </p>
        </div>
        <div className="cheetah-controls">
          <div className="seg" role="group" aria-label="Compare">
            <button type="button" aria-pressed={mode === "rm"} onClick={() => setMode("rm")}>
              With reward machine
            </button>
            <button type="button" aria-pressed={mode === "goal"} onClick={() => setMode("goal")}>
              Final goal only
            </button>
          </div>
          {!still && (
            <button type="button" className="btn btn-small btn-ghost" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </button>
          )}
        </div>
      </div>

      <svg
        className="cheetah-stage"
        viewBox={`0 0 ${L.w} 200`}
        role="img"
        aria-label="A two-legged half-cheetah robot running between points A, B, C and D on a track."
      >
        <line x1="12" x2={L.w - 12} y1={GROUND} y2={GROUND} className="ch-ground" />

        {/* Points A–D */}
        {Object.entries(X).map(([k, x]) => (
          <g
            key={k}
            className={`ch-mark${current === k ? " is-target" : ""}${done && k === "D" ? " is-goal" : ""}${mode === "goal" && k === "D" ? " is-target" : ""}`}
          >
            <line x1={x} x2={x} y1="34" y2={GROUND} />
            <circle cx={x} cy="24" r="13" />
            <text x={x} y="29">
              {k}
            </text>
          </g>
        ))}
        <text x={START} y={GROUND + 16} className="ch-start">
          start
        </text>

        {/* Route: one lane per subgoal, lit once completed */}
        {mode === "rm" &&
          segments.map((sg, i) => (
            <line
              key={i}
              x1={sg.from}
              x2={sg.to}
              y1={GROUND + 26 + i * 4.5}
              y2={GROUND + 26 + i * 4.5}
              className={`ch-lane${i < idx ? " is-done" : ""}${i === idx ? " is-now" : ""}`}
            />
          ))}

        {/* The robot */}
        <g ref={body}>
          <ellipse cx="0" cy={HIP_H + 2} rx="40" ry="3.5" className="ch-shadow" />
          <g ref={flip}>
            <polyline ref={backLeg} className="ch-leg" />
            <polyline ref={frontLeg} className="ch-leg" />
            <line x1="-44" y1="0" x2="40" y2="0" className="ch-torso" />
            <path d="M40 0 L52 -9" className="ch-neck" />
            <circle cx="55" cy="-11" r="6" className="ch-headball" />
            {Array.from({ length: 6 }, (_, i) => (
              <circle
                key={i}
                r="3.2"
                className="ch-joint"
                ref={(el) => {
                  joints.current[i] = el;
                }}
              />
            ))}
          </g>
        </g>

        {done && (
          <text x={X.D} y="70" className="ch-reward">
            +{cheetahTask.reward}
          </text>
        )}
      </svg>

      {mode === "rm" ? (
        <ol className="rm-strip" aria-label="Reward machine states">
          {seq.map((t, i) => (
            <li key={i} className={i < idx ? "is-done" : i === idx ? "is-now" : undefined}>
              <span>
                u<sub>{i}</sub>
              </span>
              <small>to {t}</small>
            </li>
          ))}
          <li className={`rm-final${done ? " is-done" : ""}`}>
            <span>+{cheetahTask.reward}</span>
            <small>done</small>
          </li>
        </ol>
      ) : (
        <div className="rm-strip rm-none">
          <span>One goal, no subgoals: reach D for {cheetahTask.reward}.</span>
        </div>
      )}

      <p className="cheetah-caption">{caption}</p>
      <p className="cheetah-foot muted">
        Six joints, continuous actions: at every step the agent picks a torque for each joint. Animation is a simplified
        illustration of the task, not recorded training footage.
      </p>
    </div>
  );
}
