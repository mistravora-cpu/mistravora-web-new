import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Calculator, Gauge, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";
import { getHeroSection } from "@/lib/services";

export const metadata: Metadata = {
  title: "Free Tools",
  description:
    "Free tools from Mistravora: project cost calculator, ROI calculator, and website audit — built to help you plan your next move.",
  alternates: { canonical: `${site.url}/tools` },
};

const tools = [
  {
    href: "/tools/cost-calculator",
    icon: Calculator,
    title: "Cost Calculator",
    description:
      "Get an instant estimate range for your website, store, or web app — in LKR or USD.",
    available: true,
  },
  {
    href: "/tools/roi-calculator",
    icon: TrendingUp,
    title: "ROI Calculator",
    description:
      "See how quickly a faster, better-converting site pays for itself.",
    available: true,
  },
  {
    href: "/tools/website-audit",
    icon: Gauge,
    title: "AI Website Audit",
    description:
      "Instant Lighthouse scores for your site — performance, accessibility, best practices, and SEO.",
    available: true,
  },
  {
    href: "/assistant",
    icon: Bot,
    title: "AI Assistant",
    description:
      "Chat with our AI concierge about services, pricing, and how we'd approach your project.",
    available: true,
  },
] as const;

export default async function ToolsPage() {
  const hero = await getHeroSection("tools");

  return (
    <>
    <AnimatedHero hero={hero} page="tools" />
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <PageHeader
        title="Free Tools"
        description="Plan smarter before you spend. No sign-up needed — results are instant."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <ScrollReveal key={tool.href} animation={i === 0 ? "elastic" : i === 1 ? "flip-in" : i === 2 ? "rotate-in" : "clip-reveal"} delay={i * 100} className={
            tool.available
              ? "shine-sweep hover-lift group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              : "pointer-events-none flex flex-col gap-3 rounded-xl border border-dashed border-border bg-card p-6 opacity-60"
          }>
            <Link
              href={tool.href}
              aria-disabled={!tool.available}
              className="flex flex-1 flex-col gap-3"
            >
            <tool.icon aria-hidden className="h-6 w-6 text-primary hover-icon-bounce" />
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{tool.title}</h2>
              {!tool.available ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Coming soon
                </span>
              ) : null}
            </div>
            <p className="flex-1 text-sm leading-6 text-muted-foreground">
              {tool.description}
            </p>
            {tool.available ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open tool
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            ) : null}
          </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
    </>
  );
}
