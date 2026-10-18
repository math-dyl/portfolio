"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMotionPreference } from "@/components/ui/MotionPreference";
import { motion } from "@/lib/motion";

// Exit only: each destination's Reveal/RevealText owns its entrance. No whole
// page entrance or snapshot can double content motion or freeze the scene.
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const exit = useRef<Animation | null>(null);
  const lastPath = useRef(pathname);
  const navigationTimer = useRef<number | null>(null);
  const recoveryTimer = useRef<number | null>(null);
  const { paused, reduced } = useMotionPreference();

  useLayoutEffect(() => {
    exit.current?.cancel();
    if (recoveryTimer.current !== null) window.clearTimeout(recoveryTimer.current);
    recoveryTimer.current = null;
    if (lastPath.current !== pathname) {
      // Reset synchronously with the committed destination, before its reveals
      // intersect. Hash destinations keep the router's anchor behavior.
      if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
    lastPath.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (paused || reduced) exit.current?.cancel();
    const clear = () => {
      if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
      if (recoveryTimer.current !== null) window.clearTimeout(recoveryTimer.current);
      navigationTimer.current = recoveryTimer.current = null;
      exit.current?.cancel();
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || anchor.target && anchor.target !== "_self" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.hash) { clear(); return; }
      if (url.pathname === window.location.pathname) {
        clear();
        if (url.search === window.location.search) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        return;
      }
      if (paused || reduced) return;
      if (!ref.current?.animate) return;
      clear();
      try {
        exit.current = ref.current.animate([
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-.55em)" },
        ], { duration: motion.exit, easing: motion.easing, fill: "forwards" });
      } catch {
        // An unavailable animation must leave the Link's navigation intact.
        return;
      }
      event.preventDefault();
      navigationTimer.current = window.setTimeout(() => {
        navigationTimer.current = null;
        // Failed navigation must never leave the current content hidden.
        recoveryTimer.current = window.setTimeout(() => exit.current?.cancel(), 1000);
        try {
          router.push(url.pathname + url.search, { scroll: true });
        } catch {
          clear();
          window.location.assign(url.href);
        }
      }, motion.exit);
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", clear);
    return () => {
      clear();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", clear);
    };
  }, [pathname, paused, reduced, router]);

  return <div ref={ref} className="page-transition"><div key={pathname}>{children}</div></div>;
}
