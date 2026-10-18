import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/data/projects";
import { projectHref } from "@/lib/projects";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/projects", "/about", "/contact", ...projects.map(projectHref)].map(route => ({ url: new URL(route, site.url).href })); }
