import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TechBackdrop } from "@/components/ui/TechBackdrop";
import { site } from "@/config/site";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";

export function ContactCTA() {
  return (
    <section className="contact-cta">
      <TechBackdrop />
      <Container>
        <div className="cta-inner surface-panel">
          <div>
            <Reveal as="p" className="eyebrow">04 / Contact</Reveal>
            <RevealText as="h2" lines={[{ text: "Have a project" }, { text: "in mind?", className: "silver-text" }]} />
            <Reveal as="p" delay={motion.stagger}>{site.solutionName} · {site.tagline}</Reveal>
          </div>
          <Reveal className="cta-action" delay={motion.stagger * 2}>
            <p>An idea. A challenge.<br />A conversation worth having.</p>
            <Button href="/contact">Start a conversation <ArrowUpRight size={18} aria-hidden="true" /></Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
