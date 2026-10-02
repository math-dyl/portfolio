import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types/project";
export function ProjectCard({ project, priority = false, number }: { project: Project; priority?: boolean; number?: number }) {
  return <article className="project-card"><Link href={"/projects/" + project.slug} className="project-image-link" aria-label={"View " + project.title}><Image src={project.coverImage.src} alt={project.coverImage.alt} width={1000} height={650} sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1232px) calc((100vw - 80px) / 2), 576px" priority={priority} className="project-cover" />{project.sample && <span className="preview-label">Concept preview</span>}<span className="project-image-arrow"><ArrowUpRight size={21} aria-hidden="true" /></span></Link><div className="project-card-content"><div className="project-meta"><span>{project.categories.join(" / ")}</span>{number !== undefined && <span className="project-number">{String(number).padStart(2, "0")}</span>}</div><h3><Link href={"/projects/" + project.slug}>{project.title}</Link></h3><p>{project.shortDescription}</p><div className="project-card-bottom"><div className="tech-tags">{project.technologies.map(tech => <Badge key={tech}>{tech}</Badge>)}</div><Link href={"/projects/" + project.slug} className="project-view">View project <ArrowUpRight size={15} aria-hidden="true" /></Link></div></div></article>;
}
