"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion as timing } from "@/lib/motion";
import { useMotionPreference } from "@/components/ui/MotionPreference";

export function Reveal({
  as: Tag = "div",
  className,
  children,
  delay = 0,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  delay?: number;
} & HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const seen = useRef(false);
  const { paused, reduced } = useMotionPreference();

  useLayoutEffect(() => {
    const el = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce), (forced-colors: active)");
    if (!el) return;
    const root = document.documentElement;
    const bootstrapExpired = root.dataset.revealState === "expired" && root.dataset.revealPath === window.location.pathname;
    if (root.dataset.revealState === "expired" && !bootstrapExpired) root.dataset.revealState = "ready";
    if (root.dataset.revealState === "booting") root.dataset.revealState = "ready";
    let observer: IntersectionObserver | undefined;
    let recovery: number | undefined;
    const showStatic = () => {
      seen.current = true;
      observer?.disconnect();
      window.clearTimeout(recovery);
      el.classList.remove("is-pending");
      el.classList.remove("is-visible");
      el.classList.add("is-revealed");
    };
    if (bootstrapExpired || paused || reduced || motion.matches || !("IntersectionObserver" in window)) { showStatic(); return; }
    if (seen.current) return;

    // Enhance before paint on navigation; unenhanced server content is visible.
    const reveal = () => {
      seen.current = true;
      el.classList.remove("is-pending");
      el.classList.add("is-visible");
      observer?.disconnect();
    };
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === el && event.animationName === "fade-up") showStatic();
    };
    try {
      observer = new IntersectionObserver(([entry]) => {
        // The initial callback proves observation works, even below the fold.
        window.clearTimeout(recovery);
        if (entry?.isIntersecting) reveal();
      }, timing.observer);
      recovery = window.setTimeout(showStatic, timing.observerRecovery);
      el.classList.add("is-pending");
      observer.observe(el);
      el.addEventListener("animationend", onAnimationEnd);
      // Keyboard users can interact immediately with unrevealed controls.
      el.addEventListener("focusin", showStatic);
    } catch {
      showStatic();
    }
    return () => {
      observer?.disconnect();
      window.clearTimeout(recovery);
      el.removeEventListener("animationend", onAnimationEnd);
      el.removeEventListener("focusin", showStatic);
      el.classList.remove("is-pending");
    };
  }, [paused, reduced]);

  return (
    <Tag ref={ref} className={cn("reveal", className)} {...rest} style={{ "--reveal-duration": `${timing.duration}ms`, "--reveal-easing": timing.easing, "--reveal-delay": `${delay}ms`, ...rest.style } as CSSProperties}>
      {children}
    </Tag>
  );
}
