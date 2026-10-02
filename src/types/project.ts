import { projectCategories } from "@/lib/constants";
export type ProjectCategory = (typeof projectCategories)[number];
export interface ProjectImage { src: string; alt: string; caption?: string; }
export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  categories: ProjectCategory[];
  technologies: string[];
  coverImage: ProjectImage;
  images?: ProjectImage[];
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  problem?: string;
  solution?: string;
  role?: string;
  features?: string[];
  results?: string;
  sample?: boolean;
}
