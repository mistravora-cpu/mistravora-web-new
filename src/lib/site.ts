import { businessDefaults } from "./business-profile-data";

export const site = businessDefaults;

export const mainNav = [
  { title: "Solutions", href: "/solutions" },
  { title: "Industries", href: "/industries" },
  { title: "Pricing", href: "/pricing" },
  { title: "Projects", href: "/projects" },
  { title: "Blog", href: "/blog" },
  { title: "Research", href: "/research" },
  { title: "About", href: "/about" },
  { title: "Careers", href: "/careers" },
  { title: "Tools", href: "/tools" },
] as const;
