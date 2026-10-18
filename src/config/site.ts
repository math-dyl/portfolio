export const site = {
  name: "Mathdyl",
  fullName: "John Markdyl Vidad",
  solutionName: "Mathdyl Solution",
  tagline: "Engineering Intelligent Solutions.",
  description: "John Markdyl Vidad’s software, AI, and engineering portfolio. Mathdyl Solution — Engineering Intelligent Solutions through software, automation, and digital systems.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // Replace these null values with your real contact details. Links appear automatically.
  email: "mathdyl.business@gmail.com" as string | null,
  github: "https://github.com/math-dyl" as string | null,
  linkedin: "https://www.linkedin.com/in/vidad-john-markdyl-b-480610380/?isSelfProfile=true" as string | null,
  navigation: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};
