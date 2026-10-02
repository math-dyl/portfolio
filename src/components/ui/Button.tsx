import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function Button({ href, children, variant = "primary", className, external = false }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "text"; className?: string; external?: boolean }) {
  return <Link href={href} className={cn("button", "button-" + variant, className)} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</Link>;
}
