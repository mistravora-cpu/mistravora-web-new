import type { Metadata } from "next";
import Link from "next/link";
import { Check, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site, pricingTiers as fallbackTiers } from "@/lib/site";
import { getHeroSection, getPricingTiers } from "@/lib/services";
import { getIcon as getMappedIcon } from "@/lib/icon-map";

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Check);
}

import { PricingWizard } from "./pricing-wizard";

const faqs = [
  {
    q: "Do you require payment upfront?",
    a: "We work with a 40% advance, 40% at first preview, and 20% at launch. No hidden charges — everything is agreed in writing before we start.",
  },
  {
    q: "How long does a project take?",
    a: "Marketing sites take 2–4 weeks, e-commerce 4–8 weeks, and custom platforms 6–12 weeks. Your timeline is locked in the proposal.",
  },
  {
    q: "Can I update the site myself afterwards?",
    a: "Yes — most builds include an admin dashboard where you edit content, blog posts, and pages without touching code.",
  },
  {
    q: "What about hosting and maintenance?",
    a: "We set up hosting (usually Vercel or Cloudflare — often on the free tier) and offer optional care plans covering updates, backups, and small changes.",
  },
] as const;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for Mistravora web platforms, business software, and custom builds — in LKR and USD.",
  alternates: { canonical: `${site.url}/pricing` },
};

export default async function PricingPage() {
  const hero = await getHeroSection("pricing");
  const dbTiers = await getPricingTiers(true);
  const tiers = dbTiers.length > 0 ? dbTiers : fallbackTiers.map((t, i) => ({
    id: `fallback-${i}`,
    name: t.name,
    tagline: null,
    price: t.price,
    description: t.description,
    icon: null,
    button_text: null,
    features: t.features,
    sort_order: i,
    popular: i === 1,
    active: true,
    created_at: "",
    updated_at: "",
  }));
  // If no tier is marked popular, auto-mark the middle one
  if (tiers.length > 0 && !tiers.some((t) => t.popular)) {
    const mid = Math.floor(tiers.length / 2);
    tiers[mid] = { ...tiers[mid], popular: true };
  }

  return (
    <>
    <AnimatedHero hero={hero} page="pricing" />
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <PageHeader
        title="Pricing"
        description="Clear starting points, no surprises. Every project is scoped individually after a free consultation."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier, index) => {
          const Icon = getIcon(tier.icon);
          return (
          <ScrollReveal key={tier.id} animation={index === 1 ? "elastic" : index === 0 ? "flip-in" : "rotate-in"} delay={index * 100} className={
            tier.popular
              ? "animate-glow-pulse relative mt-6 flex flex-col rounded-xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10"
              : "shine-sweep hover-lift mt-4 flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
          }>
            <article className="flex flex-col">
            {tier.popular ? (
              <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-md">
                Most popular
              </span>
            ) : null}
            {tier.icon && (
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon aria-hidden className="h-5 w-5 text-primary" />
              </span>
            )}
            <h2 className="text-lg font-semibold">{tier.name}</h2>
            {tier.tagline && (
              <p className="mt-0.5 text-xs text-muted-foreground">{tier.tagline}</p>
            )}
            <p className="mt-1 text-2xl font-bold text-primary">{tier.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {tier.description}
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/contact">{tier.button_text ?? "Request a quote"}</Link>
            </Button>
          </article>
          </ScrollReveal>
          );
        })}
      </div>

      <ScrollReveal animation="fade-up" className="mt-16 w-full">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Interactive
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Build your estimate
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Three quick questions — get a ballpark figure in seconds, then
            refine it with us on WhatsApp.
          </p>
        </div>
        <ScrollReveal animation="blur-in" delay={200} className="mt-8 w-full">
          <PricingWizard />
        </ScrollReveal>
      </ScrollReveal>

      <div className="mt-16 w-full">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Common questions
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq.q} animation={i % 2 === 0 ? "clip-reveal" : "flip-in"} delay={i * 80} className="hover-glow rounded-xl border border-border bg-card p-5">
              <p className="font-medium">{faq.q}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {faq.a}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
