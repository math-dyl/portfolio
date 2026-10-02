import { Hero } from "@/components/home/Hero";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Services } from "@/components/home/Services";
import { ContactCTA } from "@/components/home/ContactCTA";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/config/site";
export const metadata = pageMetadata("Software that solves real problems", site.description, "/");
export default function HomePage() { return <><Hero /><FeaturedProjects /><Services /><ContactCTA /></>; }
