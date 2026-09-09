import Image from "@/components/content-image";
import { contentText } from "@/lib/content-preview";
import { ArticleBody } from "@/components/article-body";
import { applySeoOverrides } from "@/lib/seo-overrides";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, isCollection, getCollection } from "@/lib/content";
import { ContentGrid, ContentShell } from "@/components/content-page";
import { ShareButton } from "@/components/share-button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { jsonLd, pageMetadata, withSocialMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ArrowLeft, Calendar, FileText, Shield } from "lucide-react";
export const revalidate = 300;
export function generateStaticParams() { return []; }
async function load(params: Promise<{ section: string; slug: string }>) {
  const { section, slug } = await params; if (!isCollection(section)) notFound();
  const entries = await getCollection(section); const entry = entries.find(e => e.slug === slug); if (!entry) notFound();
  return { section, entry, related: entries.filter(e => e.slug !== slug && (!entry.category || e.category === entry.category)).slice(0, 3) };
}
export async function generateMetadata({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, entry } = await load(params); const metadata=pageMetadata(entry.title,contentText(entry.description,160),`/${section}/${entry.slug}`); return applySeoOverrides(entry.image ? withSocialMetadata({...metadata,openGraph:{...metadata.openGraph,images:[{url:entry.image,alt:entry.title}]},twitter:{...metadata.twitter,images:[entry.image]}}) : metadata);
}

/** Parse policy body into structured sections with headings */
function parsePolicySections(body: string | null | undefined) {
  if (!body) return [];
  return body.split("\n\n").map((block) => {
    const [heading, ...lines] = block.split("\n");
    return lines.length
      ? { heading, content: lines.join("\n") }
      : { heading: null, content: block };
  });
}

