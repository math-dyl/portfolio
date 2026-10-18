import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { TechBackdrop } from "@/components/ui/TechBackdrop";
import { RevealText } from "@/components/ui/RevealText";
import { site } from "@/config/site";
import { MathematicalSphere } from "@/components/home/MathematicalSphere";
import { Reveal } from "@/components/ui/Reveal";
import { motion } from "@/lib/motion";

export function Hero() {
  return (
    <section className="hero">
      <TechBackdrop variant="hero" />
      <Container>
        <Reveal className="hero-topline">
          <p className="eyebrow"><span className="label-index">01 /</span> Software · AI · Engineering</p>
          <span className="availability"><span className="status-dot" />Open to meaningful collaborations</span>
        </Reveal>
        <div className="hero-grid">
          <div className="hero-copy">
            <Reveal as="p" className="hero-identity">{site.fullName}<span> / {site.name}</span><span className="hero-role">Software development & computer engineering</span></Reveal>
            <RevealText
              lines={[
                { text: "I build software" },
                { text: "that solves" },
                { text: "real problems.", className: "silver-text" },
              ]}
            />
            <Reveal as="p" className="hero-description" delay={motion.entrance.description}>Software development and computer engineering, focused on AI, automation, educational technology, and systems that make a difference.</Reveal>
            <Reveal className="hero-solution" delay={motion.entrance.branding}><span>{site.solutionName}</span><p>{site.tagline}</p></Reveal>
            <Reveal className="hero-actions" delay={motion.entrance.actions}>
              <Button href="/projects">Explore projects <ArrowUpRight size={17} aria-hidden="true" /></Button>
              <Button href="/contact" variant="secondary">Let’s talk <ArrowUpRight size={17} aria-hidden="true" /></Button>
            </Reveal>
          </div>
          <div className="hero-visual">
            <Reveal className="instrument-caption" delay={motion.stagger * 2}><span>Ideas → systems</span><span>Fig. 01</span></Reveal>
            <Reveal className="orbital-field" aria-hidden="true" delay={motion.stagger * 3}>
              <span className="instrument-axis axis-horizontal" />
              <span className="instrument-axis axis-vertical" />
              <MathematicalSphere />
            </Reveal>
            <Reveal className="instrument-footer" delay={motion.stagger * 4}><p>Practical problems.<br /><span>Thoughtful solutions.</span></p></Reveal>
            <Reveal className="instrument-domains" delay={motion.stagger * 5}><span>Software</span><span>AI & automation</span><span>Engineering</span></Reveal>
          </div>
        </div>
        <Reveal className="hero-bottom"><span>Building useful technology.</span><a href="#selected-work">Discover the work <ArrowDown size={14} aria-hidden="true" /></a></Reveal>
      </Container>
    </section>
  );
}
