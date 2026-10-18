import { ArrowUpRight, BrainCircuit, Braces, Code2, Cpu, Lightbulb } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ContactCTA } from "@/components/home/ContactCTA";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PageHeading } from "@/components/ui/PageHeading";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";
import { skillGroups } from "@/data/skills";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("About", "Meet Mathdyl: a developer working across software, computer engineering, AI, automation, and educational technology.", "/about");
const skillIcons = [Code2, BrainCircuit, Cpu];
export default function AboutPage() {
  return (
    <>
      <Container>
        <PageHeading eyebrow="About / Profile" lines={[{ text: "Curious by nature." }, { text: "Practical by design.", className: "accent-text" }]} description={<>I’m {site.fullName}. You can call me Mathdyl.<br />I work at the intersection of software, engineering, and useful ideas.</>} />
        <section className="about-intro">
          <div><Reveal as="p" className="eyebrow">01 / Approach</Reveal><RevealText as="h2" lines={[{ text: "Technology is most valuable" }, { text: "when it helps someone." }]} /></div>
          <div className="about-prose">
            <Reveal as="p">My focus is on building software that solves practical problems—from web applications and AI integrations to systems that connect hardware with software.</Reveal>
            <Reveal as="p" delay={motion.stagger}>Computer engineering shapes how I approach a challenge: understand the whole system, make the pieces work together, and keep the experience clear for the person using it.</Reveal>
            <Reveal as="p" delay={motion.stagger * 2}>I’m especially interested in educational technology and community-oriented projects. Better tools can make learning more accessible and local information easier to find.</Reveal>
            <Reveal><Button href="/projects" variant="text">See what I’m building <ArrowUpRight size={16} aria-hidden="true" /></Button></Reveal>
          </div>
        </section>
        <section className="about-principles" aria-label="Working principles">
          <h2 className="sr-only">Working principles</h2>
          <Reveal as="article"><Lightbulb size={25} strokeWidth={1.5} aria-hidden="true" /><h3>Start with the problem</h3><p>Understand the need before deciding on the technology.</p></Reveal>
          <Reveal as="article" delay={motion.stagger}><Braces size={25} strokeWidth={1.5} aria-hidden="true" /><h3>Build with clarity</h3><p>Simple interfaces, thoughtful systems, maintainable code.</p></Reveal>
          <Reveal as="article" delay={motion.stagger * 2}><Cpu size={25} strokeWidth={1.5} aria-hidden="true" /><h3>Connect disciplines</h3><p>Bring software, AI, and engineering together when it helps.</p></Reveal>
        </section>
        <section className="section skills-section">
          <SectionTitle eyebrow="02 / Skills & technologies" title="Skills & technologies" description="The tools and disciplines behind the work." />
          <div className="skills-grid">
            {skillGroups.map((group, index) => {
              const Icon = skillIcons[index % skillIcons.length];
              return <Reveal as="article" key={group.title} delay={index * motion.stagger}><div className="skill-heading"><h3>{group.title}</h3><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></div><div className="tech-tags">{group.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}</div></Reveal>;
            })}
          </div>
        </section>
      </Container>
      <ContactCTA />
    </>
  );
}
