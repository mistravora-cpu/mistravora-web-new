import { applySeoOverrides } from "@/lib/seo-overrides";
import Link from "next/link";
import { ContentShell } from "@/components/content-page";
import { pageMetadata } from "@/lib/seo";
const baseMetadata = pageMetadata("Insights & resources", "Explore Mistravora’s articles, research, practical guides, and software project resources.", "/insights");
export default function InsightsPage() {
  return <ContentShell title="Insights & resources" description="Ideas and practical resources for your next software project."><form action="/search" className="mt-8 flex gap-3"><label htmlFor="insights-search" className="sr-only">Search insights</label><input id="insights-search" name="q" type="search" placeholder="Search software, AI, services…" className="w-full rounded-lg border border-border bg-card px-4 py-3" /><button className="rounded-lg bg-primary px-5 text-primary-foreground">Search</button></form><div className="mt-8 grid gap-4 sm:grid-cols-2">{[["Blog", "/blog"], ["Research", "/research"], ["Guides & knowledge base", "/knowledge-base"], ["Technology glossary", "/glossary"], ["Downloads", "/resources"], ["Our authors", "/authors"], ["Case studies", "/projects"], ["Free tools", "/tools"]].map(([title, href]) => <Link className="rounded-xl border border-border bg-card p-6 text-xl font-semibold hover:text-primary" key={href} href={href}>{title} →</Link>)}</div></ContentShell>;
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
