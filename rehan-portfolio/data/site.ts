/**
 * Single source of truth for identity, links and navigation.
 *
 * Anything that has not been supplied yet is an empty string. Components
 * render an honest "coming soon" state for empty links instead of inventing a
 * URL. Fill these in and every link on the site updates.
 */
export const site = {
  name: "Rehan Mhate",
  title: "Rehan Mhate — AI, Data & Software Engineering",
  description:
    "Portfolio of Rehan Mhate, a Computer Engineering student building projects across AI/ML, data analytics, full-stack development, geospatial technology and IoT.",
  tagline: "I build intelligent systems for real-world problems.",
  positioning: ["Computer Engineering Student", "AI/ML", "Data Analytics", "Full-Stack Development"],
  location: "Mumbai, India",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  links: {
    linkedin: "https://www.linkedin.com/in/rehanmhate08/",
    // Username taken from the origin remote of the MARLIN repo (github.com/rehan-08/sih).
    github: "https://github.com/rehan-08",
    email: "rehanmhate@gmail.com",
    // Drop the real file at /public/Rehan-Mhate-Resume.pdf (replaces the placeholder).
    resume: "/Rehan-Mhate-Resume.pdf",
  },
  resumeIsPlaceholder: true,
} as const;

export const nav = [
  { label: "Home", href: "/", id: "top" },
  { label: "Projects", href: "/#work", id: "work" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Build Log", href: "/#build-log", id: "build-log" },
  { label: "Contact", href: "/#contact", id: "contact" },
] as const;

export function emailHref(): string | null {
  return site.links.email ? `mailto:${site.links.email}` : null;
}
