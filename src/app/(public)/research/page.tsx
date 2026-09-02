import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Microscope } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";
import { getHeroSection, getResearch } from "@/lib/services";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Original research and analysis from Mistravora — web performance, AI, and software engineering insights.",
  alternates: { canonical: `${site.url}/research` },
};

export default async function ResearchPage() {
  const [hero, research] = await Promise.all([
    getHeroSection("research"),
    getResearch(true),
  ]);

  return (
    <>
      <AnimatedHero hero={hero} page="research" />
      <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
        <PageHeader
          title="Research & Analysis"
          description="Original research on web performance, AI tools, and software engineering — backed by data, not opinions."
        />

        {research.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {research.map((item, i) => (
              <ScrollReveal
                key={item.id}
                animation={i % 3 === 0 ? "flip-in" : i % 3 === 1 ? "elastic" : "clip-reveal"}
                delay={i * 80}
                className="gradient-border-card shine-sweep card-glow group flex flex-col gap-0 rounded-2xl transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
              >
                <Link href={`/research/${item.slug}`} className="flex flex-1 flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-3 border-b border-border/50 p-5">
                    <span className="glow-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <Microscope aria-hidden className="h-5 w-5 text-primary" />
                    </span>
                    {item.category && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h2 className="text-base font-bold leading-tight tracking-tight">{item.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
                    {item.tags.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        {item.tags.slice(0, 4).map((tag, ti) => (
                          <span key={ti} className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
                    <span className="text-xs text-muted-foreground">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      Read research
                      <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal animation="scale-in" className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Microscope className="h-6 w-6 text-primary" />
            </span>
            <h2 className="text-lg font-semibold">Research coming soon</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We&apos;re working on original research and analysis. Check back soon for insights.
            </p>
            <Button asChild>
              <Link href="/contact">Get in touch</Link>
            </Button>
          </ScrollReveal>
        )}
      </section>
    </>
  );
}
