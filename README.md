# haolin-sun-website

Personal website of Haolin Sun, AI Engineer. Built with Next.js (App Router) and plain CSS.

An AI assistant ("Ask Haolin") that answers visitors' questions is being added: a LangChain agent served by a separate FastAPI backend.

## Structure

```
src/
  content/profile.ts      All site content. Edit this file to update the site.
  app/layout.tsx          Page metadata, font
  app/page.tsx            Page composition
  app/globals.css         Styles (light and dark)
  components/sections.tsx Page sections
  components/ChatLauncher.tsx  Chat button (placeholder until the assistant ships)
  components/AgentDemo.tsx     "Run the agent" replay in the case study
  components/RewardMachine.tsx Animated reward-machine diagram (research)
  components/SkillExplorer.tsx Clickable skill tags
  components/motion/           Scroll reveal, count-up, hero network, nav
  content/demo.ts         Fictional data for the demos (keep out of the assistant's knowledge base)
  content/skillUsage.ts   Works out which items mention each skill
public/
  HaolinSun_Resume.pdf    Resume served by the "Download resume" buttons
```

`src/content/profile.ts` is the single source of truth. The assistant's knowledge base will be built from the same content, so the site and the assistant stay consistent.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy

1. Push this folder to a GitHub repository.
2. On vercel.com, choose **Add New → Project**, import the repository, and keep the default settings.
3. After the first deploy, put the real URL into `siteUrl` in `src/app/layout.tsx` and push again.
