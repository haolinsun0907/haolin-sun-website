import { ImageResponse } from "next/og";
import { profile, stats } from "../content/profile";

// The preview image shown when the site's link is shared (LinkedIn, Slack,
// iMessage…). Generated at build time from profile.ts.

export const alt = `${profile.name} · ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bg = "#0e1116";
const ink = "#e7eaee";
const muted = "#9aa4b2";
const accent = "#8fb3e0";
const highlight = "#7cc6a0";

// Same idea as the hero background: a graph of sources. A fixed seed keeps
// the picture identical on every build.
function network() {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const nodes = Array.from({ length: 46 }, () => ({
    x: 560 + rand() * 640,
    y: rand() * 630,
    r: 2 + rand() * 2.5,
    doc: rand() < 0.2,
  }));
  const edges: [number, number, number][] = [];
  nodes.forEach((a, i) =>
    nodes.forEach((b, j) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (j > i && d < 140) edges.push([i, j, d]);
    }),
  );
  return { nodes, edges };
}

export default function Image() {
  const { nodes, edges } = network();
  const lit = new Set([3, 9, 14, 22, 31]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: bg,
          color: ink,
          fontFamily: "sans-serif",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          {edges.map(([i, j, d]) => (
            <line
              key={`${i}-${j}`}
              x1={nodes[i].x}
              y1={nodes[i].y}
              x2={nodes[j].x}
              y2={nodes[j].y}
              stroke={lit.has(i) || lit.has(j) ? accent : muted}
              strokeOpacity={(1 - d / 140) * (lit.has(i) || lit.has(j) ? 0.7 : 0.3)}
              strokeWidth={1.4}
            />
          ))}
          {nodes.map((n, i) =>
            n.doc ? (
              <rect
                key={i}
                x={n.x - n.r * 1.3}
                y={n.y - n.r * 1.3}
                width={n.r * 2.6}
                height={n.r * 2.6}
                fill={lit.has(i) ? highlight : muted}
                fillOpacity={lit.has(i) ? 1 : 0.6}
              />
            ) : (
              <circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={lit.has(i) ? n.r + 2 : n.r}
                fill={lit.has(i) ? highlight : muted}
                fillOpacity={lit.has(i) ? 1 : 0.6}
              />
            ),
          )}
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            width: 760,
            position: "relative",
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 4, color: accent, fontWeight: 700 }}>
            {`${profile.title} · ${profile.location}`.toUpperCase()}
          </div>
          <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, marginTop: 14 }}>{profile.name}</div>
          <div style={{ fontSize: 34, color: muted, marginTop: 6 }}>{profile.tagline}</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 48,
              padding: "22px 28px",
              borderRadius: 18,
              border: "1px solid #252c36",
              background: "#151a21",
              width: 620,
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 800, color: accent }}>{stats[0].value}</div>
            <div style={{ fontSize: 24, color: muted, marginTop: 4 }}>
              {`${stats[0].label} · production LLM agent`}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
