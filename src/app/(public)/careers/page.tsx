import { getBusinessProfile } from "@/lib/business-profile";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { getHeroSection } from "@/lib/services";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Careers",
  description:
    "Join Mistravora — a Sri Lankan software team building fast, accessible digital products for the world.",
  alternates: { canonical: `${site.url}/careers` },
});

export default async function CareersPage() {
  const [hero, site] = await Promise.all([getHeroSection("careers"), getBusinessProfile()]);

  return (
    <>
    <AnimatedHero hero={hero} page="careers" />
    <section className="w-full site-gutter py-16">
      <PageHeader
        title="Careers"
        description="We hire people who care about craft: performance, accessibility, and honest work."
      />

      <ScrollReveal animation="scale-in" className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">No open roles right now</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We keep a short list of people we&apos;d love to work with. Send your
          portfolio and we&apos;ll reach out when something fits.
        </p>
        <Button asChild variant="outline">
          <a href={`mailto:${site.email}?subject=Careers%20at%20Mistravora`}>
            Email your portfolio
          </a>
        </Button>
      </ScrollReveal>
    </section>
    </>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
