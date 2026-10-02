import Image from "next/image";
import type { ProjectImage } from "@/types/project";
export function ProjectGallery({ images }: { images?: ProjectImage[] }) {
  if (!images?.length) return null;
  return <section className="case-section gallery-section"><h2>Project gallery</h2><div className="project-gallery">{images.map(image => <figure key={image.src}><Image src={image.src} alt={image.alt} width={1000} height={650} sizes="(max-width: 900px) calc(100vw - 48px), 820px" />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div></section>;
}
