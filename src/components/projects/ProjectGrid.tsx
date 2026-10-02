import type { Project } from "@/types/project";
import { ProjectCard } from "@/components/projects/ProjectCard";
export function ProjectGrid({ projects, prioritizeFirst = false }: { projects: Project[]; prioritizeFirst?: boolean }) {
  return <div className="project-grid">{projects.map((project, index) => <ProjectCard key={project.slug} project={project} number={index + 1} priority={prioritizeFirst && index < 2} />)}</div>;
}
