export const site = {
  name: "Mathdyl",
  fullName: "John Markdyl Vidad",
  description: "Software, AI, and engineering for practical problems. Explore Mathdyl’s work in educational technology, automation, and community systems.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // Replace these null values with your real contact details. Links appear automatically.
  email: "mathdyl.business@gmail.com" as string | null,
  github: "https://github.com/math-dyl" as string | null,
  linkedin: null as string | null,
  navigation: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};
