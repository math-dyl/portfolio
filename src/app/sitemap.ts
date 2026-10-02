import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/data/projects";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/projects", "/about", "/contact", ...projects.map(project => "/projects/" + project.slug)].map(route => ({ url: new URL(route, site.url).href })); }
