import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";

export function PageHeading({ eyebrow, lines, description, action }: {
  eyebrow: string;
  lines: { text: string; className?: string }[];
  description: ReactNode;
  action?: ReactNode;
}) {
  return <header className="page-heading">
    <Reveal as="p" className="eyebrow">{eyebrow}</Reveal>
    <RevealText lines={lines} />
    <Reveal as="p" className="page-description" delay={motion.entrance.description}>{description}</Reveal>
    {action && <Reveal className="page-heading-action" delay={motion.entrance.actions}>{action}</Reveal>}
  </header>;
}
