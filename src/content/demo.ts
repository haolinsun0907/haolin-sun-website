// Illustrative data for the interactive demos on the site.
// Everything here is made up to show how the work functions: the company,
// the people and the scores are fictional.
// Keep this file out of the assistant's knowledge base. Unlike profile.ts,
// none of it is a fact about Haolin's work.

export type DemoStep = {
  kind: "think" | "tool" | "done";
  tool?: string;
  text: string;
  // Steps with a result show a spinner first, then the result.
  result?: string;
  // Contacts this step finds (ids from `contacts`)
  add?: string[];
  // The step that scores and ranks everything found so far
  score?: boolean;
};

export type DemoContact = {
  id: string;
  name: string;
  role: string;
  source: string;
  score: number;
  why: string;
};

export const agentDemo = {
  steps: [
    { kind: "think", text: "Goal: find who handles accounts payable at Acme Industrial Ltd." },
    {
      kind: "tool",
      tool: "google_search",
      text: '"Acme Industrial" accounts payable contact',
      result: "8 results, 3 worth reading",
    },
    { kind: "tool", tool: "read_page", text: "acme-industrial.example/contact", result: "1 contact", add: ["ap-team"] },
    {
      kind: "tool",
      tool: "read_page",
      text: "bizdirectory.example/acme-industrial",
      result: "2 contacts",
      add: ["rivera", "patel"],
    },
    { kind: "tool", tool: "read_pdf", text: "acme-annual-report-2025.pdf", result: "1 contact", add: ["nair"] },
    { kind: "think", text: "Scoring contacts by source reliability and role fit", result: "4 ranked", score: true },
    { kind: "done", text: "Best first call: Jordan Rivera, AP Manager" },
  ] as DemoStep[],

  contacts: [
    {
      id: "ap-team",
      name: "Accounts Payable team",
      role: "ap@acme-industrial.example",
      source: "Official site",
      score: 0.78,
      why: "Official source, but no named person",
    },
    {
      id: "rivera",
      name: "Jordan Rivera",
      role: "AP Manager",
      source: "Business directory",
      score: 0.91,
      why: "Owns accounts payable; recent listing",
    },
    {
      id: "patel",
      name: "Sam Patel",
      role: "Sales Representative",
      source: "Business directory",
      score: 0.21,
      why: "Wrong department",
    },
    {
      id: "nair",
      name: "Priya Nair",
      role: "Corporate Controller",
      source: "Annual report (PDF)",
      score: 0.64,
      why: "Senior finance; may redirect the call",
    },
  ] as DemoContact[],
};

// A textbook-style reward machine, used to explain the idea behind the paper.
// It is not one of the paper's benchmark tasks.
export const rewardMachine = {
  task: "pick up the key, open the door, then reach the goal",
  states: [
    { name: "Find the key", note: "Reward stays 0. The only thing that moves the machine on is reaching the key." },
    { name: "Open the door", note: "Key collected. The machine changes state, so the agent knows the door comes next." },
    { name: "Reach the goal", note: "Door open. One subgoal left." },
    { name: "Done", note: "Goal reached: this transition pays reward 1 and the task is complete." },
  ],
  edges: [
    { event: "got key", reward: 0 },
    { event: "door open", reward: 0 },
    { event: "at goal", reward: 1 },
  ],
};
