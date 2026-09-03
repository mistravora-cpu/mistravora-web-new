import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import {
  getPublishedPosts,
  getCaseStudies,
  getIndustries,
  getResearch,
  getPolicies,
} from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

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
    "/contact",
    "/assistant",
    "/tools/cost-calculator",
    "/tools/roi-calculator",
    "/tools/website-audit",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/solutions" ? 0.9 : 0.7,
  }));

  // Dynamic routes — published blog posts
  const posts = await getPublishedPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — case studies
  const caseStudies = await getCaseStudies(true);
  const caseStudyEntries: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${site.url}/projects/${cs.slug}`,
    lastModified: cs.updated_at ? new Date(cs.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — industries
  const industries = await getIndustries(true);
  const industryEntries: MetadataRoute.Sitemap = industries.map((ind) => ({
    url: `${site.url}/industries/${ind.slug}`,
    lastModified: ind.updated_at ? new Date(ind.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — research articles
  const research = await getResearch(true);
  const researchEntries: MetadataRoute.Sitemap = research.map((r) => ({
    url: `${site.url}/research/${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic routes — policies
  const policies = await getPolicies(true);
  const policyEntries: MetadataRoute.Sitemap = policies
    .filter((p) => p.status === "active")
    .map((p) => ({
      url: `${site.url}/policies/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "yearly",
      priority: 0.3,
    }));

  return [
    ...staticEntries,
    ...postEntries,
    ...caseStudyEntries,
    ...industryEntries,
    ...researchEntries,
    ...policyEntries,
  ];
}
