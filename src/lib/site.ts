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

export const solutions = [
  {
    title: "Custom Web Platforms",
    description:
      "High-performance marketing sites, portals, and web apps built on Next.js with strict performance budgets.",
  },
  {
    title: "Business Software",
    description:
      "Internal tools, dashboards, and workflow systems that replace spreadsheets and manual processes.",
  },
  {
    title: "E-Commerce",
    description:
      "Fast storefronts and ordering systems optimized for Sri Lankan and international customers.",
  },
  {
    title: "Mobile-Ready Products",
    description:
      "Progressive web apps that install like native apps and keep working on slow networks.",
  },
  {
    title: "AI-Powered Features",
    description:
      "Chat assistants, smart search, and automation grounded in your own business data.",
  },
  {
    title: "Care & Maintenance",
    description:
      "Ongoing support, monitoring, and iteration so your platform keeps improving after launch.",
  },
] as const;

export const pricingTiers = [
  {
    name: "Starter",
    price: "LKR 150k+",
    description: "Launch a fast, professional marketing site.",
    features: [
      "5–8 page marketing website",
      "CMS-managed content",
      "SEO + analytics setup",
      "WhatsApp & contact forms",
      "30 days of support",
    ],
  },
  {
    name: "Growth",
    price: "LKR 400k+",
    description: "A conversion-focused platform with tooling.",
    features: [
      "Everything in Starter",
      "Calculators & lead magnets",
      "Blog + case study system",
      "Booking & automation",
      "90 days of support",
    ],
  },
  {
    name: "Custom",
    price: "Let's talk",
    description: "Portals, web apps, and long-term builds.",
    features: [
      "Everything in Growth",
      "Client portal / dashboards",
      "AI assistant & integrations",
      "Dedicated delivery plan",
      "Ongoing partnership",
    ],
  },
] as const;
