import { projectCategories } from "@/lib/constants";
import type { Project, ProjectCategory, ProjectImage } from "@/types/project";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const strings = (value: unknown): string[] => Array.isArray(value)
  ? [...new Set(value.map(text).filter(Boolean))] : [];

export function projectHref(project: Pick<Project, "slug">): string {
  return `/projects/${encodeURIComponent(project.slug)}`;
}

export function externalProjectUrl(value: unknown): string | undefined {
  const href = text(value);
  if (!/^https?:\/\//i.test(href)) return undefined;
  try {
    const url = new URL(href);
    return url.hostname && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function projectImage(value: unknown, title: string): ProjectImage | undefined {
  if (!record(value)) return undefined;
  const src = text(value.src);
  // This portfolio uses public/ assets. Unsupported remote sources must not
  // reach next/image, which would throw without a configured remote pattern.
  if (!/^\/(?!\/)[^?#\\]+\.(?:svg|png|jpe?g|webp|avif|gif)$/i.test(src)) return undefined;
  return { src, alt: text(value.alt) || `${title} preview`, caption: text(value.caption) || undefined };
}

// Normalize once at the data boundary so cards, filters, metadata and detail
// pages all consume the same catalog. An invalid entry cannot break its peers.
export function normalizeProjects(entries: readonly unknown[]): Project[] {
  const slugs = new Set<string>();
  const catalog: Project[] = [];
  for (const entry of entries) {
    if (!record(entry)) continue;
    const slug = text(entry.slug);
    const title = text(entry.title);
    if (!slugPattern.test(slug) || !title || slugs.has(slug)) continue;
    slugs.add(slug);
    const description = text(entry.description) || text(entry.shortDescription) || "Project details are coming soon.";
    catalog.push({
      slug, title, description,
      shortDescription: text(entry.shortDescription) || description,
      categories: strings(entry.categories).filter((category): category is ProjectCategory =>
        projectCategories.some(allowed => allowed === category)),
      technologies: strings(entry.technologies),
      coverImage: projectImage(entry.coverImage, title),
      images: Array.isArray(entry.images) ? entry.images.flatMap(image => {
        const valid = projectImage(image, title);
        return valid ? [valid] : [];
      }) : [],
      featured: entry.featured === true,
      sample: entry.sample === true,
      githubUrl: externalProjectUrl(entry.githubUrl),
      liveUrl: externalProjectUrl(entry.liveUrl),
      problem: text(entry.problem) || undefined,
      solution: text(entry.solution) || undefined,
      role: text(entry.role) || undefined,
      features: strings(entry.features),
      results: text(entry.results) || undefined,
    });
  }
  return catalog;
}
