import { cn } from "@/lib/utils";
export function TechBackdrop({ variant = "ambient" }: { variant?: "hero" | "ambient" }) {
  return <div className={cn("tech-backdrop", "tech-backdrop-" + variant)} aria-hidden="true"><span className="backdrop-crosshair crosshair-left">+</span><span className="backdrop-crosshair crosshair-right">+</span></div>;
}
