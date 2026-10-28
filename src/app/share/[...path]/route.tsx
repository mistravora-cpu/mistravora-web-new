import { collections, isCollection, getCollection } from "@/lib/content";
import { contentText } from "@/lib/content-preview";
import { getBusinessProfile } from "@/lib/business-profile";
import { renderShareImage, type ShareCard } from "@/lib/share-image";
import { getCaseStudyBySlug, getIndustryBySlug, getPostBySlug, getResearchBySlug, getTeamMemberBySlug } from "@/lib/services";

export const revalidate = 3600;

// Fixed public pages. Anything unknown falls back to the homepage card, so the
// route never renders arbitrary text supplied in a URL.
const pages: Record<string, Omit<ShareCard, "image">> = {
  solutions: { eyebrow: "Solutions", title: "Software solutions built around your business", description: "POS, ERP, booking, e-commerce and custom platforms designed for how you work." },
  industries: { eyebrow: "Industries", title: "Digital solutions for every industry", description: "Software, websites and marketing tailored to your sector." },
  pricing: { eyebrow: "Pricing", title: "Transparent pricing and project estimates", description: "Compare packages and build a requirement brief for a preliminary quotation." },
  projects: { eyebrow: "Our work", title: "Projects and case studies", description: "Real products we have designed, built and launched for our clients." },
  blog: { eyebrow: "Blog", title: "Insights on software, web and growth", description: "Practical articles from the Mistravora team." },
  research: { eyebrow: "Research", title: "Research and analysis", description: "Original research on web performance, search, AI and software engineering." },
  insights: { eyebrow: "Insights", title: "Insights and resources", description: "Articles, research and guides from Mistravora." },
  about: { eyebrow: "About us", title: "Meet the team behind Mistravora", description: "Our story, values and the people who build your product." },
  careers: { eyebrow: "Careers", title: "Build the future with Mistravora", description: "Open roles and what it is like to work with us." },
  tools: { eyebrow: "Free tools", title: "Free tools for planning your project", description: "Cost calculator, ROI calculator and website audit." },
  "tools/website-audit": { eyebrow: "Free tool", title: "Free website audit", description: "Check your site's SEO, accessibility, performance and best practices in seconds." },
  "tools/roi-calculator": { eyebrow: "Free tool", title: "Software ROI calculator", description: "Estimate the return on investing in custom software." },
  "tools/cost-calculator": { eyebrow: "Free tool", title: "Project cost calculator", description: "Get an indicative cost range for your software or website." },
  demos: { eyebrow: "Live demos", title: "Try our product demos", description: "Explore working demos of systems we build." },
  contact: { eyebrow: "Contact", title: "Let's talk about your project", description: "Tell us what you need — we respond within 24 hours." },
  book: { eyebrow: "Book a meeting", title: "Book a free consultation", description: "A 30-minute call with our team to plan your next step." },
  assistant: { eyebrow: "AI assistant", title: "Ask our project assistant", description: "Get instant answers about services, pricing and timelines." },
  brand: { eyebrow: "Brand", title: "Mistravora brand assets", description: "Official logo, colours and usage guidelines." },
  search: { eyebrow: "Search", title: "Search Mistravora", description: "Find services, projects, articles and guides." },
};

async function card(segments: string[]): Promise<ShareCard> {
  const [section, slug, sub] = segments;
  const key = segments.join("/");
  const profile = await getBusinessProfile();
  const home: ShareCard = { eyebrow: profile.tagline || "Software & digital solutions", title: profile.headline || profile.name, description: profile.description };
  if (!section || section === "home") return home;

  if (slug) {
    if (section === "blog") {
      const post = await getPostBySlug(slug);
      if (post) return { eyebrow: post.category || "Blog", title: post.title, description: contentText(post.excerpt), image: post.cover_image };
    }
    if (section === "research") {
      const item = await getResearchBySlug(slug);
      if (item) return { eyebrow: item.category || "Research", title: item.title, description: contentText(item.summary), image: item.cover_image };
    }
    if (section === "projects") {
      const cs = await getCaseStudyBySlug(slug);
      if (cs) return { eyebrow: cs.industry ? `Case study · ${cs.industry}` : "Case study", title: cs.title, description: contentText(cs.outcome || cs.problem_statement), image: cs.cover_image };
    }
    if (section === "industries") {
      const industry = await getIndustryBySlug(slug);
      if (industry) return { eyebrow: "Industry", title: industry.title, description: contentText(industry.summary || industry.description), image: industry.image };
    }
    if (section === "about" && slug === "team" && sub) {
      const member = await getTeamMemberBySlug(sub);
      if (member) return { eyebrow: "Our team", title: member.name, description: member.role, image: member.photo };
    }
    if (section === "tools" && pages[key]) return pages[key];
    if (isCollection(section)) {
      const entry = (await getCollection(section)).find(e => e.slug === slug);
      if (entry) return { eyebrow: collections[section].title, title: entry.title, description: entry.description, image: entry.image };
    }
  }
  if (pages[key]) return pages[key];
  if (isCollection(section)) return { eyebrow: collections[section].title, title: collections[section].title, description: collections[section].description };
  return home;
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const segments = path.slice(0, 3).map(s => s.toLowerCase()).filter(s => /^[a-z0-9-]{1,120}$/.test(s));
  return renderShareImage(await card(segments).catch(() => ({ eyebrow: "Mistravora", title: "Software & digital solutions" })));
}
