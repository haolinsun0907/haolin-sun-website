import {
  profile,
  stats,
  caseStudy,
  experience,
  projects,
  research,
  skills,
  education,
} from "../content/profile";
import { buildSkillUsage, experienceId, projectId } from "../content/skillUsage";
import HeaderNav from "./motion/HeaderNav";
import AgentNetwork from "./motion/AgentNetwork";
import StreamText from "./motion/StreamText";
import CountUp from "./motion/CountUp";
import AgentDemo from "./AgentDemo";
import RewardMachine from "./RewardMachine";
import SkillExplorer from "./SkillExplorer";
import BuildPipeline from "./BuildPipeline";

const nav = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#research", label: "Research" },
  { href: "#contact", label: "Contact" },
];

// Stagger index for data-reveal and data-intro elements
const order = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand">
          {profile.name}
        </a>
        <HeaderNav items={nav} />
        <a href={profile.links.resume} className="btn btn-small" download>
          Resume
        </a>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section id="top" className="hero-wrap">
      <AgentNetwork />
      <div className="hero container">
        <p className="eyebrow" data-intro style={order(0)}>
          {profile.title} · {profile.location}
        </p>
        <h1 data-intro style={order(1)}>
          {profile.name}
        </h1>
        <div data-intro style={order(2)}>
          <StreamText className="hero-tagline" text={profile.tagline} />
        </div>
        <p className="hero-intro" data-intro style={order(3)}>
          {profile.intro}
        </p>
        <div className="hero-actions" data-intro style={order(4)}>
          <a href={`mailto:${profile.links.email}`} className="btn btn-primary">
            Email me
          </a>
          <a href={profile.links.resume} className="btn" download>
            Download resume
          </a>
          <a href={profile.links.linkedin} className="btn btn-ghost" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={profile.links.github} className="btn btn-ghost" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <dl className="stats">
          {stats.map((s, i) => (
            <div key={s.label} className="stat" data-intro data-spotlight style={order(5 + i)}>
              <dt>{s.label}</dt>
              <dd>
                <CountUp value={s.value} />
                {s.bar && (
                  <span
                    className="stat-bar"
                    aria-hidden="true"
                    style={{ "--from": s.bar.from, "--to": s.bar.to } as React.CSSProperties}
                  >
                    <span className="stat-bar-fill" />
                    <span className="stat-bar-mark" />
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="section-heading" data-reveal>
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="tags">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function CaseStudy() {
  return (
    <section id="work" className="section container">
      <SectionHeading kicker={caseStudy.eyebrow} title={caseStudy.title} />
      <div data-reveal>
        <Tags items={caseStudy.stack} />
      </div>
      <div className="case" id="case">
        <div className="case-block" data-reveal data-spotlight style={order(0)}>
          <h3>
            <span className="step">01</span>Problem
          </h3>
          <p>{caseStudy.problem}</p>
        </div>
        <div className="case-block" data-reveal data-spotlight style={order(1)}>
          <h3>
            <span className="step">02</span>Approach
          </h3>
          <ul className="list">
            {caseStudy.approach.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="case-block case-results" data-reveal data-spotlight style={order(2)}>
          <h3>
            <span className="step">03</span>Results
          </h3>
          <ul className="list">
            {caseStudy.results.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
      <AgentDemo />
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="section container">
      <SectionHeading kicker="Experience" title="Where I've worked" />
      <ol className="timeline">
        {experience.map((job, i) => (
          <li key={job.org} id={experienceId(job.org)} className="timeline-item" data-reveal style={order(i)}>
            <div className="timeline-meta">
              <span className="dates">{job.dates}</span>
              <span className="muted">{job.location}</span>
            </div>
            <div>
              <h3>{job.org}</h3>
              <p className="role">{job.role}</p>
              <ul className="list">
                {job.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Projects() {
  return (
    <section id="projects" className="section container">
      <SectionHeading kicker="Projects" title="Things I've built" />
      <div className="cards">
        {projects.map((p, i) => {
          const body = (
            <>
              <div className="card-top">
                <h3>{p.name}</h3>
                {p.status && (
                  <span className={`badge${p.status === "Live" ? " badge-live" : ""}`}>{p.status}</span>
                )}
              </div>
              <p>{p.description}</p>
              <ul className="list">
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
              <div className="card-bottom">
                <Tags items={p.stack} />
                {p.link && (
                  <a href={p.link.href} className="text-link" target="_blank" rel="noreferrer">
                    {p.link.label} →
                  </a>
                )}
              </div>
            </>
          );
          const wide = p.feature === "build-pipeline";
          return (
            <article
              key={p.name}
              id={projectId(p.name)}
              className={`card${wide ? " card-wide" : ""}`}
              data-reveal
              data-spotlight
              style={order(i)}
            >
              {wide ? (
                <>
                  <div className="card-wide-main">{body}</div>
                  <BuildPipeline />
                </>
              ) : (
                body
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Research() {
  return (
    <section id="research" className="section container">
      <SectionHeading kicker="Research" title="Peer-reviewed publication" />
      <div className="research">
        <article id="paper" className="card" data-reveal data-spotlight>
          <h3>{research.title}</h3>
          <p className="muted">
            {research.authors} · {research.venue}
          </p>
          <p>{research.plain}</p>
          <a href={research.href} className="text-link" target="_blank" rel="noreferrer">
            Read the paper →
          </a>
        </article>
        <RewardMachine />
      </div>
    </section>
  );
}

export function SkillsAndEducation() {
  return (
    <section id="skills" className="section container">
      <SectionHeading kicker="Skills & education" title="What I work with" />
      <SkillExplorer groups={skills} usage={buildSkillUsage()} />
      <ul className="education" data-reveal>
        {education.map((e) => (
          <li key={e.school}>
            <div>
              <strong>{e.school}</strong>
              <span className="muted"> · {e.degree}</span>
            </div>
            <span className="dates">{e.dates}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Contact() {
  return (
    <footer id="contact" className="contact">
      <div className="container contact-inner" data-reveal>
        <div>
          <h2>Let's talk</h2>
          <p>I'm looking for full-time AI Engineer roles. The fastest way to reach me is email.</p>
        </div>
        <div className="contact-links">
          <a href={`mailto:${profile.links.email}`} className="btn btn-primary">
            {profile.links.email}
          </a>
          <a href={profile.links.linkedin} className="btn btn-ghost" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={profile.links.github} className="btn btn-ghost" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
      <p className="container fineprint">© {new Date().getFullYear()} {profile.name}</p>
    </footer>
  );
}
