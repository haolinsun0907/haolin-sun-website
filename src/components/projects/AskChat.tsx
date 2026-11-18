"use client";

import { caseStudy } from "../../content/profile";
import { Typed, VizHead, useTimeline } from "./timeline";

// Two turns with the planned assistant: one it can answer from my own
// material (with sources), and one it refuses to guess at.
const stages = ["Ask", "Search", "Answer", "Ask", "Search", "Refuse"];
const durations = [1100, 1300, 3400, 1100, 1300, 3400];

const before = caseStudy.chart.before;
const after = caseStudy.chart.after;

const turns = [
  {
    q: "What has Haolin shipped to production?",
    call: 'search_profile("production")',
    found: "2 sources",
    a: `A contact-discovery agent at OpenText that raised right-party contact rates from ${before}% to ${after}%.`,
    sources: ["Case study", "Resume"],
  },
  {
    q: "What's his favorite pizza topping?",
    call: 'search_profile("pizza")',
    found: "no match",
    a: "I don't know. That isn't in anything Haolin wrote, so I won't guess.",
    guard: true,
  },
];

export default function AskChat() {
  const { ref, step, paused, hover } = useTimeline(durations);
  // Each turn takes three steps: question, tool call, answer.
  const visible = turns.flatMap((t, k) => {
    const base = k * 3;
    if (step < base) return [];
    return [{ ...t, k, searching: step === base + 1, answered: step >= base + 2, called: step >= base + 1 }];
  });

  return (
    <div
      ref={ref}
      {...hover}
      className="viz viz-chat"
      role="img"
      aria-label="Animation: the assistant answers a question about Haolin's work with sources, then says it doesn't know when asked something not in his material."
    >
      <VizHead title="Ask Haolin · preview" stages={stages} current={step} paused={paused} />

      <div className="chat-log" aria-hidden="true">
        {visible.map((t) => (
          <div key={t.k} className="chat-turn">
            <p className="chat-q">{t.q}</p>
            {t.called && (
              <p className={`chat-call${t.searching ? " is-busy" : t.guard ? " is-miss" : " is-ok"}`}>
                <span className="chat-call-icon" />
                <code>{t.call}</code>
                {!t.searching && <span className="chat-call-res">{t.found}</span>}
              </p>
            )}
            {t.answered && (
              <div className={`chat-a${t.guard ? " is-guard" : ""}`}>
                {t.guard && <span className="chat-guard">guardrail</span>}
                <p>
                  <Typed text={t.a} on={t.answered} speed={20} />
                </p>
                {t.sources && (
                  <span className="chat-sources">
                    {t.sources.map((s, i) => (
                      <span key={s} style={{ "--i": i } as React.CSSProperties}>
                        {s}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
