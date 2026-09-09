import { CatalogImage } from "@/components/catalog-image";
import { contentText } from "@/lib/content-preview";
import { getBusinessProfile } from "@/lib/business-profile";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
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

const baseMetadata: Metadata = withSocialMetadata({
  title: "Industries",
  description:
    "Industry-specific software solutions for retail, hospitality, healthcare, and more in Sri Lanka and worldwide.",
  alternates: { canonical: `${site.url}/industries` },
});

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Globe);
}

export default async function IndustriesPage() {
  const profile = await getBusinessProfile();
  const [hero, industries] = await Promise.all([
    getHeroSection("industries"),
    getIndustries(true),
  ]);

  return (
    <>
      <AnimatedHero hero={hero} page="industries" />
      <section className="w-full site-gutter py-16">
        <PageHeader
          title="Industries we serve"
          description={`${profile.industries} ${profile.coverage} The categories below are examples of sectors we serve.`}
        />

        {industries.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, i) => {
              const Icon = getIcon(industry.icon);
              return (
                <ScrollReveal
                  key={industry.id}
                  animation="fade-up"
                  delay={i * 80}
                  className="group interactive-card catalog-card p-5 sm:p-6"
                >
                  <Link href={`/industries/${industry.slug}`} className="flex h-full flex-col gap-3">
                    <CatalogImage src={industry.image} title={industry.title} />
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-all group-hover:bg-primary/20">
                      <Icon aria-hidden className="h-5 w-5 text-primary" />
                    </span>
                    <h2 className="text-lg font-semibold">{industry.title}</h2>
                    {industry.summary && (
                      <p className="text-sm leading-6 text-muted-foreground">
                        {contentText(industry.summary,200)}
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

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