export default async function DetailPage({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, entry, related } = await load(params);
  const type = section === "services" || section === "solutions" ? "Service" : section === "glossary" ? "DefinedTerm" : section === "authors" ? "Person" : section === "knowledge-base" ? "Article" : "WebPage";
  const schema = { "@context": "https://schema.org", "@type": type, name: entry.title, description: contentText(entry.description,200), image:entry.image || undefined, url: `${site.url}/${section}/${entry.slug}`, ...(type === "Service" ? { provider: { "@id": `${site.url}/#organization` } } : {}), ...(type === "Article" ? { headline: entry.title, datePublished: entry.published, dateModified: entry.updated, author: { "@type": "Organization", name: site.name } } : {}) };

  const isPolicy = section === "policies";
  const policyHtml=isPolicy && /<[a-z][\s\S]*>/i.test(entry.body ?? "");
  const policySections = isPolicy && !policyHtml ? parsePolicySections(entry.body) : [];

  return <ContentShell title={entry.title} description={entry.intro || section === "resources" ? undefined : entry.description} parent={{ label: collections[section].title, href: `/${section}` }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />

    {isPolicy ? (
      /* ── Policy detail: structured layout with sidebar TOC ── */
      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:gap-12">
        {/* Table of contents sidebar */}
        {policySections.length > 1 && (
          <ScrollReveal animation="fade-up" className="lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:shrink-0">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText aria-hidden className="h-3.5 w-3.5" />
                Contents
              </p>
              <nav>
                <ul className="flex flex-col gap-1.5">
                  {policySections.map((sec, i) => (
                    sec.heading ? (
                      <li key={i}>
                        <a
                          href={`#section-${i}`}
                          className="block text-sm leading-5 text-muted-foreground transition-colors hover:text-primary"
                        >
                          {sec.heading}
                        </a>
                      </li>
                    ) : null
                  ))}
                </ul>
              </nav>
              {entry.updated && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar aria-hidden className="h-3 w-3" />
                    Updated{" "}
                    <time dateTime={entry.updated}>
                      {entry.updated.slice(0, 10)}
                    </time>
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {entry.updated && policySections.length <= 1 && (
            <p className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar aria-hidden className="h-3 w-3" />
              Updated{" "}
              <time dateTime={entry.updated}>{entry.updated.slice(0, 10)}</time>
            </p>
          )}

          <div className="space-y-10">
            {policyHtml && <ArticleBody body={entry.body ?? ""} title={entry.title} />}
            {policySections.map((sec, index) => (
              <ScrollReveal
                key={index}
                animation="fade-up"
                delay={index * 80}
                as="section"
              >
                {sec.heading ? (
                  <>
                    <h2
                      id={`section-${index}`}
                      className="mb-4 scroll-mt-24 text-xl font-semibold tracking-tight sm:text-2xl"
                    >
                      {sec.heading}
                    </h2>
                    <p className="whitespace-pre-wrap text-base leading-8 text-foreground/85">
                      {sec.content}
                    </p>
                  </>
                ) : (
                  <p className="text-base leading-8 text-foreground/85 whitespace-pre-wrap">
                    {sec.content}
                  </p>
                )}
              </ScrollReveal>
            ))}
          </div>

          {/* Share + back navigation */}
          <ScrollReveal animation="fade-up" delay={200} className="mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <Link
                href="/policies"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" />
                All policies
              </Link>
              <ShareButton title={entry.title} />
            </div>
          </ScrollReveal>

          {/* Contact CTA */}
          <ScrollReveal animation="fade-up" delay={300} className="mt-10">
            <aside className="flex flex-col gap-3 rounded-xl border border-border bg-card p-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield aria-hidden className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Questions about this policy?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We&apos;re happy to clarify any terms. Reach out and we&apos;ll respond quickly.
                  </p>
                </div>
              </div>
              <Link
                href="/contact"
                className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Contact us
              </Link>
            </aside>
          </ScrollReveal>
        </div>
      </div>
    ) : (
      /* ── Non-policy detail: standard content layout ── */
      <>
        {entry.updated && <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Updated <time dateTime={entry.updated}>{entry.updated.slice(0, 10)}</time></p>}
        {entry.image && (
          <figure className="relative mt-10 aspect-video w-full overflow-hidden rounded-2xl bg-muted/30"><Image src={entry.image} alt={`${entry.title} overview`} fill sizes="(max-width: 768px) calc(100vw - 32px), 90vw" className="object-contain" /></figure>
        )}
        {entry.intro && <div className="mt-8"><ArticleBody body={entry.intro} title={`${entry.title} introduction`} /></div>}
        {entry.body && <div className="mt-10 w-full min-w-0 text-base leading-8 text-foreground/90"><ArticleBody body={entry.body} title={entry.title} /></div>}
        {!!entry.features?.length && <section className="mt-12"><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What&apos;s included</h2><ul className="mt-5 grid gap-2.5 sm:grid-cols-2">{entry.features.map(f => <li key={f} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />{f}</li>)}</ul></section>}
        {!!entry.technologies?.length && <section className="mt-12"><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Technologies</h2><div className="mt-5 flex flex-wrap gap-2">{entry.technologies.map(t => <span key={t} className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground/80">{t}</span>)}</div></section>}
        {!!entry.services?.length && <section className="mt-12"><h2 className="text-xl font-semibold">Included services</h2><ul className="mt-5 grid gap-3 sm:grid-cols-2">{entry.services.map((service,index)=><li key={index} className="rounded-xl border border-border p-4 text-sm">{service}</li>)}</ul></section>}
        {!!entry.process?.length && <section className="mt-12"><h2 className="text-xl font-semibold">How delivery works</h2><ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entry.process.map((step,index)=><li key={index} className="rounded-xl border border-border p-5"><span className="mb-3 block text-sm font-semibold text-primary">Step {index+1}</span><p className="text-sm leading-6">{step}</p></li>)}</ol></section>}
        {entry.download && <a href={entry.download} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90" rel="noopener noreferrer" data-event="download">Download {entry.title}</a>}
        {entry.links?.map(link => <a key={link} href={link} rel="noopener noreferrer" className="mt-4 mr-4 inline-block text-sm text-primary link-underline">{new URL(link).hostname}</a>)}
        <div className="mt-10"><ShareButton title={entry.title} /></div>
        <aside className="mt-14 rounded-xl border border-border bg-card p-7"><h2 className="text-xl font-semibold tracking-tight">Discuss your project</h2><p className="mt-2 text-sm text-muted-foreground">Tell us what you need. We&apos;ll help you choose the next step.</p><div className="mt-5 flex flex-wrap gap-4"><Link className="text-sm font-medium text-primary link-underline" href={`/contact?service=${encodeURIComponent(entry.title)}`}>Get a quote</Link><Link className="text-sm font-medium text-primary link-underline" href="/book">Book a consultation</Link></div></aside>
        {!!related.length && <section className="mt-16"><h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Related {collections[section].title.toLowerCase()}</h2><ContentGrid entries={related} prefix={`/${section}`} /></section>}
      </>
    )}
  </ContentShell>;
}
