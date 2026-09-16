import { applySeoOverrides } from "@/lib/seo-overrides";
import Link from "next/link";
import { ContentShell } from "@/components/content-page";
import { pageMetadata } from "@/lib/seo";
import { getCollection } from "@/lib/content";
import { getPublishedPosts, getResearch, getCaseStudies } from "@/lib/services";
import { NewsletterSignup } from "@/components/newsletter-signup";
const baseMetadata = pageMetadata("Insights & resources", "Explore Mistravora’s articles, research, practical guides, and software project resources.", "/insights");
export default async function InsightsPage() {
  const [posts, research, guides, glossary, resources, authors, projects] = await Promise.all([
    getPublishedPosts(), getResearch(true), getCollection("knowledge-base"),
    getCollection("glossary"), getCollection("resources"), getCollection("authors"), getCaseStudies(true),
  ]);
  const sections = [
    { title: "Blog", href: "/blog", count: posts.length },
    { title: "Research", href: "/research", count: research.length },
    { title: "Guides & knowledge base", href: "/knowledge-base", count: guides.length },
    { title: "Technology glossary", href: "/glossary", count: glossary.length },
    { title: "Downloads", href: "/resources", count: resources.length },
    { title: "Our authors", href: "/authors", count: authors.length },
    { title: "Case studies", href: "/projects", count: projects.length },
  ].filter(section => section.count > 0);
  return (
    <ContentShell title="Insights & resources" description="Ideas and practical resources for your next software project.">
      <form action="/search" role="search" className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="insights-search" className="sr-only">Search insights</label>
        <input id="insights-search" name="q" type="search" maxLength={100} placeholder="Search software, AI, services…" className="min-w-0 w-full rounded-lg border border-border bg-card px-4 py-3" />
        <button className="rounded-lg bg-primary px-5 py-3 text-primary-foreground">Search</button>
      </form>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map(({ title, href, count }) => (
          <Link className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:text-primary" key={href} href={href}>
            <span className="text-xl font-semibold">{title} <span aria-hidden>→</span></span>
            <span className="mt-2 block text-sm text-muted-foreground">{count} published {count === 1 ? "entry" : "entries"}</span>
          </Link>
        ))}
        <Link href="/tools" className="rounded-xl border border-border bg-card p-6 text-xl font-semibold transition-colors hover:border-primary/50 hover:text-primary">Free tools <span aria-hidden>→</span></Link>
      </div>
      <div className="mt-12"><NewsletterSignup /></div>
    </ContentShell>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
