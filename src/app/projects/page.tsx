import { Container } from "@/components/layout/Container";
import { ProjectFilter } from "@/components/projects/ProjectFilter";
import { ContactCTA } from "@/components/home/ContactCTA";
import { PageHeading } from "@/components/ui/PageHeading";
import { projects } from "@/data/projects";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata("Projects", "Explore software, AI, education, engineering, and community projects by Mathdyl.", "/projects");
export default function ProjectsPage() {
  return <><Container><PageHeading eyebrow="Projects / The portfolio" lines={[{ text: "Built with purpose." }]} description={<>A collection of ideas turned into practical technology.<br />Explore the work, the thinking, and the problems behind it.</>} /><section className="projects-list" aria-labelledby="projects-heading"><h2 id="projects-heading" className="sr-only">Portfolio projects</h2><ProjectFilter projects={projects} /></section></Container><ContactCTA /></>;
}
