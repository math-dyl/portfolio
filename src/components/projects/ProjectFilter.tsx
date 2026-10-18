"use client";
import { useState } from "react";
import { projectCategories } from "@/lib/constants";
import type { Project, ProjectCategory } from "@/types/project";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Reveal } from "@/components/ui/Reveal";
export function ProjectFilter({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<ProjectCategory | "All">("All");
  const filtered = category === "All" ? projects : projects.filter(project => project.categories.includes(category));
  return <><Reveal className="filter-bar"><div className="filter-options" role="group" aria-label="Filter projects by category">{(["All", ...projectCategories] as const).map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}{value === "All" && <span>{projects.length}</span>}</button>)}</div><p className="filter-count" role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "project" : "projects"}</p></Reveal>{filtered.length ? <ProjectGrid projects={filtered} prioritizeFirst /> : <Reveal as="p" className="empty-state">New projects in this category are on the way.</Reveal>}</>;
}
