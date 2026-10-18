import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/config/site";
import { PageHeading } from "@/components/ui/PageHeading";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";
export const metadata = pageMetadata("Contact", "Connect with Mathdyl about software development, AI, engineering projects, and collaboration.", "/contact");
export default function ContactPage() {
  return (
    <Container>
      <PageHeading eyebrow="04 / Contact" lines={[{ text: "Good things start" }, { text: "with a conversation.", className: "accent-text" }]} description={<>Have an idea to explore or a problem to solve?<br />Let’s see what we can build together.</>} action={site.email && <Button href={"mailto:" + site.email}>Send an email <ArrowUpRight size={17} aria-hidden="true" /></Button>} />
      <div className="contact-layout">
        <section aria-labelledby="contact-channels-heading"><h2 id="contact-channels-heading" className="sr-only">Contact channels</h2><ContactChannels /></section>
        <Reveal as="aside" className="contact-note" delay={motion.stagger}>
          <span className="status-dot" /><p className="eyebrow">Open to collaboration</p>
          <h2>A little context goes a long way.</h2>
          <p>Tell me about your idea, who it’s for, and what you’re hoping to achieve. A rough timeline is helpful, too.</p>
          <div className="contact-solution"><p className="eyebrow">{site.solutionName}</p><p>{site.tagline}</p><p>Technology-driven solutions for businesses, organizations, institutions, and individuals. Let’s explore software, AI, automation, and intelligent digital systems around your needs.</p></div>
          <span>Software · AI · Engineering · Education</span>
        </Reveal>
      </div>
      <section className="contact-closing">
        <RevealText as="h2" lines={[{ text: "Still exploring?" }]} /><Reveal as="p" delay={motion.stagger}>Get a feel for my work and how I approach a project.</Reveal>
        <Reveal delay={motion.stagger * 2}><Button href="/projects" variant="text">Explore the projects <ArrowUpRight size={17} aria-hidden="true" /></Button></Reveal>
      </section>
    </Container>
  );
}
