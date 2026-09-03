// Fallback tech stack — used only when the database has no tech_stack rows.
// Icons use Simple Icons CDN (https://simpleicons.org) and Iconify for brands
// not available on Simple Icons. The database is the primary source.
const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const ic = (slug: string) => `https://api.iconify.design/logos:${slug}.svg`;

export const techCategories = [
  {
    id: "frontend",
    label: "Frontend",
    items: [
      { name: "React", icon: si("react") },
      { name: "Next.js", icon: si("nextdotjs") },
      { name: "TypeScript", icon: si("typescript") },
      { name: "Tailwind CSS", icon: si("tailwindcss") },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    items: [
      { name: "Node.js", icon: si("nodedotjs") },
      { name: "Supabase", icon: si("supabase") },
      { name: "PostgreSQL", icon: si("postgresql") },
      { name: "Zod", icon: si("zod") },
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    items: [
      { name: "Vercel", icon: si("vercel") },
      { name: "Cloudflare", icon: si("cloudflare") },
      { name: "AWS S3", icon: ic("aws") },
      { name: "Docker", icon: si("docker") },
      { name: "GitHub Actions", icon: si("githubactions") },
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [
      { name: "Anthropic Claude", icon: si("anthropic") },
      { name: "OpenAI", icon: ic("openai") },
      { name: "Three.js", icon: si("threedotjs") },
      { name: "Framer Motion", icon: si("framer") },
    ],
  },
  {
    id: "tools",
    label: "Tools & Monitoring",
    items: [
      { name: "Stripe", icon: si("stripe") },
      { name: "Redis", icon: si("redis") },
      { name: "Sentry", icon: si("sentry") },
      { name: "PostHog", icon: si("posthog") },
    ],
  },
] as const;
