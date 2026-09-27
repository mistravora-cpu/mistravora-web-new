import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogImage } from "@/components/catalog-image";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Testimonials } from "@/components/testimonials";
import { PageFaqs } from "@/components/page-faqs";
import { Button } from "@/components/ui/button";
import { collections, type ContentEntry } from "@/lib/content";
import { contentText } from "@/lib/content-preview";
import { estimatePath } from "@/lib/quote-links";
import { jsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import styles from "./services.module.css";

export function ServicesPage({ entries }: { entries: ContentEntry[] }) {
  return (
    <div className="w-full site-gutter py-12 sm:py-16">
      <Breadcrumbs items={[{ label: "Services" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org", "@type": "CollectionPage",
        name: "Mistravora services", url: `${site.url}/services`,
        mainEntity: { "@type": "ItemList", itemListElement: entries.map((entry, index) => ({
          "@type": "ListItem", position: index + 1, name: entry.title, url: `${site.url}/services/${entry.slug}`,
        })) },
      }) }} />
      <section className={styles.hero} aria-labelledby="services-heading">
        <ScrollReveal animation="fade-up">
          <p className={styles.eyebrow}>Build. Connect. Grow.</p>
          <h1 id="services-heading" className="mt-5 max-w-4xl text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
            Digital services.<br /><span className="text-primary">Built around you.</span>
          </h1>
        </ScrollReveal>
        <div className="flex flex-col items-start gap-6 lg:pb-2">
          <p className="max-w-xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">{collections.services.description}</p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg"><Link href={estimatePath}>Plan your project <ArrowUpRight aria-hidden className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="#services-list">Explore services <ArrowDown aria-hidden className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      <section id="services-list" className="scroll-mt-28 py-14 sm:py-20" aria-labelledby="services-list-heading">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div><p className={styles.eyebrow}>Our expertise</p><h2 id="services-list-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your next step</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Explore each service to see how it fits your project.</p>
        </div>
        {entries.length ? <div className={styles.grid}>
          {entries.map((entry, index) => (
            <ScrollReveal key={entry.slug} animation="fade-up" delay={Math.min(index * 60, 240)} className="h-full">
              <article className={`${styles.card} group`}>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span aria-hidden className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                  {entry.category && <span className="text-xs font-medium text-muted-foreground">{entry.category}</span>}
                  <ArrowUpRight aria-hidden className={styles.arrow} />
                </div>
                <CatalogImage src={entry.image} title={entry.title} />
                <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"><Link href={`/services/${entry.slug}`} className={styles.link}>{entry.title}</Link></h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{contentText(entry.description, 220)}</p>
                {!!entry.features?.length && <ul className="mt-6 flex flex-col gap-3 border-t border-border pt-5">
                  {entry.features.slice(0, 3).map((feature, i) => <li key={`${i}-${feature}`} className="flex gap-3 text-sm leading-6"><Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-primary" /><span>{contentText(feature, 140)}</span></li>)}
                </ul>}
                <span aria-hidden className="mt-auto pt-8 text-sm font-semibold text-primary">Explore service <span className="ml-1">→</span></span>
              </article>
            </ScrollReveal>
          ))}
        </div> : <p className="py-8 text-muted-foreground">We’re updating our services. <Link href="/contact" className="text-primary underline">Discuss your project with us.</Link></p>}
      </section>

      <section className={styles.cta} aria-labelledby="services-cta-heading">
        <div><p className={styles.eyebrow}>Let’s shape your project</p><h2 id="services-cta-heading" className="mt-4 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Have an idea, but not a complete brief?</h2><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">Start with your requirements. Explore investment and delivery ranges, then request a preliminary quotation.</p></div>
        <Button asChild size="lg" className="w-full shrink-0 sm:w-auto"><Link href={estimatePath}>Build my project estimate <ArrowUpRight aria-hidden className="h-4 w-4" /></Link></Button>
      </section>
      <Testimonials path="/services" inset />
      <PageFaqs path="/services" inset />
    </div>
  );
}
