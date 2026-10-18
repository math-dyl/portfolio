import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";

export function CaseSection({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return <section className="case-section">
    {eyebrow && <Reveal as="span" className="eyebrow">{eyebrow}</Reveal>}
    <RevealText as="h2" lines={[{ text: title }]} />
    <Reveal delay={motion.stagger}>{children}</Reveal>
  </section>;
}
