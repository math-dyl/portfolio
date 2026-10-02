import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { Button } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/config/site";
export const metadata = pageMetadata("Contact", "Connect with Mathdyl about software development, AI, engineering projects, and collaboration.", "/contact");
export default function ContactPage() {
  return <Container><header className="page-heading"><p className="eyebrow">04 / Contact</p><h1>Good things start<br />with <span className="accent-text">a conversation.</span></h1><p className="page-description">Have an idea to explore or a problem to solve?<br />Let’s see what we can build together.</p>{site.email && <Button href={"mailto:" + site.email}>Send an email <ArrowUpRight size={17} aria-hidden="true" /></Button>}</header><div className="contact-layout"><section aria-label="Contact channels"><ContactChannels /></section><aside className="contact-note"><span className="status-dot" /><p className="eyebrow">Open to collaboration</p><h2>A little context goes a long way.</h2><p>Tell me about your idea, who it’s for, and what you’re hoping to achieve. A rough timeline is helpful, too.</p><span>Software · AI · Engineering · Education</span></aside></div><section className="contact-closing"><h2>Still exploring?</h2><p>Get a feel for my work and how I approach a project.</p><Button href="/projects" variant="text">Explore the projects <ArrowUpRight size={17} aria-hidden="true" /></Button></section></Container>;
}
