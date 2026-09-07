import { ArticleBody } from "@/components/article-body";
import { jsonLd, withSocialMetadata } from "@/lib/seo";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { ShareButton } from "@/components/share-button";
import { RelatedContent } from "@/components/related-content";
import type { Metadata } from "next";
import Image from "@/components/content-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { getCaseStudyBySlug } from "@/lib/services";
import { site } from "@/lib/site";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  if (!cs) return { title: "Project not found" };

  const url = `${site.url}/projects/${cs.slug}`;
  return applySeoOverrides(withSocialMetadata({
    title: cs.title,
    description: cs.outcome ?? cs.problem_statement ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: cs.title,
      description: cs.outcome ?? cs.problem_statement ?? undefined,
      images: cs.cover_image ? [{ url: cs.cover_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: cs.title,
      description: cs.outcome ?? cs.problem_statement ?? undefined,
      images: cs.cover_image ? [cs.cover_image] : undefined,
    },
  }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  if (!cs) notFound();

  return (
    <article className="w-full site-gutter py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "CreativeWork", headline: cs.title, name: cs.title, description: cs.problem_statement, url: `${site.url}/projects/${cs.slug}`, dateModified: cs.updated_at, publisher: { "@id": `${site.url}/#organization` }, author: { "@type": "Organization", name: site.name } }) }} />
      <div className="mx-auto max-w-4xl w-full">
        <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: cs.title }]} />
        <ScrollReveal animation="fade-up">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
          </Button>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {cs.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {cs.client && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {cs.client}
              </span>
            )}
            {cs.industry && (
              <span className="rounded-md border border-border bg-card px-2.5 py-0.5">
                {cs.industry}
              </span>
            )}
            {cs.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {cs.location}
              </span>
            )}
            {cs.date && (
              <span>
                {new Date(cs.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>

          {cs.cover_image && (
            <div className="relative mt-10 h-72 w-full overflow-hidden rounded-xl border border-border bg-muted p-6 sm:h-96 lg:h-[28rem]">
              <Image
                src={cs.cover_image}
                alt={`${cs.title} — ${cs.client}`}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
                priority
              />
            </div>
          )}

          {cs.problem_statement && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">The challenge</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-foreground/85">
                {cs.problem_statement}
              </p>
            </section>
          )}

          {cs.solution && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What we built</h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-foreground/85">
                {cs.solution}
              </p>
            </section>
          )}

          {cs.results.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Results</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {cs.results.map((result, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-6 text-foreground/90">{result}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cs.outcome && (
            <section className="mt-10 rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold tracking-tight">Outcome</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {cs.outcome}
              </p>
            </section>
          )}

          {cs.body && (
            <div className="mt-10 w-full min-w-0 text-base leading-7 text-foreground/90 [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-4 [&_p]:my-4">
              <ArticleBody body={cs.body} title={`${cs.title} project details`} />
            </div>
          )}

          {cs.technologies.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {cs.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200} className="mt-14 rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="text-lg font-semibold tracking-tight">Want results like these?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about your business — we&apos;ll recommend the simplest thing that works.
          </p>
          <Button asChild className="mt-5">
            <Link href="/contact">Start a project</Link>
          </Button>
        </ScrollReveal>
      </div>
      <div className="mx-auto max-w-4xl mt-10"><ShareButton title={cs.title} /><RelatedContent currentPath={`/projects/${cs.slug}`} title={cs.title} /></div>
    </article>
  );
}
