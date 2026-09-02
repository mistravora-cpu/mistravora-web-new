import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { getHeroSection, getIndustries } from "@/lib/services";
import { getIcon as getMappedIcon } from "@/lib/icon-map";
import { Globe, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Industry-specific software solutions for retail, hospitality, healthcare, and more in Sri Lanka and worldwide.",
  alternates: { canonical: `${site.url}/industries` },
};

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Globe);
}

export default async function IndustriesPage() {
  const [hero, industries] = await Promise.all([
    getHeroSection("industries"),
    getIndustries(true),
  ]);

  return (
    <>
      <AnimatedHero hero={hero} page="industries" />
      <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
        <PageHeader
          title="Industries we serve"
          description="We build software that fits how your industry actually works — not generic templates."
        />

        {industries.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, i) => {
              const Icon = getIcon(industry.icon);
              return (
                <ScrollReveal
                  key={industry.id}
                  animation={i % 3 === 0 ? "flip-in" : i % 3 === 1 ? "elastic" : "clip-reveal"}
                  delay={i * 80}
                  className="shine-sweep card-glow group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <Link href={`/industries/${industry.slug}`} className="flex flex-col gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-all group-hover:bg-primary/20">
                      <Icon aria-hidden className="h-5 w-5 text-primary" />
                    </span>
                    <h2 className="text-lg font-semibold">{industry.title}</h2>
                    {industry.summary && (
                      <p className="text-sm leading-6 text-muted-foreground">
                        {industry.summary}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <ScrollReveal animation="scale-in" className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <h2 className="text-lg font-semibold">Industry pages coming soon</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We&apos;re documenting our industry expertise. Want to know if we can help your sector?
            </p>
            <Button asChild>
              <Link href="/contact">Ask us directly</Link>
            </Button>
          </ScrollReveal>
        )}
      </section>
    </>
  );
}
