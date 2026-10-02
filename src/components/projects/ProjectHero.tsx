import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/types/project";
export function ProjectHero({ project, number }: { project: Project; number?: number }) {
  return <><Link className="back-link" href="/projects"><ArrowLeft size={16} aria-hidden="true" />All projects</Link><header className="project-detail-heading"><p className="eyebrow">Project / {number === undefined ? "Case study" : String(number).padStart(2, "0")}</p><p className="project-detail-category">{project.categories.join(" / ")}</p><h1>{project.title}</h1><p className="page-description">{project.shortDescription}</p><div className="tech-tags">{project.technologies.map(tech => <Badge key={tech}>{tech}</Badge>)}</div>{(project.githubUrl || project.liveUrl) && <div className="project-links">{project.githubUrl && <Button href={project.githubUrl} variant="secondary" external><Code2 size={17} aria-hidden="true" />Source code</Button>}{project.liveUrl && <Button href={project.liveUrl} external>Live demo<ArrowUpRight size={17} aria-hidden="true" /></Button>}</div>}</header><figure className="detail-cover"><Image src={project.coverImage.src} alt={project.coverImage.alt} width={1000} height={650} sizes="(max-width: 1232px) calc(100vw - 48px), 1184px" priority />{project.sample && <figcaption>Illustrative concept preview · sample project details</figcaption>}</figure></>;
}
