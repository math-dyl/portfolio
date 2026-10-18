import { motion } from "@/lib/motion";

// Runs before body paint. No JavaScript means visible server-rendered content;
// failed or slow hydration releases content instead of leaving it hidden.
export const revealBootstrap = `(() => {
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches) return;
  root.dataset.revealState = 'booting';
  root.dataset.revealPath = window.location.pathname;
  window.setTimeout(() => {
    if (root.dataset.revealState === 'booting') root.dataset.revealState = 'expired';
  }, ${motion.observerRecovery});
})();`;
