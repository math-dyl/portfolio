import { ProjectImage } from "@/components/projects/ProjectImage";
import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types/project";
import { Reveal } from "@/components/ui/Reveal";
import { motion } from "@/lib/motion";
import { projectHref } from "@/lib/projects";
export function ProjectCard({ project, priority = false, number }: { project: Project; priority?: boolean; number?: number }) {
  const href = projectHref(project);
  return (
    <Reveal className="project-card-reveal" delay={motion.entrance.content + Math.min(Math.max((number ?? 1) - 1, 0), 3) * motion.stagger}><article className="project-card">
      <Link href={href} className="project-image-link" aria-label={"View " + project.title}>
        <ProjectImage
          image={project.coverImage} title={project.title} width={1000} height={650}
          sizes="(max-width: 767px) calc(100vw - 72px), (max-width: 1232px) calc((100vw - 136px) / 2), 548px"
          priority={priority} className="project-cover"
        />
        {project.sample && <span className="preview-label">Concept preview</span>}
        <span className="project-image-arrow"><ArrowUpRight size={21} aria-hidden="true" /></span>
      </Link>
      <div className="project-card-content">
        <div className="project-meta"><span>{project.categories.join(" / ")}</span>{number !== undefined && <span className="project-number">{String(number).padStart(2, "0")}</span>}</div>
        <h3><Link href={href}>{project.title}</Link></h3>
        <p>{project.shortDescription}</p>
        <div className="project-card-bottom">
          <div className="tech-tags">{project.technologies.map(tech => <Badge key={tech}>{tech}</Badge>)}</div>
          <div className="project-card-links">
            <Link href={href} className="project-view" aria-label={"View " + project.title + " case study"}>View project <ArrowUpRight size={15} aria-hidden="true" /></Link>
            {project.githubUrl && <a className="project-external" href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={project.title + " source on GitHub"}><Code2 size={16} aria-hidden="true" /><span>Source</span></a>}
            {project.liveUrl && <a className="project-external" href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={"Open " + project.title + " live demo"}><ArrowUpRight size={16} aria-hidden="true" /><span>Demo</span></a>}
          </div>
        </div>
      </div>
    </article></Reveal>
  );
}
