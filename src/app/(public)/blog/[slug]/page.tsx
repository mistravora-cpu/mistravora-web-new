import { ArticleBody } from "@/components/article-body";
import Image from "@/components/content-image";
import { contentText } from "@/lib/content-preview";
import { getBusinessProfile } from "@/lib/business-profile";
import { jsonLd, withSocialMetadata } from "@/lib/seo";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { ShareButton } from "@/components/share-button";
import { RelatedContent } from "@/components/related-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { getPostBySlug } from "@/lib/services";
import { site } from "@/lib/site";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const url = `${site.url}/blog/${post.slug}`;
  return applySeoOverrides(withSocialMetadata({
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const profile = await getBusinessProfile();
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="w-full site-gutter py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, name: post.title, description: contentText(post.excerpt, 200), image: post.cover_image || undefined, mainEntityOfPage: `${site.url}/blog/${post.slug}`, url: `${site.url}/blog/${post.slug}`, dateModified: post.updated_at, datePublished: post.published_at ?? undefined, publisher: { "@id": `${site.url}/#organization` }, author: post.author ? { "@type": post.author === profile.name ? "Organization" : "Person", name: post.author } : undefined }) }} />
      <div className="w-full min-w-0">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />
        <ScrollReveal animation="fade-up">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </Button>

          {post.category && (
            <span className="eyebrow">
              {post.category}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.author}
                {post.author_role && ` · ${post.author_role}`}
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.published_at}>{new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</time>
              </span>
            )}
            {post.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.read_time}
              </span>
            )}
          </div>

          {post.cover_image && (
            <Image
              src={post.cover_image}
              alt={post.title}
              width={1600}
              height={900}
              sizes="(max-width: 640px) calc(100vw - 32px), calc(100vw - 64px)"
              className="mt-10 aspect-video max-h-[36rem] w-full rounded-xl object-contain"
            />
          )}

          {post.excerpt && (
            <p className="mt-8 text-lg leading-8 text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {post.body && (
            <div className="mt-8 max-w-none text-base leading-7 text-foreground/90 [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-4 [&_p]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground">
              <ArticleBody body={post.body} title={post.title} />
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.medium_url && (
            <p className="mt-6 text-sm text-muted-foreground">
              Originally published on{" "}
              <a
                href={post.medium_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary link-underline"
              >
                Medium
              </a>
            </p>
          )}
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200} className="mt-14 rounded-xl border border-border bg-card p-7 text-center">
          <h2 className="text-lg font-semibold tracking-tight">Need help building something like this?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.response}. Tell us about your requirements.
          </p>
          <Button asChild className="mt-5">
            <Link href="/contact">Get a free quote</Link>
          </Button>
        </ScrollReveal>
      </div>
      <div className="mt-10 w-full"><ShareButton title={post.title} /><RelatedContent currentPath={`/blog/${post.slug}`} title={post.title} /></div>
    </article>
  );
}
