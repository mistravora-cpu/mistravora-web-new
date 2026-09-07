import { applySeoOverrides } from "@/lib/seo-overrides";
import { notFound } from "next/navigation";
import { collections, isCollection, getCollection } from "@/lib/content";
import { ContentGrid, ContentShell } from "@/components/content-page";
import { pageMetadata } from "@/lib/seo";
import { ScrollReveal } from "@/components/scroll-reveal";
import Link from "next/link";
import { Shield, ArrowRight, Calendar } from "lucide-react";
export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(collections).filter(section => section !== "solutions").map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params; if (!isCollection(section)) notFound();
  return applySeoOverrides(pageMetadata(collections[section].title, collections[section].description, `/${section}`));
}
export default async function CollectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params; if (!isCollection(section)) notFound();
  const entries = await getCollection(section);

  /* ── Policies: dedicated animated card grid ── */
  if (section === "policies") {
    return (
      <main className="mx-auto w-full site-gutter py-16">
        <ScrollReveal animation="fade-up">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Policies &amp; Terms</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            Read Mistravora&apos;s published policies and service terms. These documents
            govern how we work with clients and handle your data.
          </p>
        </ScrollReveal>

        {entries.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry, index) => (
              <ScrollReveal
                key={entry.slug}
                animation="fade-up"
                delay={index * 70}
              >
                <Link
                  href={`/policies/${entry.slug}`}
                  className="group interactive-card hover:-translate-y-0.5 flex h-full flex-col gap-4 p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                      <Shield aria-hidden className="h-5 w-5 text-primary" />
                    </span>
                    <h2 className="text-lg font-semibold leading-tight tracking-tight">
                      {entry.title}
                    </h2>
                  </div>
                  <p className="flex-1 text-sm leading-6 text-muted-foreground">
                    {entry.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {entry.updated ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar aria-hidden className="h-3 w-3" />
                        {entry.updated.slice(0, 10)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1 text-sm font-medium text-primary">
                      Read
                      <ArrowRight
                        aria-hidden
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              We&apos;re preparing policy documents.{" "}
              <Link href="/contact" className="text-primary link-underline">
                Contact us
              </Link>{" "}
              with any questions.
            </p>
          </div>
        )}
      </main>
    );
  }

  /* ── Other sections: standard content grid ── */
  return <ContentShell {...collections[section]}><ContentGrid entries={entries} prefix={`/${section}`} /></ContentShell>;
}
