"use client";

import { useState } from "react";
import type { UsageLink } from "../content/skillUsage";

// Skill tags you can click to see where each skill shows up on the page.
export default function SkillExplorer({
  groups,
  usage,
}: {
  groups: { group: string; items: string[] }[];
  usage: Record<string, UsageLink[]>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const hits = selected ? (usage[selected] ?? []) : [];

  return (
    <>
      <div className="skills">
        {groups.map((g, i) => (
          <div
            key={g.group}
            className="skill-group"
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
          >
            <h3>{g.group}</h3>
            <ul className="tags tags-interactive">
              {g.items.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    aria-pressed={selected === t}
                    onClick={() => setSelected(selected === t ? null : t)}
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div
          className={`skill-result${selected ? " is-open" : ""}`}
          aria-live="polite"
          data-reveal
          style={{ "--i": groups.length } as React.CSSProperties}
        >
          {!selected ? (
            <p className="muted">
              Click a skill to see where it shows up in my work.
            </p>
          ) : hits.length ? (
            <>
              <p>
                <strong>{selected}</strong> shows up in:
              </p>
              <ul className="skill-hits">
                {hits.map((h, i) => (
                  <li key={h.href} style={{ "--i": i } as React.CSSProperties}>
                    <a href={h.href}>{h.label} ↓</a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              <strong>{selected}</strong> isn’t tied to a specific item on this
              page. Ask me about it.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
