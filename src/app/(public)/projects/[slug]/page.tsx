import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { getCaseStudyBySlug } from "@/lib/services";
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
  const cs = await getCaseStudyBySlug(slug);
  if (!cs) return { title: "Project not found" };

  const url = `${site.url}/projects/${cs.slug}`;
  return {
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
  };
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
    <article className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
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

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {cs.client && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {cs.client}
              </span>
            )}
            {cs.industry && (
              <span className="rounded-full border border-border bg-card px-2.5 py-0.5">
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
            <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl sm:h-96 lg:h-[28rem]">
              <Image
                src={cs.cover_image}
                alt={`${cs.title} — ${cs.client}`}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {cs.problem_statement && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold">The challenge</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {cs.problem_statement}
              </p>
            </section>
          )}

          {cs.solution && (
            <section className="mt-6">
              <h2 className="text-xl font-semibold">What we built</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {cs.solution}
              </p>
            </section>
          )}

          {cs.results.length > 0 && (
            <section className="mt-6">
              <h2 className="text-xl font-semibold">Results</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {cs.results.map((result, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {result}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {cs.outcome && (
            <section className="mt-6 rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">Outcome</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {cs.outcome}
              </p>
            </section>
          )}

          {cs.body && (
            <div className="mt-8 max-w-none text-sm leading-7 text-foreground/90 [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-4 [&_p]:my-4">
              {cs.body}
            </div>
          )}

          {cs.technologies.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {cs.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200} className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Want results like these?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about your business — we&apos;ll recommend the simplest thing that works.
          </p>
          <Button asChild className="mt-4">
            <Link href="/contact">Start a project</Link>
          </Button>
        </ScrollReveal>
      </div>
    </article>
  );
}
