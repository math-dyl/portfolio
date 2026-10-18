import { ProjectImage } from "@/components/projects/ProjectImage";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/types/project";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";
export function ProjectHero({ project, number }: { project: Project; number?: number }) {
  return <><Reveal><Link className="back-link" href="/projects"><ArrowLeft size={16} aria-hidden="true" />All projects</Link></Reveal><header className="project-detail-heading"><Reveal as="p" className="eyebrow">Project / {number === undefined ? "Case study" : String(number).padStart(2, "0")}</Reveal><Reveal as="p" className="project-detail-category">{project.categories.join(" / ")}</Reveal><RevealText lines={[{ text: project.title }]} /><Reveal as="p" className="page-description" delay={motion.entrance.description}>{project.shortDescription}</Reveal><Reveal className="tech-tags" delay={motion.entrance.branding}>{project.technologies.map(tech => <Badge key={tech}>{tech}</Badge>)}</Reveal>{(project.githubUrl || project.liveUrl) && <Reveal className="project-links" delay={motion.entrance.actions}>{project.githubUrl && <Button href={project.githubUrl} variant="secondary" external><Code2 size={17} aria-hidden="true" />Source code</Button>}{project.liveUrl && <Button href={project.liveUrl} external>Live demo<ArrowUpRight size={17} aria-hidden="true" /></Button>}</Reveal>}</header><Reveal as="figure" className="detail-cover"><ProjectImage image={project.coverImage} title={project.title} width={1000} height={650} sizes="(max-width: 1232px) calc(100vw - 48px), 1184px" priority />{project.sample && <figcaption>Illustrative concept preview · sample project details</figcaption>}</Reveal></>;
}
