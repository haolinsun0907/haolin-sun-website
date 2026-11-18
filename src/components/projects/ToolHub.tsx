"use client";

import { Typed, VizHead, useTimeline } from "./timeline";

// The agent sits in the middle of its five tools. For one question it
// chains two of them: a packet flies out to the currency tool, comes back
// with a result, goes to the calculator, and then the answer types out.
const stages = ["Ask", "Plan", "Call", "Result", "Call", "Result", "Answer"];
const durations = [1400, 1100, 900, 1200, 900, 1200, 3400];

const C = { x: 200, y: 104 };
const tools = [
  { id: "weather", label: "weather", x: 62, y: 46, glyph: "°C" },
  { id: "calculator", label: "calculator", x: 338, y: 46, glyph: "÷" },
  { id: "time", label: "time", x: 46, y: 158, glyph: "clock" },
  { id: "currency", label: "currency", x: 354, y: 158, glyph: "$" },
  { id: "search", label: "search", x: 200, y: 180, glyph: "search" },
] as const;
const byId = Object.fromEntries(tools.map((t) => [t.id, t]));

// Which tool each step talks to, and the result it brings back.
const calls: Record<number, { tool: string; back?: string }> = {
  2: { tool: "currency" },
  3: { tool: "currency", back: "720 CNY" },
  4: { tool: "calculator" },
  5: { tool: "calculator", back: "2,160" },
};

const question = "100 USD in CNY, then times 3?";
const answer = "100 USD is about 720 CNY, so times 3 is about 2,160 CNY.";

function Glyph({ g }: { g: string }) {
  if (g === "clock")
    return (
      <g className="hub-glyph-line">
        <circle r="7" />
        <path d="M0 -4 V0 L3 2" />
      </g>
    );
  if (g === "search")
    return (
      <g className="hub-glyph-line">
        <circle r="5" cx="-1.5" cy="-1.5" />
        <path d="M2.5 2.5 L6 6" />
      </g>
    );
  return (
    <text className="hub-glyph" dy="0.35em">
      {g}
    </text>
  );
}

export default function ToolHub() {
  const { ref, step, cycle, seen, paused, hover } = useTimeline(durations);
  const call = calls[step];
  const out = call && !call.back; // packet heading to the tool
  const target = call ? byId[call.tool] : null;
  const packet = out && target ? target : C;
  const used = (id: string) =>
    Object.entries(calls).some(([s, c]) => c.tool === id && c.back && step >= Number(s));

  return (
    <div
      ref={ref}
      {...hover}
      className="viz viz-hub"
      role="img"
      aria-label="Animation: an agent surrounded by five tools answers a question by calling the currency tool and then the calculator."
    >
      <VizHead title="agent · 5 tools" stages={stages} current={step} paused={paused} />

      <p className="hub-q is-on" aria-hidden="true">
        <Typed key={cycle} text={question} on={seen} />
      </p>

      <svg className="hub-svg" viewBox="0 0 400 220" aria-hidden="true">
        <defs>
          <radialGradient id="hub-glow">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {tools.map((t) => (
          <line
            key={t.id}
            className={`hub-edge${target?.id === t.id ? " is-live" : ""}${used(t.id) ? " is-used" : ""}${step === 1 ? " is-scan" : ""}`}
            x1={C.x}
            y1={C.y}
            x2={t.x}
            y2={t.y}
          />
        ))}

        <circle className={`hub-halo${step === 1 || step === 6 ? " is-on" : ""}`} cx={C.x} cy={C.y} r="52" fill="url(#hub-glow)" />
        <circle className={`hub-orbit${step === 1 ? " is-spin" : ""}`} cx={C.x} cy={C.y} r="36" />
        <g className="hub-core" transform={`translate(${C.x} ${C.y})`}>
          <circle r="27" />
          <text dy="0.35em">agent</text>
        </g>

        {tools.map((t) => {
          const live = target?.id === t.id;
          return (
            <g
              key={t.id}
              className={`hub-tool${live ? " is-live" : ""}${used(t.id) ? " is-used" : ""}`}
              transform={`translate(${t.x} ${t.y})`}
            >
              <circle className="hub-tool-ring" r="19" />
              <circle className="hub-tool-dot" r="17" />
              <Glyph g={t.glyph} />
              <text className="hub-label" y={t.y > C.y ? 32 : -26}>
                {t.label}
              </text>
            </g>
          );
        })}

        {Object.entries(calls).map(([s, c]) => {
          if (!c.back || step < Number(s)) return null;
          const t = byId[c.tool];
          return (
            <g key={s} className="hub-result" transform={`translate(${(t.x + C.x) / 2} ${(t.y + C.y) / 2 - 16})`}>
              <g className="hub-result-pop">
                <rect x="-34" y="-11" width="68" height="22" rx="11" />
                <text dy="0.35em">{c.back}</text>
              </g>
            </g>
          );
        })}

        <g className={`hub-packet${call ? " is-on" : ""}${call?.back ? " is-back" : ""}`} style={{ transform: `translate(${packet.x}px, ${packet.y}px)` }}>
          <circle r="9" className="hub-packet-trail" />
          <circle r="5" />
        </g>
      </svg>

      <p className={`hub-a${step >= 6 ? " is-on" : ""}`} aria-hidden="true">
        <Typed text={answer} on={step >= 6} speed={22} />
      </p>
    </div>
  );
}
