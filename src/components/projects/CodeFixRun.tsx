"use client";

import { Typed, VizHead, useTimeline } from "./timeline";

// The agent's run as a split screen: its to-do list ticks off on the left
// while the editor and terminal on the right show the work: read the file,
// watch the test fail, swap the buggy line, and go green.
const stages = ["Task", "Plan", "Read", "Test", "Fix", "Re-test", "Done"];
const durations = [1300, 1100, 1300, 1700, 1700, 1500, 2800];

// Each to-do is active at one step and done after it.
const todos = [
  { text: "Read my_add.py", at: 2 },
  { text: "Run the tests", at: 3 },
  { text: "Fix the failing line", at: 4 },
  { text: "Re-run the tests", at: 5 },
];

const task = 'Test and fix my_add.py';

export default function CodeFixRun() {
  const { ref, step, seen, cycle, paused, hover } = useTimeline(durations);
  const at = (n: number) => step >= n;
  const green = step >= 5;

  return (
    <div
      ref={ref}
      {...hover}
      className={`viz viz-fix${step === 6 ? " is-done" : ""}`}
      role="img"
      aria-label="Animation: the agent plans a to-do list, reads my_add.py, sees a failing test, replaces the buggy line, and re-runs the tests until they pass."
    >
      <VizHead title="code-fix agent" stages={stages} current={step} paused={paused} />

      <p className="fix-task" aria-hidden="true">
        <span className="fix-prompt">&gt;</span>
        <Typed key={cycle} text={task} on={seen} />
      </p>

      <div key={cycle} className="fix-body" aria-hidden="true">
        <ol className="fix-todos">
          <li className="fix-todos-title">write_todos</li>
          {todos.map((t, i) => {
            const state = step > t.at || step === 6 ? "is-done" : step === t.at ? "is-now" : "";
            return (
              <li
                key={t.text}
                className={`fix-todo ${state}${at(1) ? " is-in" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="fix-box">
                  <svg viewBox="0 0 12 12">
                    <path d="M2.5 6.2 L5 8.5 L9.5 3.5" pathLength={1} />
                  </svg>
                </span>
                {t.text}
              </li>
            );
          })}
        </ol>

        <div className="fix-right">
          <div className={`fix-editor${at(2) ? " is-open" : ""}`}>
            <span className="fix-file">my_add.py</span>
            <code className="fix-line">
              <i>1</i>
              <span>
                <b className="k">def</b> <b className="f">add</b>(a, b):
              </span>
            </code>
            <code className={`fix-line fix-bad${at(3) ? " is-flag" : ""}${at(4) ? " is-gone" : ""}`}>
              <i>2</i>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;<b className="k">return</b> a - b
              </span>
            </code>
            <code className={`fix-line fix-good${at(4) ? " is-in" : ""}`}>
              <i>2</i>
              <span>
                &nbsp;&nbsp;&nbsp;&nbsp;<b className="k">return</b> a + b
              </span>
            </code>
          </div>

          <div className={`fix-term${green ? " is-green" : at(3) ? " is-red" : ""}`}>
            {at(3) && (
              <span key={green ? "g" : "r"} className="fix-term-run">
                <span className="fix-term-cmd">$ pytest -q</span>
                {green ? (
                  <span className="fix-term-out">1 passed in 0.01s</span>
                ) : (
                  <span className="fix-term-out">FAILED add(2, 3) == 5 · got -1</span>
                )}
              </span>
            )}
            {!at(3) && <span className="fix-term-idle">waiting for run_tests…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
