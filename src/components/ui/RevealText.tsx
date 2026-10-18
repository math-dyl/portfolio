import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

type Line = {
  text: string;
  className?: string;
};

export function RevealText({
  as: Tag = "h1",
  lines,
  className,
  delay = 0,
}: {
  as?: "h1" | "h2" | "h3";
  lines: Line[];
  className?: string;
  delay?: number;
}) {
  const plain = lines.map((line) => line.text).join(" ");

  return (
    <Reveal as={Tag} className={cn("reveal-heading", className)} delay={delay}>
      <span className="sr-only">{plain}</span>
      <span className="reveal-text" aria-hidden="true">
        {lines.map((line, index) => <span className={cn("reveal-line", line.className)} key={index}>{line.text}</span>)}
      </span>
    </Reveal>
  );
}
