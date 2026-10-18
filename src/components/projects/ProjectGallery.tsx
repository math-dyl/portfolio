import { ProjectImage } from "@/components/projects/ProjectImage";
import type { ProjectImage as ProjectImageData } from "@/types/project";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";
export function ProjectGallery({ images }: { images?: ProjectImageData[] }) {
  if (!images?.length) return null;
  return <section className="case-section gallery-section"><RevealText as="h2" lines={[{ text: "Project gallery" }]} /><div className="project-gallery">{images.map((image, index) => <Reveal as="figure" key={`${image.src}-${index}`} delay={Math.min(index, 3) * motion.stagger}><ProjectImage image={image} title="Project gallery" width={1000} height={650} sizes="(max-width: 900px) calc(100vw - 48px), 820px" />{image.caption && <figcaption>{image.caption}</figcaption>}</Reveal>)}</div></section>;
}
