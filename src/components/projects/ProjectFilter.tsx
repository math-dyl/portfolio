"use client";
import { useState } from "react";
import { projectCategories } from "@/lib/constants";
import type { Project, ProjectCategory } from "@/types/project";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
export function ProjectFilter({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<ProjectCategory | "All">("All");
  const filtered = category === "All" ? projects : projects.filter(project => project.categories.includes(category));
  return <><div className="filter-bar"><div className="filter-options" role="group" aria-label="Filter projects by category">{(["All", ...projectCategories] as const).map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}{value === "All" && <span>{projects.length}</span>}</button>)}</div><p className="filter-count" role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "project" : "projects"}</p></div>{filtered.length ? <ProjectGrid projects={filtered} prioritizeFirst /> : <p className="empty-state">New projects in this category are on the way.</p>}</>;
}
