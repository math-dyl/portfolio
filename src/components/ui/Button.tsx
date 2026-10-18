import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function Button({ href, children, variant = "primary", className, external = false }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "text"; className?: string; external?: boolean }) {
  const classes = cn("button", "button-" + variant, className);
  return external
    ? <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{children}</a>
    : <Link href={href} className={classes}>{children}</Link>;
}
