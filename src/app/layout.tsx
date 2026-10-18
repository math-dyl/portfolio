import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AntigravityBackground } from "@/components/ui/AntigravityBackground";
import { MotionProvider } from "@/components/ui/MotionPreference";
import { PageTransition } from "@/components/ui/PageTransition";
import { site } from "@/config/site";
import { motionVariables } from "@/lib/motion";
import { revealBootstrap } from "@/lib/reveal-bootstrap";
import "./globals.css";
export const viewport: Viewport = { colorScheme: "dark", themeColor: "#050505" };
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name + " — Software, AI & Engineering", template: "%s | " + site.name },
  description: site.description,
  openGraph: { title: site.name + " — Software, AI & Engineering", description: site.description, url: "/", siteName: site.name, type: "website", locale: "en_US" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" style={motionVariables} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: revealBootstrap }} /></head><body id="top"><MotionProvider><AntigravityBackground /><a className="skip-link" href="#main-content">Skip to content</a><Navbar /><main id="main-content" tabIndex={-1}><PageTransition>{children}</PageTransition></main><Footer /></MotionProvider></body></html>;
}
