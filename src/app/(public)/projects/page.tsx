import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";
import { getHeroSection, getCaseStudies } from "@/lib/services";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Projects",
  description:
    "Real results from Mistravora projects — measurable outcomes, not vanity screenshots.",
  alternates: { canonical: `${site.url}/projects` },
});

export default async function CaseStudiesPage() {
  const [hero, caseStudies] = await Promise.all([
    getHeroSection("projects"),
    getCaseStudies(true),
  ]);
  const published = caseStudies.filter((cs) => cs.published && cs.status !== "archived");

  return (
    <>
    <AnimatedHero hero={hero} page="projects" />
    <section className="w-full site-gutter py-16">
      <PageHeader
        title="Our Projects"
        description="Every project we ship includes real metrics: speed gains, conversion lifts, and business outcomes."
      />

      {published.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((cs, i) => {
            const initials = (cs.client || cs.title).split(" ").map((w) => w[0]).slice(0, 2).join("");
            return (
              <ScrollReveal key={cs.id} animation="fade-up" delay={i * 70} className="group interactive-card hover:-translate-y-0.5 flex flex-col gap-0 overflow-hidden">
                <Link href={`/projects/${cs.slug}`} className="flex flex-1 flex-col">
                  {/* Cover image or logo */}
                  {cs.cover_image ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted p-4">
                      <Image
                        src={cs.cover_image}
                        alt={`${cs.title} — ${cs.client}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-3 border-b border-border p-5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{cs.client}</p>
                        {cs.industry && (
                          <p className="truncate text-xs text-muted-foreground">{cs.industry}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Header (shown below image if image exists, or inline if no image) */}
                  {cs.cover_image && (
                    <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{cs.client}</p>
                        {cs.industry && (
                          <p className="truncate text-xs text-muted-foreground">{cs.industry}</p>
                        )}
                      </div>
                      {cs.location && (
                        <span className="shrink-0 rounded-md bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                          {cs.location}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="text-base font-semibold leading-tight tracking-tight">{cs.title}</h2>
                    {cs.outcome && (
                      <p className="text-sm leading-6 text-muted-foreground">{cs.outcome}</p>
                    )}
                    {cs.results.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {cs.results.slice(0, 3).map((r, ri) => (
                          <li key={ri} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                    {cs.technologies.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        {cs.technologies.slice(0, 4).map((tech, ti) => (
                          <span key={ti} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
                    <span className="text-xs font-medium text-primary">View details</span>
                    <ArrowRight aria-hidden className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      ) : (
        <ScrollReveal animation="fade-up" className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <h2 className="text-lg font-semibold tracking-tight">Projects coming soon</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            We only publish results with client permission and real data. Want to
            be our next success story?
          </p>
          <Button asChild>
            <Link href="/contact">Start a project</Link>
          </Button>
        </ScrollReveal>
      )}
    </section>
    </>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
