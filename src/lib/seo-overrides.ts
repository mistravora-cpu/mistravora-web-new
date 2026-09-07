import { getBusinessProfile } from "@/lib/business-profile";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { withSocialMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
const settings = unstable_cache(
  async () => {
    const { data, error } = await createPublicClient()
      .from("page_seo")
      .select("path,title,description,canonical,noindex,og_image")
      .abortSignal(AbortSignal.timeout(8000));
    if (error && error.code !== "PGRST205" && error.code !== "42P01")
      throw error;
    return data ?? [];
  },
  ["page-seo"],
  { revalidate: 300, tags: ["public-data"] },
);
export async function applySeoOverrides(base: Metadata): Promise<Metadata> {
  const path = new URL(String(base.alternates?.canonical ?? site.url), site.url)
    .pathname;
  if (["/", "/about", "/contact", "/industries"].includes(path)) {
    const profile = await getBusinessProfile();
    const description = path === "/contact" ? `${profile.availability}. ${profile.response}. Contact ${profile.name}: ${profile.email}.` : profile.intro;
    base = { ...base, description, ...(path === "/" ? { title: profile.seoTitle || `${profile.name} — ${profile.headline}` } : {}), openGraph: { ...base.openGraph, description, ...(path === "/" ? { title: profile.headline } : {}) }, twitter: { ...base.twitter, description, ...(path === "/" ? { title: profile.headline } : {}) } };
  }
  const entry = (await settings().catch(() => [])).find((e) => e.path === path);
  if (!entry) return base;
  const canonical =
    typeof entry.canonical === "string" && /^https:\/\//.test(entry.canonical)
      ? entry.canonical
      : String(base.alternates?.canonical ?? site.url);
  const result = withSocialMetadata({
    ...base,
    title: entry.title,
    description: entry.description,
    alternates: { ...base.alternates, canonical },
    openGraph: {
      ...base.openGraph,
      title: entry.title,
      description: entry.description,
      url: canonical,
      ...(entry.og_image ? { images: [entry.og_image] } : {}),
    },
    twitter: {
      ...base.twitter,
      title: entry.title,
      description: entry.description,
      ...(entry.og_image ? { images: [entry.og_image] } : {}),
    },
    robots: entry.noindex ? { index: false, follow: true } : base.robots,
  });
  return result;
}
export async function getIndexablePaths() {
  return settings().catch(() => []);
}
