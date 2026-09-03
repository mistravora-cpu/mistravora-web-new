import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Microscope, Calendar, User } from "lucide-react";
import { getResearchBySlug } from "@/lib/services";
import { site } from "@/lib/site";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const research = await getResearchBySlug(slug);
  if (!research) return { title: "Research not found" };

  const url = `${site.url}/research/${slug}`;
  return {
    title: research.title,
    description: research.summary,
    alternates: { canonical: url },
    openGraph: {
      title: research.title,
      description: research.summary,
      url,
      type: "article",
      images: research.cover_image ? [{ url: research.cover_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: research.title,
      description: research.summary,
      images: research.cover_image ? [research.cover_image] : undefined,
    },
  };
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const research = await getResearchBySlug(slug);
  if (!research) notFound();

  return (
    <article className="flex flex-1 flex-col">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="aurora-bg absolute inset-0" />
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 h-72 w-full max-w-xl -translate-x-1/2 animate-aurora rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-6xl w-full flex-col gap-4 px-4 py-12 sm:px-8 sm:py-16">
          <Breadcrumbs items={[{ label: "Research", href: "/research" }, { label: research.title }]} />
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Back to Research
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Microscope aria-hidden className="h-4 w-4 text-primary" />
            </span>
            {research.category && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {research.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {research.title}
          </h1>

          <p className="text-base leading-7 text-muted-foreground">{research.summary}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {research.author && (
              <span className="flex items-center gap-1.5">
                <User aria-hidden className="h-3.5 w-3.5" />
                {research.author}
              </span>
            )}
            {research.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar aria-hidden className="h-3.5 w-3.5" />
                {new Date(research.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            )}
          </div>

          {research.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {research.tags.map((tag, i) => (
                <span key={i} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-8">
        {research.cover_image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={research.cover_image}
            alt={research.title}
            className="mb-8 aspect-video w-full rounded-2xl object-cover"
          />
        )}

        {research.body && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert sm:prose-base prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm"
            dangerouslySetInnerHTML={{ __html: research.body }}
          />
        )}

        <ScrollReveal animation="fade-up" className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-lg font-bold">Want to discuss this research?</h2>
          <p className="text-sm text-muted-foreground">
            We&apos;d love to hear your thoughts or collaborate on future studies.
          </p>
          <Button asChild>
            <Link href="/contact">
              Get in touch
              <ArrowLeft aria-hidden className="h-4 w-4 rotate-180" />
            </Link>
          </Button>
        </ScrollReveal>
      </section>
    </article>
  );
}
