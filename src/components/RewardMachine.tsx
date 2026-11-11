"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { rewardMachine } from "../content/demo";
import { useReducedMotion } from "./motion/useReducedMotion";

const { task, states, edges } = rewardMachine;
const last = states.length - 1;

// Walks through a small reward machine one transition at a time.
// Plays on its own while on screen; click a state to jump there.
export default function RewardMachine() {
  const [cur, setCur] = useState(0);
  const [fired, setFired] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [onScreen, setOnScreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const advance = () => {
    const next = (cur + 1) % states.length;
    setFired(next === 0 ? null : cur);
    setCur(next);
  };

  useEffect(() => {
    if (!playing || !onScreen || reduced) return;
    const t = setTimeout(advance, cur === last ? 2800 : 1800);
    return () => clearTimeout(t);
  });

  const auto = playing && !reduced;

  return (
    <div className="rm" ref={ref} data-reveal>
      <div className="rm-head">
        <div>
          <p className="eyebrow">The idea in one picture</p>
          <p className="rm-task">
            A reward machine for “{task}”. Each state tells the agent which subgoal comes next.
          </p>
        </div>
        <div className="rm-controls">
          <button type="button" className="btn btn-small" onClick={() => setPlaying((p) => !p)} disabled={reduced}>
            {auto ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className="btn btn-small btn-ghost"
            onClick={() => {
              setPlaying(false);
              advance();
            }}
          >
            Step →
          </button>
        </div>
      </div>

      <div className="rm-chain">
        {states.map((s, i) => (
          <Fragment key={s.name}>
            <div className="rm-node">
              <button
                type="button"
                className={`rm-state${i === cur ? " is-current" : ""}${i < cur ? " is-past" : ""}`}
                aria-current={i === cur ? "step" : undefined}
                aria-label={`State u${i}: ${s.name}`}
                onClick={() => {
                  setPlaying(false);
                  setFired(null);
                  setCur(i);
                }}
              >
                u<sub>{i}</sub>
                {i === last && cur === last && (
                  <span className="rm-reward" aria-hidden="true">
                    +1
                  </span>
                )}
              </button>
              <span className="rm-name">{s.name}</span>
            </div>
            {i < edges.length && (
              <div
                className={`rm-edge${i < cur ? " is-done" : ""}${fired === i ? " is-fired" : ""}`}
                aria-hidden="true"
              >
                <span className="rm-line">
                  <span key={fired === i ? `f${cur}` : "idle"} className="rm-token" />
                </span>
                <span className="rm-label">
                  {edges[i].event}
                  <span className={edges[i].reward ? "rm-r is-pos" : "rm-r"}>r = {edges[i].reward}</span>
                </span>
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <p className="rm-note" aria-live="polite">
        <strong>
          u<sub>{cur}</sub> · {states[cur].name}.
        </strong>{" "}
        {states[cur].note}
      </p>
      <p className="rm-foot muted">Illustrative example, not one of the paper’s benchmark tasks.</p>
    </div>
  );
}
