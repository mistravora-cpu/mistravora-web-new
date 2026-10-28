import { getBusinessProfile } from "@/lib/business-profile";
import { getCollection } from "@/lib/content";
import { contentText } from "@/lib/content-preview";
import { getCaseStudies, getPublishedPosts, getResearch } from "@/lib/services";

export const revalidate = 300;

// Markdown links follow the llms.txt convention: "- [Title](url): summary".
const link = (title: string, url: string, summary?: string | null) => {
  const note = contentText(summary, 160);
  return `- [${title.replace(/[[\]]/g, "")}](${url})${note ? `: ${note}` : ""}`;
};
const settle = async <T,>(promise: Promise<T[]>) => promise.catch(() => [] as T[]);

export async function GET() {
  const p = await getBusinessProfile();
  const [services, projects, posts, research] = await Promise.all([
    settle(getCollection("services")),
    settle(getCaseStudies(true)),
    settle(getPublishedPosts()),
    settle(getResearch(true)),
  ]);
  const sections = [
    `# ${p.name}`,
    `> ${contentText(p.description)}`,
    [
      "## Business details",
      `- Founded: ${p.founded}`,
      `- Founder: ${p.founder}`,
      `- Co-Founder: ${p.cofounder}`,
      `- Location: ${p.address}`,
      `- Markets: ${p.coverage}`,
      `- Customers: ${p.customers}`,
      `- Industries: ${p.industries}`,
      `- Email: ${p.email}`,
      `- Phone: ${p.phone}`,
      `- Availability: ${p.availability}`,
      `- Response: ${p.response}`,
    ].join("\n"),
    [
      "## Key pages",
      link("Services", `${p.url}/services`, "Software, web, mobile, SEO and digital marketing services."),
      link("Projects and case studies", `${p.url}/projects`, "Completed client projects with outcomes."),
      link("Pricing and project estimate", `${p.url}/pricing#estimate`, "Indicative pricing and a requirement brief builder."),
      link("About the company", `${p.url}/about`, "Company story, values and team."),
      link("Book a consultation", `${p.url}/book`, "Request a free 30-minute meeting with the team."),
      link("Contact", `${p.url}/contact`, `${p.availability}. ${p.response}.`),
      link("Free website audit", `${p.url}/tools/website-audit`, "Check a website's SEO, accessibility, performance and best practices."),
    ].join("\n"),
    services.length ? ["## Services", ...services.map(s => link(s.title, `${p.url}/services/${s.slug}`, s.description))].join("\n") : "",
    projects.length ? ["## Projects", ...projects.slice(0, 12).map(c => link(c.title, `${p.url}/projects/${c.slug}`, c.outcome || c.problem_statement))].join("\n") : "",
    posts.length || research.length ? [
      "## Articles and research",
      ...posts.slice(0, 10).map(post => link(post.title, `${p.url}/blog/${post.slug}`, post.excerpt)),
      ...research.slice(0, 10).map(r => link(r.title, `${p.url}/research/${r.slug}`, r.summary)),
    ].join("\n") : "",
    [
      "## Optional",
      link("Full company profile for AI systems", `${p.url}/llms-full.txt`),
      link("Company data (JSON)", `${p.url}/api/company`),
      link("Sitemap", `${p.url}/sitemap.xml`),
    ].join("\n"),
  ];
  return new Response(`${sections.filter(Boolean).join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
