import { ArticleBody } from "@/components/article-body";
import { CatalogImage } from "@/components/catalog-image";
import { contentText } from "@/lib/content-preview";
import { HeroMedia } from "@/components/hero-media";
import { getCollection } from "@/lib/content";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { jsonLd } from "@/lib/seo";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Bot,
  Globe,
  HeartHandshake,
  LayoutDashboard,
  ShoppingCart,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Process } from "@/components/process";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RobotHeroClient } from "@/components/hero/RobotHeroClient";
import { StatsCounter } from "@/components/stats-counter";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { ClientsMarquee } from "@/components/clients-marquee";
import { getStatistics, getHeroSection } from "@/lib/services";
import { getIcon as getSolutionIcon } from "@/lib/icon-map";

const siteUrl = "https://mistravora.com";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Mistravora — Custom Software, Web Platforms & AI Tools",
  description:
    "Mistravora builds high-performance web apps, custom dashboards, and AI-powered tools for ambitious businesses in Sri Lanka and worldwide. Ship faster, scale smarter.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Mistravora — Custom Software, Web Platforms & AI Tools",
    description:
      "We build intelligent software that grows your business. High-performance web platforms, custom dashboards, and AI-driven tools.",
    siteName: "Mistravora",
    images: [
      {
        url: "/android-chrome-512x512.png",
        secureUrl: `${siteUrl}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
        alt: "Mistravora — Custom Software and Digital Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mistravora — Custom Software, Web Platforms & AI Tools",
    description:
      "We build intelligent software that grows your business. Web platforms, dashboards, and AI tools for ambitious companies.",
    images: ["/android-chrome-512x512.png"],
  },
  keywords: [
    "custom software development Sri Lanka",
    "web application development",
    "AI-powered tools",
    "Next.js development",
    "Supabase development",
    "custom dashboards",
    "digital products Sri Lanka",
    "Mistravora",
  ],
});

const fallbackIcons = [
  Globe,
  LayoutDashboard,
  ShoppingCart,
  Smartphone,
  Bot,
  HeartHandshake,
] as const;

export default async function Home() {
  const hero = await getHeroSection("home");
  return (
    <main className="flex flex-1 flex-col">
      {/* JSON-LD structured data for rich search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Mistravora",
            url: siteUrl,
            description:
              "Custom software, web platforms, and AI-powered tools for ambitious businesses.",
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Keep the CMS headline in the initial server-rendered content. */}
      <RobotHeroClient hero={hero} description={hero?.description ? <ArticleBody body={hero.description} title="Introduction" /> : undefined} />
      <HeroMedia page="/" />
      <ScrollIndicator />

      {/* Stats counter — animated numbers that count up on scroll */}
      <Suspense fallback={null}>
        <StatsSection />
      </Suspense>

      {/* Below-the-fold content streams in via Suspense.
          The hero h1 paints first, then these sections hydrate as data arrives. */}
      <Suspense fallback={null}>
        <SolutionsSection />
      </Suspense>

      {/* Clients — trusted companies we've worked with */}
      <Suspense fallback={null}>
        <ClientsMarquee />
      </Suspense>

      <Process />

      {/* CTA band */}
      <section data-cv="auto" className="w-full site-gutter pb-24">
        <ScrollReveal animation="fade-up" className="surface-card relative overflow-hidden rounded-2xl p-8 text-center sm:p-14">
          <div
            aria-hidden
            className="aurora-bg absolute inset-0 opacity-60"
          />
          <div className="relative flex flex-col items-center gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Ready when you are
            </span>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Have a project in mind?
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Tell us what you&apos;re building — we reply within one business
              day with honest advice and a clear quote.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/contact">Get a free quote</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/assistant">
                  <Bot aria-hidden className="h-4 w-4" />
                  Ask our AI
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}

// ─── Streaming sections ────────────────────────────────────────────────
// These async components are wrapped in <Suspense> so the hero (LCP)
// renders immediately while Supabase queries resolve in the background.

async function StatsSection() {
  const dbStats = await getStatistics(true);
  if (!dbStats.length) return null;

  const stats = dbStats.length > 0
    ? dbStats.map((s) => {
        const numeric = parseInt(s.value.replace(/[^0-9]/g, ""), 10) || 0;
        const suffix = s.value.replace(/[0-9]/g, "").trim();
        return {
          value: s.value,
          label: s.label,
          numericValue: numeric || 50,
          suffix: suffix || (numeric >= 100 ? "%" : ""),
        };
      })
    : undefined;

  return <StatsCounter stats={stats} />;
}

async function SolutionsSection() {
  const services = await getCollection("services");
  const solutions = services.map(service => ({ id: service.slug, slug: service.slug, title: service.title,
    short_description: service.description, summary: service.description, image:service.image, icon: null }));

  return (
    <section data-cv="auto" className="relative w-full overflow-hidden site-gutter pb-20 pt-8">
      <ScrollReveal animation="fade-up" className="relative flex flex-col items-center gap-3 text-center">
        <p className="eyebrow">
          What we build
        </p>
        <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
          Everything your business needs to <span className="text-gradient">grow online</span>
        </h2>
      </ScrollReveal>

      <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {solutions.map((solution, index) => {
          const Icon = solution.icon ? getSolutionIcon(solution.icon) : fallbackIcons[index % fallbackIcons.length];
          return (
            <ScrollReveal
              key={solution.id}
              animation="fade-up"
              delay={index * 60}
              className={`group interactive-card hover:-translate-y-0.5 p-6 ${
                index === 0 || index === 3 ? "lg:col-span-2" : ""
              }`}
            >
              <article>
              <CatalogImage src={solution.image} title={solution.title} />
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                <Icon aria-hidden className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight"><Link href={`/services/${solution.slug}`} className="transition-colors group-hover:text-primary">{solution.title}</Link></h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {contentText(solution.short_description ?? solution.summary,200)}
              </p>
              </article>
            </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal animation="fade-up" delay={200} className="relative mt-10 text-center">
        <Button variant="outline" asChild>
          <Link href="/services">
            Explore all services
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </Button>
      </ScrollReveal>
    </section>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
