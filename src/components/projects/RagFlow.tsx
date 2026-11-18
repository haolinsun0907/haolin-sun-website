"use client";

import { Typed, VizHead, useTimeline } from "./timeline";

// RAG in one loop: a document splits into chunks, the chunks fly into the
// vector store as points, a question lands among them, the nearest three
// light up with their scores, and the answer cites them.
const stages = ["Load", "Split", "Embed", "Ask", "Retrieve", "Answer"];
const durations = [900, 1200, 1600, 1500, 1900, 3600];

// Chunk widths (as % of the doc) and where each chunk's vector lands.
const chunks = [
  { w: 92, x: 20, y: 30 },
  { w: 78, x: 55, y: 30 },
  { w: 86, x: 86, y: 22 },
  { w: 70, x: 75, y: 64 },
  { w: 88, x: 46, y: 66 },
  { w: 60, x: 24, y: 76 },
];
// Nearest chunks to the question, best first, with cosine scores.
// side: where the score label sits next to its point.
const hits = [
  { chunk: 1, score: "0.86", side: "right" },
  { chunk: 3, score: "0.81", side: "below" },
  { chunk: 4, score: "0.77", side: "left" },
];
const query = { x: 62, y: 47 };
// Vectors already in the store from other documents.
const others = [
  [9, 12], [36, 13], [68, 9], [93, 42], [89, 85], [61, 88], [36, 90], [7, 56], [31, 50], [13, 90], [94, 9],
];

const question = "Why was my refund rejected within 7 days?";
const answer = "Refunds inside 7 days need usage under 20% of the quota ";

export default function RagFlow() {
  const { ref, step, cycle, paused, hover } = useTimeline(durations);
  const at = (n: number) => step >= n;
  const hitOf = (i: number) => hits.findIndex((h) => h.chunk === i);

  return (
    <div
      ref={ref}
      {...hover}
      className="viz viz-rag"
      role="img"
      aria-label="Animation: a document is split into chunks and embedded into Milvus; a question retrieves the three closest chunks, which the answer cites."
    >
      <VizHead title="knowledge.txt → Milvus" stages={stages} current={step} paused={paused} />

      <div key={cycle} className="rag-body" aria-hidden="true">
        <div className={`rag-doc${at(1) ? " is-split" : ""}${at(2) ? " is-sent" : ""}`}>
          {chunks.map((c, i) => (
            <span
              key={i}
              className={`rag-chunk${at(4) && hitOf(i) >= 0 ? " is-hit" : ""}`}
              style={{ "--w": `${c.w}%`, "--i": i } as React.CSSProperties}
            >
              <b>#{i + 1}</b>
            </span>
          ))}
        </div>

        <div className="rag-beam" aria-hidden="true">
          <span className={at(2) && !at(3) ? "is-on" : undefined} />
        </div>

        <div className={`rag-space${at(4) ? " is-searching" : ""}`}>
          <span className="rag-space-label">vector space · cosine</span>
          {others.map(([x, y], i) => (
            <i key={`o${i}`} className="rag-pt rag-pt-old" style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
          {chunks.map((c, i) => {
            const h = hitOf(i);
            return (
              <i
                key={`c${i}`}
                className={`rag-pt rag-pt-new${at(2) ? " is-in" : ""}${at(4) && h >= 0 ? " is-hit" : ""}`}
                style={{ left: `${c.x}%`, top: `${c.y}%`, "--i": i } as React.CSSProperties}
              >
                {at(4) && h >= 0 && (
                  <span className={`rag-score is-${hits[h].side}`} style={{ "--i": h } as React.CSSProperties}>
                    <span className="rag-score-id">#{i + 1} · </span>
                    {hits[h].score}
                  </span>
                )}
              </i>
            );
          })}

          <svg className="rag-links" viewBox="0 0 100 100" preserveAspectRatio="none">
            {at(4) &&
              hits.map((h, k) => (
                <line
                  key={h.chunk}
                  x1={query.x}
                  y1={query.y}
                  x2={chunks[h.chunk].x}
                  y2={chunks[h.chunk].y}
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                  style={{ "--i": k } as React.CSSProperties}
                />
              ))}
          </svg>
          {at(3) && <i className="rag-query" style={{ left: `${query.x}%`, top: `${query.y}%` }} />}
          {at(4) && <i className="rag-radar" style={{ left: `${query.x}%`, top: `${query.y}%` }} />}
        </div>
      </div>

      <div className="rag-chat" aria-hidden="true">
        <p className={`rag-q${at(3) ? " is-on" : ""}`}>
          <Typed text={question} on={at(3)} />
        </p>
        <p className={`rag-a${at(5) ? " is-on" : ""}`}>
          <Typed text={answer} on={at(5)} speed={22} />
          {at(5) && (
            <span className="rag-cites">
              {hits.map((h, k) => (
                <span key={h.chunk} style={{ "--i": k } as React.CSSProperties}>
                  {h.chunk + 1}
                </span>
              ))}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
