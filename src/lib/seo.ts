import type { Metadata } from "next";
import { site } from "@/lib/site";
import { contentText, publicImageUrl } from "./content-preview";

/** Use the deployed primary host, including for older CMS canonical entries. */
export function canonicalUrl(value: string): string | null {
  try {
    const candidate = value.trim();
    if (!/^https:\/\//i.test(candidate) && !/^\/(?!\/)/.test(candidate)) return null;
    const url = new URL(candidate, site.url);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (["mistravora.com", "www.mistravora.com"].includes(url.hostname)) {
      url.host = new URL(site.url).host;
      if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    }
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

export function sitemapImages(...values: (string | null | undefined)[]) {
  const images = values
    .map(publicImageUrl)
    .filter((src): src is string => !!src)
    .map(src => new URL(src, site.url).href);
  return images.length ? [...new Set(images)] : undefined;
}

type SeoEntry = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  og_image?: string | null;
  noindex?: boolean | null;
};

/** Optional CMS fields must not erase an article's own title or description. */
export function mergeSeoOverrides(base: Metadata, entry: SeoEntry): Metadata {
  const fallback = canonicalUrl(String(base.alternates?.canonical ?? site.url)) ?? site.url;
  const canonical = canonicalUrl(entry.canonical?.trim() || fallback) ?? fallback;
  const title = contentText(entry.title) || titleText(base.title) || undefined;
  const description = contentText(entry.description) || base.description;
  const image = publicImageUrl(entry.og_image);
  return withSocialMetadata({
    ...base,
    title,
    description,
    alternates: { ...base.alternates, canonical },
    openGraph: {
      ...base.openGraph,
      ...(typeof title === "string" ? { title } : {}),
      description: description ?? undefined,
      url: canonical,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      ...base.twitter,
      ...(typeof title === "string" ? { title } : {}),
      description: description ?? undefined,
      ...(image ? { images: [image] } : {}),
    },
    robots: entry.noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : base.robots,
  });
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return withSocialMetadata({
    title,
    description,
    alternates: { canonical: `${site.url}${path}` },
  });
}

const TITLE_SUFFIX = " | Mistravora";
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

/** Shorten at a word boundary so search snippets never end mid-word. */
export function clampText(value: string, max: number): string {
  const text = contentText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—|]+$/, "")}…`;
}

/** Plain text of a Next.js title value (string, absolute or default). */
export function titleText(title: Metadata["title"]): string | null {
  if (!title) return null;
  if (typeof title === "string") return title;
  if ("absolute" in title && title.absolute) return title.absolute;
  if ("default" in title && title.default) return title.default;
  return null;
}

/**
 * Keep search titles within ~60 characters: short titles get the brand suffix
 * from the root template, longer ones drop it, and very long ones are shortened.
 */
export function searchTitle(title: Metadata["title"]): Metadata["title"] {
  if (!title || typeof title !== "string") return title;
  const text = contentText(title);
  if (text.length + TITLE_SUFFIX.length <= MAX_TITLE) return text;
  return { absolute: clampText(text, MAX_TITLE) };
}

export function withSocialMetadata(metadata: Metadata): Metadata {
  const title = titleText(metadata.title) ?? site.name;
  const description = clampText(String(metadata.description ?? site.description), MAX_DESCRIPTION);
  const url = canonicalUrl(String(metadata.alternates?.canonical ?? site.url)) ?? site.url;
  const path = new URL(url, site.url).pathname;
  const image = `${site.url}/share${path === "/" ? "/home" : path}`;
  return {
    ...metadata,
    title: searchTitle(metadata.title),
    description,
    alternates: { ...metadata.alternates, canonical: url },
    openGraph: {
      title,
      description,
      siteName: site.name,
      locale: "en_LK",
      type: "website",
      ...metadata.openGraph,
      url,
      images: metadata.openGraph?.images ?? [
        { url: image, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...metadata.twitter,
      images: metadata.twitter?.images ?? [image],
    },
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
