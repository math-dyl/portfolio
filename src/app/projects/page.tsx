import { Container } from "@/components/layout/Container";
import { ProjectFilter } from "@/components/projects/ProjectFilter";
import { ContactCTA } from "@/components/home/ContactCTA";
import { projects } from "@/data/projects";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Projects", "Explore software, AI, education, engineering, and community projects by Mathdyl.", "/projects");
export default function ProjectsPage() {
  return <><Container><header className="page-heading"><p className="eyebrow">Projects / The portfolio</p><h1>Built with purpose.</h1><p className="page-description">A collection of ideas turned into practical technology.<br />Explore the work, the thinking, and the problems behind it.</p></header><section className="projects-list" aria-label="Projects"><ProjectFilter projects={projects} /></section></Container><ContactCTA /></>;
}
