"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, FolderCode, Home, Mail, Menu, UserRound, X } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Brand } from "@/components/layout/Brand";
import { site } from "@/config/site";
import { motion } from "@/lib/motion";
const navigationIcons = { "/": Home, "/projects": FolderCode, "/about": UserRound, "/contact": Mail };
export function Navbar() {
  const pathname = usePathname();
  const isCurrent = (href: string) => href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const hover = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    let frame = 0;
    let compact = false;
    const update = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      // Hysteresis prevents jitter when scrolling near the boundary.
      const next = window.scrollY > (compact ? motion.navbar.expandAt : motion.navbar.compactAt);
      if (next !== compact) header.dataset.expanded = String(!next || header.matches(":focus-within") || (hover.matches && header.matches(":hover")));
      compact = next;
      header.dataset.scrolled = String(compact);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", update);
    };
  }, []);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    const onHistory = () => setOpen(false);
    desktop.addEventListener("change", onResize);
    window.addEventListener("popstate", onHistory);
    return () => {
      desktop.removeEventListener("change", onResize);
      window.removeEventListener("popstate", onHistory);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);
  return <header ref={headerRef} className="site-header" data-menu-open={open}
    onPointerLeave={event => { if (event.currentTarget.dataset.scrolled === "true") event.currentTarget.dataset.expanded = String(event.currentTarget.matches(":focus-within") || open); }}
    onTransitionEnd={event => {
      if (event.propertyName !== "width" || !(event.target instanceof Element) || !event.target.classList.contains("nav-container")) return;
      const header = event.currentTarget;
      header.dataset.expanded = String(header.dataset.scrolled !== "true" || header.matches(":hover, :focus-within") || open);
    }}
    onBlur={event => {
      const header = event.currentTarget;
      if (!header.contains(event.relatedTarget)) {
        setOpen(false);
        header.dataset.expanded = String(header.dataset.scrolled !== "true" || (window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches && header.matches(":hover")));
      }
    }}><Container className="nav-container">
    <Link href="/" scroll className="wordmark" aria-label={site.name + " home"} onClick={() => setOpen(false)}><Brand /></Link>
    <nav aria-label="Main navigation" className="desktop-nav">{site.navigation.map(link => {
      const Icon = navigationIcons[link.href as keyof typeof navigationIcons] ?? FolderCode;
      return <Link key={link.href} href={link.href} scroll className="nav-link" aria-label={link.label} aria-current={isCurrent(link.href) ? "page" : undefined} onClick={() => setOpen(false)}>
        <Icon className="nav-icon" size={19} strokeWidth={1.7} aria-hidden="true" />
        <span className="nav-label" aria-hidden="true">{link.label}</span>
        <span className="nav-tooltip" aria-hidden="true">{link.label}</span>
      </Link>;
    })}</nav>
    <div className="nav-contact-wrap"><Link href="/contact" scroll className="nav-contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
    <button ref={toggleRef} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(value => !value)}>{open ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}</button>
  </Container><nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" hidden={!open}>{site.navigation.map(link => <Link key={link.href} href={link.href} scroll aria-label={link.label} onClick={() => { setOpen(false); toggleRef.current?.focus(); }} aria-current={isCurrent(link.href) ? "page" : undefined}>{link.label}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</nav></header>;
}
