import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Brand } from "@/components/layout/Brand";
import { site } from "@/config/site";
import { MotionToggle } from "@/components/ui/MotionPreference";
import { Reveal } from "@/components/ui/Reveal";
import { motion } from "@/lib/motion";
export function Footer() {
  const socials = [{ label: "GitHub", url: site.github }, { label: "LinkedIn", url: site.linkedin }].filter(link => link.url);
  return <footer className="site-footer"><Container>
    <div className="footer-main"><Reveal><Link href="/" className="wordmark" aria-label={site.name + " home"}><Brand /></Link><p>{site.solutionName} / {site.tagline}</p></Reveal>
      <Reveal as="nav" delay={motion.stagger} aria-label="Footer navigation">{site.navigation.filter(link => link.href !== "/").map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}{socials.map(link => <a key={link.label} href={link.url!} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={13} aria-hidden="true" /></a>)}{site.email && <a href={"mailto:" + site.email}>Email<ArrowUpRight size={13} aria-hidden="true" /></a>}</Reveal>
    </div>
    <Reveal className="footer-bottom" delay={motion.stagger * 2}><span>© {new Date().getFullYear()} {site.name}</span><span>Building useful technology.</span><MotionToggle /><a href="#top">Back to top ↑</a></Reveal>
  </Container></footer>;
}
