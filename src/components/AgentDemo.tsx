"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { agentDemo } from "../content/demo";
import { useReducedMotion } from "./motion/useReducedMotion";

type Line = {
  id: number;
  kind: "think" | "tool" | "done";
  tool?: string;
  text: string;
  result?: string;
  running: boolean;
};

type Phase = "idle" | "running" | "done";

const byId = Object.fromEntries(agentDemo.contacts.map((c) => [c.id, c]));
const toolCalls = agentDemo.steps.filter((s) => s.kind === "tool").length;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A replay of one account lookup: tool calls stream into the trace on the
// left, contacts appear on the right, then get scored and re-ranked.
export default function AgentDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<Line[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [scored, setScored] = useState(false);
  const runId = useRef(0);
  const reduced = useReducedMotion();

  // Positions of each contact row before the latest render, for the
  // re-rank animation (measure, move, then animate the difference away).
  const rows = useRef(new Map<string, HTMLLIElement>());
  const tops = useRef(new Map<string, number>());

  useEffect(() => () => void runId.current++, []);

  // Play once on its own the first time the demo is mostly on screen,
  // so visitors who never press the button still see it work.
  const box = useRef<HTMLDivElement>(null);
  const runRef = useRef<() => void>(() => {});
  const hasRun = useRef(false);
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (!hasRun.current) runRef.current();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    rows.current.forEach((el, id) => {
      const prev = tops.current.get(id);
      const next = el.offsetTop;
      if (prev !== undefined && !reduced && Math.abs(prev - next) > 1) {
        el.animate([{ transform: `translateY(${prev - next}px)` }, { transform: "translateY(0)" }], {
          duration: 650,
          easing: "cubic-bezier(.2,.8,.2,1)",
        });
      }
      tops.current.set(id, next);
    });
  });

  async function run() {
    hasRun.current = true;
    const id = ++runId.current;
    const alive = () => runId.current === id;
    const pace = reduced ? 0.4 : 1;

    tops.current.clear();
    setPhase("running");
    setLines([]);
    setFound([]);
    setScored(false);

    let n = 0;
    for (const step of agentDemo.steps) {
      await wait((step.kind === "tool" ? 450 : 350) * pace);
      if (!alive()) return;
      const lineId = n++;
      const timed = step.result !== undefined;
      setLines((l) => [
        ...l,
        { id: lineId, kind: step.kind, tool: step.tool, text: step.text, running: timed },
      ]);
      if (!timed) continue;

      await wait((step.score ? 1100 : 850) * pace);
      if (!alive()) return;
      setLines((l) => l.map((x) => (x.id === lineId ? { ...x, running: false, result: step.result } : x)));
      for (const c of step.add ?? []) {
        setFound((f) => [...f, c]);
        await wait(180 * pace);
        if (!alive()) return;
      }
      if (step.score) setScored(true);
    }
    setPhase("done");
  }

  runRef.current = run;

  const order = scored ? [...found].sort((a, b) => byId[b].score - byId[a].score) : found;

  return (
    <div className="demo" data-reveal ref={box}>
      <div className="demo-head">
        <div>
          <p className="eyebrow">Try it</p>
          <h3>Watch the agent work one account</h3>
          <p className="muted demo-note">A replay with a fictional company and contacts.</p>
        </div>
        <div className="demo-actions">
          <span className={`demo-status is-${phase}`}>
            <span className="demo-dot" aria-hidden="true" />
            {phase === "idle" ? "Ready" : phase === "running" ? "Running" : `Done · ${toolCalls} tool calls`}
          </span>
          <button
            type="button"
            className={`btn btn-primary demo-run${phase === "idle" ? " is-idle" : ""}`}
            onClick={run}
            disabled={phase === "running"}
          >
            {phase === "idle" ? "Run the agent ▶" : phase === "running" ? "Running…" : "Run again ↻"}
          </button>
        </div>
      </div>

      <div className="demo-body">
        <div className="demo-pane demo-trace-pane">
          <p className="demo-pane-title">Agent trace</p>
          {lines.length === 0 ? (
            <p className="demo-empty">Press “Run the agent” to replay a lookup: search, read sources, rank.</p>
          ) : (
            <ol className="demo-trace" aria-live="polite">
              {lines.map((l) => (
                <li key={l.id} className={`trace-line trace-${l.kind}`}>
                  <span className="trace-icon" aria-hidden="true">
                    {l.running ? <span className="spinner" /> : l.kind === "done" ? "✓" : l.kind === "tool" ? "›" : "◆"}
                  </span>
                  <span>
                    {l.kind === "tool" ? (
                      <>
                        <span className="trace-tool">{l.tool}</span>(<span className="trace-arg">{l.text}</span>)
                      </>
                    ) : (
                      l.text
                    )}
                    {l.result && <span className="trace-result"> → {l.result}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="demo-pane">
          <p className="demo-pane-title">
            Contacts found <span className="demo-count">{found.length}</span>
          </p>
          {found.length === 0 ? (
            <p className="demo-empty">No contacts yet.</p>
          ) : (
            <ul className="demo-list">
              {order.map((cid, i) => {
                const c = byId[cid];
                const top = scored && i === 0;
                return (
                  <li
                    key={cid}
                    ref={(el) => {
                      if (el) rows.current.set(cid, el);
                      else rows.current.delete(cid);
                    }}
                    className={`demo-contact${top ? " is-top" : ""}${scored ? " is-scored" : ""}`}
                  >
                    <span className="demo-rank" aria-hidden="true">
                      {scored ? i + 1 : "·"}
                    </span>
                    <div className="demo-contact-main">
                      <div className="demo-contact-name">
                        <strong>{c.name}</strong>
                        {top && <span className="demo-top">Call first</span>}
                      </div>
                      <span className="muted">
                        {c.role} · {c.source}
                      </span>
                      {scored && <span className="demo-why">{c.why}</span>}
                    </div>
                    <div className="demo-score" aria-label={scored ? `Score ${c.score.toFixed(2)}` : "Not scored yet"}>
                      <span className="demo-score-bar">
                        <span style={{ width: scored ? `${c.score * 100}%` : "0%" }} />
                      </span>
                      <span className="demo-score-num">{scored ? c.score.toFixed(2) : "–"}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
