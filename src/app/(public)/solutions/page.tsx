import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, type LucideIcon } from "lucide-react";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ClientsMarquee } from "@/components/clients-marquee";
import { Testimonials } from "@/components/testimonials";
import { SectionDivider } from "@/components/section-divider";
import { getSolutions, getCaseStudies, getHeroSection } from "@/lib/services";
import { site, solutions as fallbackSolutions } from "@/lib/site";
import { getIcon as getMappedIcon } from "@/lib/icon-map";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Custom web platforms, business software, e-commerce, and AI-powered features built by Mistravora.",
  alternates: { canonical: `${site.url}/solutions` },
};

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Globe);
}

export default async function SolutionsPage() {
  const [hero, solutionsData, caseStudiesData] = await Promise.all([
    getHeroSection("solutions"),
    getSolutions(true),
    getCaseStudies(true),
  ]);
  let solutions = solutionsData;
  const caseStudies = caseStudiesData
    .filter((cs) => cs.published && cs.status !== "archived")
    .slice(0, 3);
  if (solutions.length === 0) {
    solutions = fallbackSolutions.map((s, i) => ({
      id: `fallback-${i}`,
      title: s.title,
      slug: s.title.toLowerCase().replace(/\s+/g, "-"),
      summary: null,
      body: null,
      icon: null,
      category: null,
      short_description: s.description,
      long_description: null,
      technologies: [],
      image: null,
      sort_order: i,
      features: [],
      services: [],
      process_steps: [],
      pricing_packages: [],
      published: true,
      created_at: "",
      updated_at: "",
    }));
  }

  return (
    <>
    <AnimatedHero hero={hero} page="solutions" />
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((solution, i) => {
          const Icon = getIcon(solution.icon);
          return (
            <ScrollReveal key={solution.id} animation={i % 2 === 0 ? "slide-left" : "slide-right"} delay={i * 80} className="shine-sweep hover-glow group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <article>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-all group-hover:bg-primary/20 hover-icon-bounce">
                  <Icon aria-hidden className="h-5 w-5 text-primary" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{solution.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {solution.short_description ?? solution.summary ?? solution.body ?? ""}
                </p>
              </article>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Social proof — client logos */}
      <div className="mt-16">
        <ClientsMarquee />
      </div>

      {/* Case studies preview */}
      {caseStudies.length > 0 && (
        <section className="mt-16">
          <ScrollReveal animation="fade-up" className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Recent work
            </p>
            <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
              Real projects, real results
            </h2>
          </ScrollReveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs, i) => (
              <ScrollReveal
                key={cs.id}
                animation={i % 2 === 0 ? "slide-left" : "slide-right"}
                delay={i * 80}
                className="shine-sweep hover-glow group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <Link href={`/case-studies/${cs.slug}`} className="flex flex-1 flex-col gap-2">
                  <h3 className="font-semibold tracking-tight">{cs.title}</h3>
                  {cs.outcome && (
                    <p className="text-sm leading-6 text-muted-foreground">{cs.outcome}</p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View case study
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      <SectionDivider className="text-surface" />

      {/* Testimonials */}
      <Testimonials />

      <ScrollReveal animation="scale-in" delay={200} className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight">
          Not sure which one fits?
        </h2>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Tell us about your business — we&apos;ll recommend the simplest thing
          that works, not the most expensive.
        </p>
        <Button asChild>
          <Link href="/contact">
            Get free advice
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </Button>
      </ScrollReveal>
    </section>
    </>
  );
}

