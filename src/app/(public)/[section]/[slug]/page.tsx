import { applySeoOverrides } from "@/lib/seo-overrides";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, isCollection, getCollection } from "@/lib/content";
import { ContentGrid, ContentShell } from "@/components/content-page";
import { ShareButton } from "@/components/share-button";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
export const revalidate = 300;
export function generateStaticParams() { return []; }
async function load(params: Promise<{ section: string; slug: string }>) {
  const { section, slug } = await params; if (!isCollection(section)) notFound();
  const entries = await getCollection(section); const entry = entries.find(e => e.slug === slug); if (!entry) notFound();
  return { section, entry, related: entries.filter(e => e.slug !== slug && (!entry.category || e.category === entry.category)).slice(0, 3) };
}
export async function generateMetadata({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, entry } = await load(params); return applySeoOverrides(pageMetadata(entry.title, entry.description.slice(0, 160), `/${section}/${entry.slug}`));
}
export default async function DetailPage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, entry, related } = await load(params);
  const type = section === "services" || section === "solutions" ? "Service" : section === "glossary" ? "DefinedTerm" : section === "authors" ? "Person" : section === "knowledge-base" ? "Article" : "WebPage";
  const schema = { "@context": "https://schema.org", "@type": type, name: entry.title, description: entry.description, url: `${site.url}/${section}/${entry.slug}`, ...(type === "Service" ? { provider: { "@id": `${site.url}/#organization` } } : {}), ...(type === "Article" ? { headline: entry.title, datePublished: entry.published, dateModified: entry.updated, author: { "@type": "Organization", name: site.name } } : {}) };
  return <ContentShell title={entry.title} description={entry.description} parent={{ label: collections[section].title, href: `/${section}` }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    {entry.updated && <p className="mt-4 text-xs text-muted-foreground">Updated <time dateTime={entry.updated}>{entry.updated.slice(0, 10)}</time></p>}
    <div className="mt-8 max-w-3xl whitespace-pre-wrap text-base leading-8">{entry.body}</div>
    {!!entry.features?.length && <section className="mt-8"><h2 className="text-2xl font-semibold">What’s included</h2><ul className="mt-4 list-inside list-disc space-y-2">{entry.features.map(f => <li key={f}>{f}</li>)}</ul></section>}
    {!!entry.technologies?.length && <section className="mt-8"><h2 className="text-2xl font-semibold">Technologies</h2><p className="mt-3 text-muted-foreground">{entry.technologies.join(" · ")}</p></section>}
    {entry.download && <a href={entry.download} className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-primary-foreground" rel="noopener noreferrer" data-event="download">Download {entry.title}</a>}
    {entry.links?.map(link => <a key={link} href={link} rel="noopener noreferrer" className="mt-4 mr-4 inline-block text-primary underline">{new URL(link).hostname}</a>)}
    <div className="mt-8"><ShareButton title={entry.title} /></div>
    {section !== "policies" && <aside className="mt-12 rounded-xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Discuss your project</h2><p className="mt-2 text-muted-foreground">Tell us what you need. We’ll help you choose the next step.</p><Link className="mt-4 inline-block text-primary underline" href={`/contact?service=${encodeURIComponent(entry.title)}`}>Get a quote</Link><Link className="ml-6 text-primary underline" href="/book">Book a consultation</Link></aside>}
    {!!related.length && <section className="mt-12"><h2 className="text-2xl font-semibold">Related {collections[section].title.toLowerCase()}</h2><ContentGrid entries={related} prefix={`/${section}`} /></section>}
  </ContentShell>;
}
