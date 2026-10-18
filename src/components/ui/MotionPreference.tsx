"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";

const motionQuery = "(prefers-reduced-motion: reduce), (forced-colors: active)";
function subscribe(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const MotionContext = createContext({ paused: false, reduced: false, toggle: () => {} });
function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(motionQuery).matches, () => false);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  return (
    <MotionContext.Provider value={{ paused, reduced, toggle: () => setPaused(value => !value) }}>
      <div className="portfolio-shell" data-motion-paused={paused || reduced} data-tab-hidden={hidden}>{children}</div>
    </MotionContext.Provider>
  );
}

export function useMotionPreference() { return useContext(MotionContext); }

export function MotionToggle() {
  const { paused, reduced, toggle } = useMotionPreference();
  return (
    <button className="motion-toggle" type="button" onClick={toggle} aria-pressed={paused || reduced} disabled={reduced}>
      {paused || reduced ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
      {reduced ? "Reduced motion enabled" : paused ? "Resume animation" : "Pause animation"}
    </button>
  );
}
