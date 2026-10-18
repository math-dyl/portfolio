import type { CSSProperties } from "react";

// Shared fade-up motion for page titles and viewport-triggered content.
export const motion = {
  duration: 750,
  exit: 240,
  stagger: 100,
  headingOffset: "30px",
  blockOffset: "30px",
  mobileHeadingOffset: "30px",
  mobileBlockOffset: "30px",
  easing: "cubic-bezier(.22, 1, .36, 1)",
  entrance: { description: 100, content: 200, branding: 200, actions: 300 },
  observer: { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
  observerRecovery: 2000,
  navbar: { duration: 380, compactAt: 100, expandAt: 80 },
} as const;

export const motionVariables = {
  "--motion-duration": `${motion.duration}ms`,
  "--motion-exit": `${motion.exit}ms`,
  "--motion-stagger": `${motion.stagger}ms`,
  "--motion-easing": motion.easing,
  "--nav-duration": `${motion.navbar.duration}ms`,
  "--motion-heading-offset": motion.headingOffset,
  "--motion-block-offset": motion.blockOffset,
  "--motion-mobile-heading-offset": motion.mobileHeadingOffset,
  "--motion-mobile-block-offset": motion.mobileBlockOffset,
  "--transition": "220ms",
} as CSSProperties;
