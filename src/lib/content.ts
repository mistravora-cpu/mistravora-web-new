import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import {
  getPolicies,
  getResources,
  getSolutions,
  getPublishedPosts,
  getCaseStudies,
  getResearch,
} from "@/lib/services";

export const collections = {
  services: {
    title: "Services",
    description:
      "Explore how Mistravora builds software, web platforms, and AI features for your business.",
  },
  solutions: {
    title: "Solutions",
    description: "Software solutions built around your business needs.",
  },
  glossary: {
    title: "Technology glossary",
    description:
      "Plain-language explanations of software, AI, and business technology.",
  },
  "knowledge-base": {
    title: "Guides & knowledge base",
    description:
      "Practical guidance for planning, building, and maintaining your software.",
  },
  authors: {
    title: "Our authors",
    description:
      "Meet the people behind Mistravora’s insights and technical guides.",
  },
  resources: {
    title: "Resources",
    description:
      "Download planning resources, guides, and practical tools for your next project.",
  },
  policies: {
    title: "Policies",
    description: "Read Mistravora’s published policies and service terms.",
  },
} as const;
export type Collection = keyof typeof collections;
export function isCollection(value: string): value is Collection {
  return Object.hasOwn(collections, value);
}
export type ContentEntry = {
  slug: string;
  title: string;
  description: string;
  body?: string | null;
  image?: string | null;
  updated?: string;
  published?: string | null;
  author?: string | null;
  category?: string | null;
  download?: string | null;
  links?: string[];
  features?: string[];
  technologies?: string[];
};

type ContentRow = {
  slug: string;
  service_features?: { feature: string }[];
  service_technologies?: { technology: string }[];
} & Partial<
  Record<
    | "title"
    | "term"
    | "name"
    | "description"
    | "definition"
    | "summary"
    | "role"
    | "explanation"
    | "examples"
    | "related_concepts"
    | "mistravora_service_relationship"
    | "body"
    | "bio"
    | "cover_image"
    | "photo"
    | "updated_at"
    | "published_at"
    | "category"
    | "linkedin"
    | "github",
    string
  >
>;
export const getCollection = unstable_cache(
  async (section: Collection): Promise<ContentEntry[]> => {
    if (section === "policies")
      return (await getPolicies(true)).map((p) => ({
        slug: p.slug,
        title: p.title,
        description: `${p.title} — version ${p.version}.`,
        body: p.body,
        updated: p.updated_at,
      }));
    if (section === "resources")
      return (await getResources(true)).map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? "",
        download: p.file_url,
        category: p.category,
        updated: p.updated_at,
      }));
    if (section === "solutions")
      return (await getSolutions(true)).map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.short_description ?? p.summary ?? "",
        body: p.long_description ?? p.body,
        image: p.image,
        updated: p.updated_at,
        features: p.features,
        technologies: p.technologies,
      }));
    const table =
      section === "glossary"
        ? "glossary_terms"
        : section === "knowledge-base"
          ? "knowledge_base"
          : section;
    const selection: string =
      section === "services"
        ? "*, service_features(feature), service_technologies(technology)"
        : "*";
    let query = createPublicClient().from(table).select(selection);
    if (section !== "authors") query = query.eq("published", true);
    if (section === "knowledge-base")
      query = query.or(
        `published_at.is.null,published_at.lte.${new Date().toISOString()}`,
      );
    const { data, error } = await query
      .order(section === "authors" ? "name" : "sort_order")
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    return ((data ?? []) as unknown as ContentRow[]).map((p) => ({
      slug: p.slug,
      title: p.title ?? p.term ?? p.name ?? p.slug,
      description: p.description ?? p.definition ?? p.summary ?? p.role ?? "",
      body:
        section === "glossary"
          ? [
              p.explanation,
              p.examples,
              p.related_concepts,
              p.mistravora_service_relationship,
            ]
              .filter(Boolean)
              .join("\n\n")
          : (p.body ?? p.bio),
      image: p.cover_image ?? p.photo,
      updated: p.updated_at,
      published: p.published_at,
      category: p.category,
      links: [p.linkedin, p.github].filter(
        (link): link is string => !!link && /^https:\/\//.test(link),
      ),
      features: p.service_features?.map((f: { feature: string }) => f.feature),
      technologies: p.service_technologies?.map(
        (t: { technology: string }) => t.technology,
      ),
    }));
  },
  ["marketing-collections-privacy-review"],
  { revalidate: 300, tags: ["public-data"] },
);

export type SearchEntry = ContentEntry & { href: string; kind: string };
export async function getSearchEntries(): Promise<SearchEntry[]> {
  const [groups, posts, projects, research] = await Promise.all([
    Promise.all(
      Object.keys(collections)
        .filter((k) => k !== "policies")
        .map(async (key) =>
          (await getCollection(key as Collection)).map((p) => ({
            ...p,
            href: `/${key}/${p.slug}`,
            kind: collections[key as Collection].title,
          })),
        ),
    ),
    getPublishedPosts(),
    getCaseStudies(true),
    getResearch(true),
  ]);
  return [
    ...groups.flat(),
    ...posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.excerpt ?? "",
      href: `/blog/${p.slug}`,
      kind: "Blog",
    })),
    ...projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.problem_statement ?? p.outcome ?? "",
      href: `/projects/${p.slug}`,
      kind: "Projects",
    })),
    ...research.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.summary,
      href: `/research/${p.slug}`,
      kind: "Research",
    })),
  ];
}
