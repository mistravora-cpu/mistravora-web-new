const base = "/tech";
const icon = (slug: string) => `${base}/${slug}.svg`;
const cdn = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const cdnIcon = (slug: string) => `${cdn}/${slug}`;

export const techCategories = [
  {
    id: "frontend",
    label: "Frontend",
    items: [
      { name: "React", icon: icon("react") },
      { name: "Next.js", icon: icon("nextdotjs") },
      { name: "TypeScript", icon: icon("typescript") },
      { name: "Tailwind CSS", icon: icon("tailwindcss") },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    items: [
      { name: "Node.js", icon: icon("nodedotjs") },
      { name: "Python", icon: icon("python") },
      { name: "Express.js", icon: icon("express") },
      { name: "REST APIs", icon: "" },
    ],
  },
  {
    id: "database",
    label: "Databases",
    items: [
      { name: "PostgreSQL", icon: icon("postgresql") },
      { name: "MySQL", icon: icon("mysql") },
      { name: "MongoDB", icon: icon("mongodb") },
      { name: "Supabase", icon: icon("supabase") },
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    items: [
      { name: "Vercel", icon: icon("vercel") },
      { name: "AWS", icon: icon("amazonaws") },
      { name: "Cloudflare", icon: cdnIcon("cloudflare/cloudflare-original.svg") },
      { name: "Docker", icon: icon("docker") },
      { name: "GitHub", icon: icon("github") },
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [
      { name: "OpenAI", icon: cdnIcon("openai/openai-original.svg") },
      { name: "Gemini", icon: "" },
      { name: "Claude", icon: "" },
      { name: "AI APIs", icon: "" },
      { name: "AI Agents", icon: "" },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    items: [
      { name: "React Native", icon: icon("react") },
      { name: "Expo", icon: cdnIcon("expo/expo-original.svg") },
      { name: "Android", icon: cdnIcon("android/android-original.svg") },
      { name: "iOS", icon: cdnIcon("apple/apple-original.svg") },
    ],
  },
  {
    id: "design",
    label: "Design",
    items: [
      { name: "Figma", icon: icon("figma") },
      { name: "Adobe", icon: cdnIcon("photoshop/photoshop-original.svg") },
      { name: "Canva", icon: icon("canva") },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Marketing",
    items: [
      { name: "Google Analytics", icon: cdnIcon("googleanalytics/googleanalytics-original.svg") },
      { name: "Search Console", icon: "" },
      { name: "Meta", icon: icon("meta") },
      { name: "Google Ads", icon: icon("googleads") },
    ],
  },
] as const;
