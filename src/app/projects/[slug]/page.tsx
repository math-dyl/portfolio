import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ContactCTA } from "@/components/home/ContactCTA";
import { Button } from "@/components/ui/Button";
import { projects, getProject } from "@/data/projects";
import { pageMetadata } from "@/lib/metadata";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return pageMetadata(project.title, project.shortDescription, "/projects/" + project.slug, project.coverImage.src);
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params; const project = getProject(slug);
  if (!project) notFound();
  return <><Container className="project-detail"><ProjectHero project={project} number={projects.indexOf(project) + 1} /><div className="case-layout"><aside className="case-summary"><p className="eyebrow">Project / Specifications</p><dl><dt>Focus</dt><dd>{project.categories.join(" / ")}</dd><dt>Stack</dt><dd>{project.technologies.join(", ")}</dd>{project.sample && <><dt>Case study</dt><dd>Sample information</dd></>}</dl></aside><div className="case-content"><section className="case-section"><h2>Overview</h2><p>{project.description}</p></section>{project.problem && <section className="case-section"><span className="eyebrow">01 / The challenge</span><h2>The problem</h2><p>{project.problem}</p></section>}{project.solution && <section className="case-section"><span className="eyebrow">02 / The approach</span><h2>The solution</h2><p>{project.solution}</p></section>}{project.role && <section className="case-section"><h2>My role</h2><p>{project.role}</p></section>}{!!project.features?.length && <section className="case-section"><h2>Key features</h2><ul className="feature-list">{project.features.map(feature => <li key={feature}><Check size={17} aria-hidden="true" />{feature}</li>)}</ul></section>}<ProjectGallery images={project.images} />{project.results && <section className="case-section"><span className="eyebrow">03 / The outcome</span><h2>Results & impact</h2><p>{project.results}</p></section>}<Button href="/projects" variant="secondary">Explore more projects <ArrowUpRight size={17} aria-hidden="true" /></Button></div></div></Container><ContactCTA /></>;
}
