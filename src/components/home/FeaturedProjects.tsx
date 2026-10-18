import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { projects } from "@/data/projects";

export function FeaturedProjects() {
  return (
    <section id="selected-work" className="section featured-section">
      <Container>
          <SectionTitle
            eyebrow="02 / Selected work"
            title="Ideas, put into practice."
            description="A few things I’m building across software, learning, and the physical world."
            action={<Button href="/projects" variant="text">View all projects <ArrowUpRight size={17} aria-hidden="true" /></Button>}
          />
        <ProjectGrid projects={projects.filter((project) => project.featured)} prioritizeFirst />
      </Container>
    </section>
  );
}
