import { CatalogImage } from "@/components/catalog-image";
import { contentText, firstContent } from "@/lib/content-preview";
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
import { getSolutions, getHeroSection } from "@/lib/services";
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
  const [hero, solutionsData] = await Promise.all([
    getHeroSection("solutions"),
    getSolutions(true),
  ]);
  const solutions = solutionsData;

  return (
    <>
    <AnimatedHero hero={hero} page="solutions" />
    <section className="w-full site-gutter section-py">

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((solution, i) => {
          const Icon = getIcon(solution.icon);
          return (
            <ScrollReveal key={solution.id} animation="fade-up" delay={i * 70} className="group interactive-card catalog-card h-full p-5 sm:p-6">
              <article className="flex h-full flex-col">
                <CatalogImage src={solution.image} title={solution.title} />
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                  <Icon aria-hidden className="h-5 w-5 text-primary" />
                </span>
                <h2 className="mt-4 text-lg font-semibold tracking-tight">{<Link href={`/solutions/${solution.slug}`} className="transition-colors group-hover:text-primary">{solution.title}</Link>}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {contentText(firstContent(solution.short_description,solution.summary,solution.long_description,solution.body),200)}
                </p>
                <Link href={`/solutions/${solution.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-primary">Explore solution <ArrowRight aria-hidden className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" /><span className="sr-only">: {solution.title}</span></Link>
              </article>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Social proof — client logos */}
      <div className="mt-20">
        <ClientsMarquee />
      </div>

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
