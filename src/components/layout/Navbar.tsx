"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Brand } from "@/components/layout/Brand";
import { site } from "@/config/site";
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return <header className="site-header"><Container className="nav-container">
    <Link href="/" className="wordmark" aria-label={site.name + " home"} onClick={() => setOpen(false)}><Brand /></Link>
    <nav aria-label="Main navigation" className="desktop-nav">{site.navigation.map(link => <Link key={link.href} href={link.href} aria-current={(link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)) ? "page" : undefined}>{link.label}</Link>)}</nav>
    <Link href="/contact" className="nav-contact">Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></Link>
    <button ref={toggleRef} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X size={23} /> : <Menu size={23} />}</button>
  </Container><nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" hidden={!open}>{site.navigation.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={(link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)) ? "page" : undefined}>{link.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</nav></header>;
}
