import { cn } from "@/lib/utils";

export function TechBackdrop({ variant = "ambient" }: { variant?: "hero" | "ambient" }) {
  return (
    <div className={cn("tech-backdrop", "tech-backdrop-" + variant)} aria-hidden="true" />
  );
}
