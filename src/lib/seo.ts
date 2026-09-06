import type { Metadata } from "next";
import { site } from "@/lib/site";

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

export function withSocialMetadata(metadata: Metadata): Metadata {
  const title = typeof metadata.title === "string" ? metadata.title : site.name;
  const description = metadata.description ?? site.description;
  const url = String(metadata.alternates?.canonical ?? site.url);
  const path = new URL(url, site.url).pathname;
  const image = `${site.url}/share${path === "/" ? "/home" : path}`;
  return {
    ...metadata,
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: "en_LK",
      type: "website",
      ...metadata.openGraph,
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
