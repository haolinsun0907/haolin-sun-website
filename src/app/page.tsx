import {
  Header,
  Hero,
  CaseStudy,
  Experience,
  Projects,
  Research,
  SkillsAndEducation,
  Contact,
} from "../components/sections";
import ChatLauncher from "../components/ChatLauncher";
import MotionRoot from "../components/motion/MotionRoot";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CaseStudy />
        <Experience />
        <Projects />
        <Research />
        <SkillsAndEducation />
      </main>
      <Contact />
      <ChatLauncher />
      <MotionRoot />
    </>
  );
}
