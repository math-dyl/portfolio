import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { TechBackdrop } from "@/components/ui/TechBackdrop";
export function Hero() {
  return (
    <section className="hero">
      <TechBackdrop variant="hero" />
      <Container>
        <div className="hero-topline">
          <p className="eyebrow"><span className="label-index">01 /</span> Software · AI · Engineering</p>
          <span className="availability"><span className="status-dot" />Open to meaningful collaborations</span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>I build software<br />that solves<br /><span className="silver-text">real problems.</span></h1>
            <p className="hero-description">Software development and computer engineering, focused on AI, automation, educational technology, and systems that make a difference.</p>
            <div className="hero-actions">
              <Button href="/projects">Explore projects <ArrowUpRight size={17} aria-hidden="true" /></Button>
              <Button href="/contact" variant="secondary">Let’s talk <ArrowUpRight size={17} aria-hidden="true" /></Button>
            </div>
          </div>
          <div className="hero-instrument" aria-hidden="true">
            <div className="instrument-caption"><span>Ideas → systems</span><span>Fig. 01</span></div>
            <div className="orbital-field">
              <span className="instrument-axis axis-horizontal" /><span className="instrument-axis axis-vertical" />
              <div className="wireframe-sphere"><span className="sphere-meridian meridian-one" /><span className="sphere-meridian meridian-two" /><span className="sphere-meridian meridian-three" /><span className="sphere-latitude latitude-one" /><span className="sphere-latitude latitude-two" /><span className="sphere-equator" /></div>
              <span className="orbital-node node-one" /><span className="orbital-node node-two" /><span className="orbital-node node-three" />
              <span className="instrument-coordinate coordinate-top">Y +01</span><span className="instrument-coordinate coordinate-bottom">X +01</span>
            </div>
            <div className="instrument-footer"><span className="instrument-cross">+</span><p>Practical problems.<br /><span>Thoughtful solutions.</span></p></div>
          </div>
        </div>
        <div className="hero-bottom"><span>Building useful technology.</span><a href="#selected-work">Discover the work <ArrowDown size={14} aria-hidden="true" /></a></div>
      </Container>
    </section>
  );
}
