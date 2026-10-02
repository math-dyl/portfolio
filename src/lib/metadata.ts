import type { Metadata } from "next";
import { site } from "@/config/site";
export function pageMetadata(title: string, description: string, pathname: string, image = "/images/social/mathdyl.png"): Metadata {
  return { title, description, alternates: { canonical: pathname }, openGraph: { title: title + " | " + site.name, description, url: pathname, siteName: site.name, type: "website", images: [{ url: image.replace(/\.svg$/, ".png"), width: 1000, height: 650, alt: title }] }, twitter: { card: "summary_large_image", title, description } };
}
