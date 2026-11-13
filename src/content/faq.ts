import { caseStudy, profile, research, skills, projects } from "./profile";

// Prewritten answers for the chat preview, built from profile.ts so they
// always match the rest of the site. The real "Ask Haolin" agent will
// replace this preview.

export type Faq = { q: string; a: string };

export const faq: Faq[] = [
  {
    q: "What have you shipped to production?",
    a: `${caseStudy.title}, built at OpenText. ${caseStudy.results.join(" ")}`,
  },
  {
    q: "How does that agent work?",
    a: caseStudy.approach.join(" "),
  },
  {
    q: "What's your research background?",
    a: `${research.plain} The paper, "${research.title}", was published at ${research.venue}.`,
  },
  {
    q: "What do you work with day to day?",
    a: skills.map((g) => `${g.group}: ${g.items.join(", ")}.`).join(" "),
  },
  {
    q: "What are you building next?",
    a: `${projects[0].description} ${projects[0].points.join(" ")}`,
  },
  {
    q: "Are you open to new roles?",
    a: `Yes. ${profile.lookingFor} You can write to ${profile.links.email}.`,
  },
];
