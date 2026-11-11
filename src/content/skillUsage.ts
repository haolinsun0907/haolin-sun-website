import { caseStudy, experience, projects, research, skills } from "./profile";

// Works out, for each skill, which items on the page mention it.
// Used by the clickable skill tags. Everything comes from profile.ts.

export type UsageLink = { label: string; href: string };

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const experienceId = (org: string) => `exp-${slug(org)}`;
export const projectId = (name: string) => `project-${slug(name.split(":")[0])}`;

// Other words that count as a mention of a skill.
const aliases: Record<string, string[]> = {
  "AI Agents": ["agent"],
  "Google ADK": ["ADK"],
  "Tool Calling": ["tool call", "tool-based"],
  RAG: ["retrieval-augmented"],
  "Reinforcement Learning": ["reinforcement learning"],
  "Model Evaluation": ["evaluation", "benchmark"],
  SQL: ["PostgreSQL"],
  GCP: ["Vertex AI"],
};

// Matches to drop, where a word fits but means something else
// (the paper's "RL agents" are not LLM agents).
const exclude: Record<string, string[]> = {
  "AI Agents": ["#paper"],
};

const places: (UsageLink & { text: string })[] = [
  {
    label: "Contact-discovery agent",
    href: "#case",
    text: [...caseStudy.stack, caseStudy.problem, ...caseStudy.approach, ...caseStudy.results].join(" "),
  },
  ...experience.map((job) => ({
    label: job.org,
    href: `#${experienceId(job.org)}`,
    text: [job.role, ...job.points].join(" "),
  })),
  ...projects.map((p) => ({
    label: p.name.split(":")[0],
    href: `#${projectId(p.name)}`,
    text: [...p.stack, p.description, ...p.points].join(" "),
  })),
  { label: "EUMAS 2023 paper", href: "#paper", text: [research.title, research.plain].join(" ") },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildSkillUsage(): Record<string, UsageLink[]> {
  const usage: Record<string, UsageLink[]> = {};
  for (const group of skills) {
    for (const skill of group.items) {
      const terms = [skill, ...(aliases[skill] ?? [])];
      const re = new RegExp(`\\b(?:${terms.map(escape).join("|")})(?:s|es|ed|ing)?\\b`, "i");
      usage[skill] = places
        .filter((p) => re.test(p.text) && !exclude[skill]?.includes(p.href))
        .map(({ label, href }) => ({ label, href }));
    }
  }
  return usage;
}
