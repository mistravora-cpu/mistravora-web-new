import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createElement } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { getIndustryBySlug } from "@/lib/services";
import { site } from "@/lib/site";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getIcon as getMappedIcon } from "@/lib/icon-map";
import { Globe, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Globe);
}

function IndustryIcon({ name }: { name: string | null }) {
  return createElement(getIcon(name), {
    "aria-hidden": true,
    className: "h-7 w-7 text-primary",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return { title: "Industry not found" };

  const url = `${site.url}/industries/${industry.slug}`;
  return {
    title: `${industry.title} — Software Solutions`,
    description: industry.summary ?? industry.description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${industry.title} — Software Solutions | Mistravora`,
      description: industry.summary ?? industry.description ?? undefined,
      images: industry.image ? [{ url: industry.image }] : undefined,
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  return (
    <div className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ label: "Industries", href: "/industries" }, { label: industry.title }]} />
        <ScrollReveal animation="fade-up">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/industries">
              <ArrowLeft className="h-4 w-4" />
              All industries
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <IndustryIcon name={industry.icon} />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {industry.title}
              </h1>
              {industry.summary && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {industry.summary}
                </p>
              )}
            </div>
          </div>

          {industry.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={industry.image}
              alt={industry.title}
              className="mt-8 h-64 w-full rounded-xl object-cover sm:h-80"
            />
          )}

          {industry.description && (
            <p className="mt-8 text-base leading-8 text-muted-foreground">
              {industry.description}
            </p>
          )}
        </ScrollReveal>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {industry.challenges.length > 0 && (
            <ScrollReveal animation="fade-up" delay={100}>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <AlertCircle className="h-5 w-5 text-primary" />
                Common challenges
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {industry.challenges.map((challenge, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
                  >
                    {challenge}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          )}

          {industry.solutions.length > 0 && (
            <ScrollReveal animation="fade-up" delay={200}>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                How we help
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {industry.solutions.map((solution, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-border bg-card p-4 text-sm text-foreground/90"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {solution}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          )}
        </div>

        <ScrollReveal animation="fade-up" delay={300} className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">
            Looking for {industry.title.toLowerCase()} software?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We build custom solutions tailored to your exact needs. Let&apos;s talk.
          </p>
          <Button asChild className="mt-4">
            <Link href="/contact">Get a free quote</Link>
          </Button>
        </ScrollReveal>
      </div>
    </div>
  );
}
