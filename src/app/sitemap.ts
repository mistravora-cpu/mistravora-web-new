import { getIndexablePaths } from "@/lib/seo-overrides";
import type { MetadataRoute } from "next";
import { collections, getCollection, type Collection } from "@/lib/content";
import { site } from "@/lib/site";
import {
  getPublishedPosts,
  getCaseStudies,
  getIndustries,
  getResearch,
  getPolicies,
} from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, caseStudies, industries, research, policies, contentGroups] = await Promise.all([
    getPublishedPosts(), getCaseStudies(true), getIndustries(true), getResearch(true), getPolicies(true),
    Promise.all(Object.keys(collections).filter(k => k !== "policies").map(async key => ({ key, entries: await getCollection(key as Collection) }))),
  ]);

  // Static routes — all public pages including tools sub-pages
  const staticRoutes = [
    "/",
    "/solutions",
    "/industries",
    "/pricing",
    "/projects",
    "/blog",
    "/research",
    "/about",
    "/careers",
    "/tools",
    "/demos",
    "/contact",
    "/assistant",
    "/brand",
    "/services",
    "/insights",
    "/glossary",
    "/knowledge-base",
    "/authors",
    "/resources",
    "/policies",
    "/book",
    "/tools/cost-calculator",
    "/tools/roi-calculator",
    "/tools/website-audit",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/solutions" ? 0.9 : 0.7,
    // Register the official logo image on the homepage for AI/image crawlers
    ...(route === "/"
      ? {
          images: [`${site.url}/assets/mistravora-logo.svg`],
        }
      : {}),
  }));

  // Dynamic routes — published blog posts
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — case studies
  const caseStudyEntries: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${site.url}/projects/${cs.slug}`,
    lastModified: cs.updated_at ? new Date(cs.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — industries
  const industryEntries: MetadataRoute.Sitemap = industries.map((ind) => ({
    url: `${site.url}/industries/${ind.slug}`,
    lastModified: ind.updated_at ? new Date(ind.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — research articles
  const researchEntries: MetadataRoute.Sitemap = research.map((r) => ({
    url: `${site.url}/research/${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — policies
  const policyEntries: MetadataRoute.Sitemap = policies
    .filter((p) => p.status === "active")
    .map((p) => ({
      url: `${site.url}/policies/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: "yearly",
      priority: 0.3,
    }));

  const overrides = await getIndexablePaths();
  return [
    ...staticEntries,
    ...postEntries,
    ...caseStudyEntries,
    ...industryEntries,
    ...researchEntries,
    ...policyEntries,
    ...contentGroups.flatMap(({ key, entries }) => entries.map(e => ({ url: `${site.url}/${key}/${e.slug}`, lastModified: e.updated ? new Date(e.updated) : undefined }))),
  ].filter(entry => !overrides.some(setting => setting.path === new URL(entry.url).pathname && (setting.noindex || (setting.canonical && setting.canonical !== entry.url))));
}
