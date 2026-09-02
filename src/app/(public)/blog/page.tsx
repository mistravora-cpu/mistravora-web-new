import type { Metadata } from "next";
import Link from "next/link";
import { Rss } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { site } from "@/lib/site";
import { getHeroSection, getPublishedPosts } from "@/lib/services";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on web performance, software, and digital growth from the Mistravora team.",
  alternates: {
    canonical: `${site.url}/blog`,
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

export default async function BlogPage() {
  const [hero, posts] = await Promise.all([
    getHeroSection("blog"),
    getPublishedPosts(),
  ]);

  return (
    <>
    <AnimatedHero hero={hero} page="blog" />
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <div className="flex items-center justify-center gap-3">
        <PageHeader
          title="Blog"
          description="Notes on building fast software, growing online, and shipping products that last."
        />
        <a
          href="/blog/rss.xml"
          aria-label="RSS feed"
          className="mt-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Rss className="h-4 w-4" />
        </a>
      </div>

      {posts.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} animation={i % 2 === 0 ? "flip-in" : "elastic"} delay={i * 80} className="shine-sweep hover-lift group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <Link href={`/blog/${post.slug}`} className="flex flex-col gap-3">
              <article className="flex flex-col gap-3">
              {post.cover_image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="h-40 w-full rounded-lg object-cover"
                />
              )}
              {post.category && (
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {post.category}
                </span>
              )}
              <h2 className="text-lg font-semibold">{post.title}</h2>
              {post.excerpt && (
                <p className="text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {post.author && <span>{post.author}</span>}
                {post.read_time && <span>· {post.read_time}</span>}
              </div>
            </article>
            </Link>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal animation="scale-in" className="mt-12 flex w-full flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">No posts yet</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Our first articles are being written. Subscribe or check back soon —
            or tell us what you&apos;d like to read about.
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">Suggest a topic</Link>
          </Button>
        </ScrollReveal>
      )}
    </section>
    </>
  );
}
