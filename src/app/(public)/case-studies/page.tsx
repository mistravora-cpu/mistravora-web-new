import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";
import { getHeroSection, getCaseStudies } from "@/lib/services";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Real results from Mistravora projects — measurable outcomes, not vanity screenshots.",
  alternates: { canonical: `${site.url}/case-studies` },
};

export default async function CaseStudiesPage() {
  const [hero, caseStudies] = await Promise.all([
    getHeroSection("case-studies"),
    getCaseStudies(true),
  ]);
  const published = caseStudies.filter((cs) => cs.published && cs.status !== "archived");

  return (
    <>
    <AnimatedHero hero={hero} page="case-studies" />
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <PageHeader
        title="Our Projects"
        description="Every project we ship includes real metrics: speed gains, conversion lifts, and business outcomes."
      />

      {published.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((cs, i) => {
            const initials = (cs.client || cs.title).split(" ").map((w) => w[0]).slice(0, 2).join("");
            return (
              <ScrollReveal key={cs.id} animation={i % 3 === 0 ? "flip-in" : i % 3 === 1 ? "elastic" : "clip-reveal"} delay={i * 80} className="gradient-border-card shine-sweep card-glow group flex flex-col gap-0 rounded-2xl transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10">
                <Link href={`/case-studies/${cs.slug}`} className="flex flex-1 flex-col">
                  {/* Cover image or logo */}
                  {cs.cover_image ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cs.cover_image}
                        alt={`${cs.title} — ${cs.client}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-3 border-b border-border/50 p-5">
                      <span className="glow-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-110">
                        {initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{cs.client}</p>
                        {cs.industry && (
                          <p className="truncate text-xs text-foreground/60">{cs.industry}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Header (shown below image if image exists, or inline if no image) */}
                  {cs.cover_image && (
                    <div className="flex items-center justify-between gap-2 border-b border-border/50 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{cs.client}</p>
                        {cs.industry && (
                          <p className="truncate text-xs text-foreground/60">{cs.industry}</p>
                        )}
                      </div>
                      {cs.location && (
                        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-foreground/70">
                          {cs.location}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="text-base font-bold leading-tight tracking-tight">{cs.title}</h2>
                    {cs.outcome && (
                      <p className="text-sm leading-6 text-foreground/70">{cs.outcome}</p>
                    )}
                    {cs.results.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {cs.results.slice(0, 3).map((r, ri) => (
                          <li key={ri} className="flex items-center gap-2 text-xs text-primary">
                            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                    {cs.technologies.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        {cs.technologies.slice(0, 4).map((tech, ti) => (
                          <span key={ti} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/60">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
                    <span className="text-xs font-medium text-primary">View details</span>
                    <ArrowRight aria-hidden className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      ) : (
        <ScrollReveal animation="scale-in" className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">Projects coming soon</h2>
          <p className="text-sm leading-6 text-foreground/70">
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
