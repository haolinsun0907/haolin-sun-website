// Single source of truth for everything on the site.
// The chatbot's knowledge base will be built from this same file later,
// so the website and the assistant never disagree.

export const profile = {
  name: "Haolin Sun",
  title: "AI Engineer",
  tagline: "LLM Applications & Automation",
  location: "Mississauga, ON",
  intro:
    "I build and ship LLM agents that move real business numbers. My production agent raised right-party contact rates from 25% to 62% at about $0.10 per account. Before that, I did deep reinforcement learning research at York University.",
  summary:
    "AI engineer with an M.Sc. in Computer Science who builds and ships LLM agents in production. Background in deep reinforcement learning research (EUMAS 2023), RAG applications, and large-scale Python automation.",
  links: {
    email: "haolinsun0907@gmail.com",
    linkedin: "https://linkedin.com/in/haolinsun0907",
    github: "https://github.com/haolinsun0907",
    resume: "/HaolinSun_Resume.pdf",
  },
};

export const stats = [
  { value: "25% → 62%", label: "Right-party contact rate", bar: { from: 25, to: 62 } },
  { value: "~$5M", label: "Added on-time cash per month" },
  { value: "$0.10", label: "Agent cost per account" },
  { value: "~2,000", label: "Accounts processed monthly" },
];

export const caseStudy = {
  eyebrow: "Featured work · OpenText",
  title: "A contact-discovery agent for enterprise collections",
  stack: ["Gemini", "Google ADK", "Vertex AI", "Tool calling", "Python"],
  problem:
    "Collectors needed the right person to call at each enterprise customer, and finding that contact by hand was slow. Before the agent, only 25% of calls reached the right party.",
  approach: [
    "Designed, built, and deployed a Gemini-powered agent with Google Agent Development Kit (ADK) on Vertex AI, working on my own end to end.",
    "The agent uses Google Search tool calls to look across official company websites, third-party directories, and PDFs and other documents to collect every contact it can find for a customer.",
    "It then scores and ranks each contact by source reliability and its own judgment, so collectors start with the most promising contact instead of working through a raw list.",
  ],
  results: [
    "Right-party contact rate on targeted accounts rose from 25% to 62%, measured on collectors' real call outcomes.",
    "Dispute resolution rate improved by 45%.",
    "Contributed to about $5M per month in additional on-time cash collection.",
    "Processes about 2,000 accounts per month for roughly $200, a small fraction of the cost of manual research.",
  ],
};

export type Role = {
  org: string;
  role: string;
  location: string;
  dates: string;
  points: string[];
};

export const experience: Role[] = [
  {
    org: "OpenText",
    role: "Business Analyst – AI & Automation",
    location: "Waterloo, ON",
    dates: "Jan 2024 – Present",
    points: [
      "Built and deployed the contact-discovery agent described above, processing ~2,000 enterprise accounts per month.",
      "Built and maintained 100+ Python scripts automating data processing, reporting, and operational tasks, saving hundreds of hours of manual work annually.",
    ],
  },
  {
    org: "York University",
    role: "Research Assistant – AI & Deep Learning",
    location: "Toronto, ON",
    dates: "May 2022 – Sep 2023",
    points: [
      "Developed deep reinforcement learning models in Python and PyTorch that exploit reward machines in continuous action domains, benchmarked across two simulated control environments.",
      "Achieved 15x the baseline benchmark score with the same number of training steps; co-authored a peer-reviewed paper at EUMAS 2023.",
    ],
  },
  {
    org: "Jinrun Logistics, Inc.",
    role: "Data Analyst Intern",
    location: "Qingdao, China",
    dates: "May 2018 – Aug 2018",
    points: [
      "Optimized PostgreSQL queries and database settings, improving query performance by 20%; built data-processing pipelines and time-series forecasts for logistics operations.",
    ],
  },
];

export type Project = {
  name: string;
  status?: string;
  stack: string[];
  description: string;
  points: string[];
  link?: { label: string; href: string };
  // Full-width card with an animated build-and-deploy pipeline
  feature?: "build-pipeline";
};

export const projects: Project[] = [
  {
    name: "Ask Haolin: an agent that answers questions about me",
    status: "In progress",
    stack: ["LangChain", "LangGraph", "Open-source LLM", "FastAPI", "LangSmith"],
    description:
      "The assistant coming to this site: a LangChain agent that answers visitors' questions about my background, grounded only in material I wrote.",
    points: [
      "Planned tools: profile search, GitHub projects, the publication, and leaving me a message.",
      "Guardrails so it says \"I don't know\" instead of guessing.",
      "A fixed evaluation set in LangSmith, run before each release.",
    ],
  },
  {
    name: "Customer Support Knowledge Assistant",
    stack: ["Python", "LangChain", "Milvus"],
    description:
      "A retrieval-augmented assistant that answers customer-support questions from a document collection, with sources.",
    points: [
      "Document ingestion, text chunking, embeddings, and vector search with Milvus.",
      "Tool-based retrieval with structured, source-cited responses.",
      "85% answer pass rate, 90% task completion, 3-second average response time.",
    ],
    link: { label: "GitHub", href: "https://github.com/haolinsun0907" },
  },
  {
    name: "This website",
    status: "Live",
    feature: "build-pipeline",
    stack: ["Next.js", "React", "TypeScript", "Vercel", "Claude Code"],
    description:
      "The site you're on. I built it end to end with an AI coding agent (Claude Code): I set the direction and design, the agent wrote most of the code, and I reviewed and shipped it.",
    points: [
      "An interactive replay of an agent run, an animated reward-machine diagram, and skill tags that jump to where each skill was used.",
      "Animations follow the visitor's reduced-motion setting, and the first screen never waits for JavaScript.",
      "Every git push to GitHub deploys to Vercel automatically, live in about 30 seconds.",
    ],
    link: { label: "Source on GitHub", href: "https://github.com/haolinsun0907/haolin-sun-website" },
  },
];

export const research = {
  title: "Exploiting Reward Machines with Deep Reinforcement Learning in Continuous Action Domains",
  authors: "Haolin Sun and Yves Lespérance",
  venue: "EUMAS 2023, LNCS 14282, pp. 83–99",
  plain:
    "A reward machine describes a task's reward as a small state machine, which exposes structure such as subgoals that ordinary reinforcement learning has to discover on its own. This work shows how deep RL agents can use that structure when actions are continuous, as in simulated control tasks. On the benchmarks we tested, the approach reached 15x the baseline score with the same number of training steps.",
  href: "https://www.eecs.yorku.ca/~lesperan/papers/EUMAS2023acceptedVersion.pdf",
};

export const skills: { group: string; items: string[] }[] = [
  { group: "LLM Applications", items: ["Gemini", "Google ADK", "AI Agents", "Tool Calling", "LangChain", "RAG", "Prompt Engineering", "Pydantic"] },
  { group: "ML & Retrieval", items: ["PyTorch", "Reinforcement Learning", "Model Evaluation", "Embeddings", "Vector Search", "Milvus"] },
  { group: "Programming & Data", items: ["Python", "SQL", "PostgreSQL", "Pandas", "NumPy", "ETL", "Tableau"] },
  { group: "Cloud & Development", items: ["GCP", "Vertex AI", "Docker", "Git", "Linux", "LangSmith"] },
  { group: "Web & AI-Assisted Development", items: ["Next.js", "React", "TypeScript", "Vercel", "Claude Code"] },
];

export const education = [
  { school: "York University", degree: "M.Sc. in Computer Science", dates: "2020 – 2023" },
  { school: "University of Ottawa", degree: "B.Sc. in Computer Science", dates: "2016 – 2020" },
];
