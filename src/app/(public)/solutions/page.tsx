import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
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
import { site } from "@/lib/site";
import { getIcon as getMappedIcon } from "@/lib/icon-map";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Solutions",
  description:
    "Custom web platforms, business software, e-commerce, and AI-powered features built by Mistravora.",
  alternates: { canonical: `${site.url}/solutions` },
});

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Globe);
}

export default async function SolutionsPage() {
  const [hero, solutionsData, caseStudiesData] = await Promise.all([
    getHeroSection("solutions"),
    getSolutions(true),
    getCaseStudies(true),
  ]);
  const solutions = solutionsData;
  const caseStudies = caseStudiesData
    .filter((cs) => cs.published && cs.status !== "archived")
    .slice(0, 3);

  return (
    <>
    <AnimatedHero hero={hero} page="solutions" />
    <section className="w-full site-gutter section-py">

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((solution, i) => {
          const Icon = getIcon(solution.icon);
          return (
            <ScrollReveal key={solution.id} animation="fade-up" delay={i * 70} className="group interactive-card hover:-translate-y-0.5 p-6">
              <article>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                  <Icon aria-hidden className="h-5 w-5 text-primary" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">{<Link href={`/solutions/${solution.slug}`} className="transition-colors group-hover:text-primary">{solution.title}</Link>}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {solution.short_description ?? solution.summary ?? solution.body ?? ""}
                </p>
              </article>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Social proof — client logos */}
      <div className="mt-20">
        <ClientsMarquee />
      </div>

      {/* Case studies preview */}
      {caseStudies.length > 0 && (
        <section className="mt-20">
          <ScrollReveal animation="fade-up" className="flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">
              Recent work
            </p>
            <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
              Real projects, real results
            </h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs, i) => (
              <ScrollReveal
                key={cs.id}
                animation="fade-up"
                delay={i * 70}
                className="group interactive-card hover:-translate-y-0.5 p-6"
              >
                <Link href={`/projects/${cs.slug}`} className="flex flex-1 flex-col gap-2">
                  <h3 className="font-semibold tracking-tight transition-colors group-hover:text-primary">{cs.title}</h3>
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

      <ScrollReveal animation="fade-up" delay={200} className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
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


export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
