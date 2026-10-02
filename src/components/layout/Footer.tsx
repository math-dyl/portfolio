import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Brand } from "@/components/layout/Brand";
import { site } from "@/config/site";
export function Footer() {
  const socials = [{ label: "GitHub", url: site.github }, { label: "LinkedIn", url: site.linkedin }].filter(link => link.url);
  return <footer className="site-footer"><Container>
    <div className="footer-main"><div><Link href="/" className="wordmark" aria-label={site.name + " home"}><Brand /></Link><p>Software / AI / Engineering</p></div>
      <nav aria-label="Footer navigation">{site.navigation.filter(link => link.href !== "/").map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}{socials.map(link => <a key={link.label} href={link.url!} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={13} aria-hidden="true" /></a>)}{site.email && <a href={"mailto:" + site.email}>Email<ArrowUpRight size={13} aria-hidden="true" /></a>}</nav>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {site.name}</span><span>Building useful technology.</span><a href="#top">Back to top ↑</a></div>
  </Container></footer>;
}
