import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { TechBackdrop } from "@/components/ui/TechBackdrop";
export function ContactCTA() {
  return <section className="contact-cta"><TechBackdrop /><Container className="cta-inner"><div><p className="eyebrow">04 / Contact</p><h2>Have a project<br /><span className="silver-text">in mind?</span></h2><p>Let’s build something useful.</p></div><div className="cta-action"><p>An idea. A challenge.<br />A conversation worth having.</p><Button href="/contact">Start a conversation <ArrowUpRight size={18} aria-hidden="true" /></Button></div></Container></section>;
}
