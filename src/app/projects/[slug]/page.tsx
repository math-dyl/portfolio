import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { CaseSection } from "@/components/projects/CaseSection";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ContactCTA } from "@/components/home/ContactCTA";
import { Button } from "@/components/ui/Button";
import { projects, getProject } from "@/data/projects";
import { pageMetadata } from "@/lib/metadata";
import { projectHref } from "@/lib/projects";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return pageMetadata(project.title, project.shortDescription, projectHref(project), project.coverImage?.src);
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params; const project = getProject(slug);
  if (!project) notFound();
  return <><Container className="project-detail"><ProjectHero project={project} number={projects.indexOf(project) + 1} /><div className="case-layout"><Reveal as="aside" className="case-summary"><p className="eyebrow">Project / Specifications</p><dl><dt>Focus</dt><dd>{project.categories.join(" / ")}</dd><dt>Stack</dt><dd>{project.technologies.join(", ")}</dd>{project.sample && <><dt>Case study</dt><dd>Sample information</dd></>}</dl></Reveal><div className="case-content"><CaseSection title="Overview"><p>{project.description}</p></CaseSection>{project.problem && <CaseSection title="The problem" eyebrow="01 / The challenge"><p>{project.problem}</p></CaseSection>}{project.solution && <CaseSection title="The solution" eyebrow="02 / The approach"><p>{project.solution}</p></CaseSection>}{project.role && <CaseSection title="My role"><p>{project.role}</p></CaseSection>}{!!project.features?.length && <CaseSection title="Key features"><ul className="feature-list">{project.features.map(feature => <li key={feature}><Check size={17} aria-hidden="true" />{feature}</li>)}</ul></CaseSection>}<ProjectGallery images={project.images} />{project.results && <CaseSection title="Results & impact" eyebrow="03 / The outcome"><p>{project.results}</p></CaseSection>}<Reveal><Button href="/projects" variant="secondary">Explore more projects <ArrowUpRight size={17} aria-hidden="true" /></Button></Reveal></div></div></Container><ContactCTA /></>;
}
