import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";
export function SectionTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <Reveal as="p" className="eyebrow">{eyebrow}</Reveal>}<RevealText as="h2" lines={[{ text: title }]} />{description && <Reveal as="p" className="section-description" delay={motion.stagger}>{description}</Reveal>}</div>{action && <Reveal delay={motion.stagger * 2}>{action}</Reveal>}</div>;
}
