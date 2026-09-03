import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { unstable_cache } from "next/cache";
import type {
  Benefit,
  CaseStudy,
  ContactInfo,
  CoreValue,
  DemoApp,
  Faq,
  HeroSection,
  Industry,
  Inquiry,
  Job,
  MarketingSettings,
  MediaItem,
  NewsletterSubscriber,
  Policy,
  Post,
  PricingAddon,
  PricingNote,
  PricingTier,
  Resource,
  Research,
  Setting,
  SocialMedia,
  Solution,
  Statistic,
  TeamMember,
  TechStack,
  Testimonial,
  TrustedCompany,
  ValueCard,
} from "@/lib/types";

async function safeQuery<T>(
  query: PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  try {
    const { data, error } = await Promise.race([
      query,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("query timeout")), 4000),
      ),
    ]);
    if (error) {
      console.warn("[supabase] query returned error:", error);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.warn("[supabase] query threw:", error);
    return [];
  }
}

async function safeQuerySingle<T>(
  query: PromiseLike<{ data: T | null; error: { code?: string; message?: string } | unknown }>
): Promise<T | null> {
  try {
    const { data, error } = await Promise.race([
      query,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("query timeout")), 4000),
      ),
    ]);
    if (error) {
      // PGRST116 = ".single()" returned 0 rows — expected, not a real error.
      const code = (error as { code?: string }).code;
      if (code !== "PGRST116") {
        console.warn("[supabase] query returned error:", error);
      }
      return null;
    }
    return data;
  } catch (error) {
    console.warn("[supabase] query threw:", error);
    return null;
  }
}

// ─── Child table mapping helpers ───────────────────────────────────────
// The normalized schema stores former array columns in child tables.
// These helpers extract the nested child rows and map them back into the
// array fields expected by the TypeScript types.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChildArrays<T extends Record<string, any>>(
  row: T,
  mapping: Record<string, { childTable: string; childColumn: string; targetField: string }>
): T {
  const result = { ...row };
  for (const [, config] of Object.entries(mapping)) {
    const children = (row as Record<string, unknown>)[config.childTable] as
      | Record<string, unknown>[]
      | undefined;
    (result as Record<string, unknown>)[config.targetField] = (children ?? [])
      .map((c) => c[config.childColumn])
      .filter(Boolean);
    delete (result as Record<string, unknown>)[config.childTable];
  }
  return result;
}

const solutionMapping = {
  features: { childTable: "solution_features", childColumn: "feature", targetField: "features" },
  technologies: { childTable: "solution_technologies", childColumn: "technology", targetField: "technologies" },
  services: { childTable: "solution_services", childColumn: "service_name", targetField: "services" },
  process_steps: { childTable: "solution_process_steps", childColumn: "step", targetField: "process_steps" },
};

const caseStudyMapping = {
  results: { childTable: "case_study_results", childColumn: "result", targetField: "results" },
  technologies: { childTable: "case_study_technologies", childColumn: "technology", targetField: "technologies" },
};

const postMapping = {
  tags: { childTable: "post_tags", childColumn: "tag", targetField: "tags" },
};

const industryMapping = {
  challenges: { childTable: "industry_challenges", childColumn: "challenge", targetField: "challenges" },
  solutions: { childTable: "industry_solutions", childColumn: "solution", targetField: "solutions" },
};

const pricingTierMapping = {
  features: { childTable: "pricing_tier_features", childColumn: "feature", targetField: "features" },
};

const demoAppMapping = {
  features: { childTable: "demo_app_features", childColumn: "feature", targetField: "features" },
};

const researchMapping = {
  tags: { childTable: "research_tags", childColumn: "tag", targetField: "tags" },
};

const SOLUTION_SELECT =
  "*, solution_features!solution_features_solution_id_fkey(feature), solution_technologies!solution_technologies_solution_id_fkey(technology), solution_services!solution_services_solution_id_fkey(service_name), solution_process_steps!solution_process_steps_solution_id_fkey(step), solution_pricing_packages(package_name, timeline, solution_pricing_package_features(feature))";
const CASE_STUDY_SELECT = "*, case_study_results!case_study_results_case_study_id_fkey(result), case_study_technologies!case_study_technologies_case_study_id_fkey(technology)";
const POST_SELECT = "*, post_tags!post_tags_post_id_fkey(tag)";
const INDUSTRY_SELECT = "*, industry_challenges!industry_challenges_industry_id_fkey(challenge), industry_solutions!industry_solutions_industry_id_fkey(solution)";
const PRICING_TIER_SELECT = "*, pricing_tier_features!pricing_tier_features_pricing_tier_id_fkey(feature)";
const DEMO_APP_SELECT = "*, demo_app_features!demo_app_features_demo_app_id_fkey(feature)";
const RESEARCH_SELECT = "*, research_tags!research_tags_research_id_fkey(tag)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSolution(row: any): Solution {
  const result = mapChildArrays(row, solutionMapping) as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const packages = (row.solution_pricing_packages ?? []) as any[];
  (result as Record<string, unknown>).pricing_packages = packages.map((p) => ({
    package_name: p.package_name,
    timeline: p.timeline ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    package_features: (p.solution_pricing_package_features ?? []).map((f: any) => f.feature).filter(Boolean),
  }));
  delete (result as Record<string, unknown>).solution_pricing_packages;
  return result as unknown as Solution;
}

// ─── Cached public queries ─────────────────────────────────────────────
// Read-heavy public data is wrapped with unstable_cache + cache tags.
// revalidatePath in crud-actions.ts purges all "public-data" tags.
// TTL: 300s (5 min) — balances freshness with DB load.
const CACHE_TAGS = ["public-data"];
const CACHE_TTL = 300;

// Internal cached functions — no default params (unstable_cache needs
// explicit args for cache key derivation). Wrapper exports below provide
// the public API with defaults.

const _getSolutions = unstable_cache(
  async (publishedOnly: boolean): Promise<Solution[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("solutions").select(SOLUTION_SELECT).order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    const rows = await safeQuery(query);
    return rows.map((r) => mapSolution(r));
  },
  ["solutions"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getCaseStudies = unstable_cache(
  async (publishedOnly: boolean): Promise<CaseStudy[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("case_studies").select(CASE_STUDY_SELECT).order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    const rows = await safeQuery(query);
    return rows.map((r) => mapChildArrays(r, caseStudyMapping) as unknown as CaseStudy);
  },
  ["projects"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getPosts = unstable_cache(
  async (): Promise<Post[]> => {
    const supabase = createPublicClient();
    const rows = await safeQuery(
      supabase.from("posts").select(POST_SELECT).order("published_at", { ascending: false })
    );
    return rows.map((r) => mapChildArrays(r, postMapping) as unknown as Post);
  },
  ["posts"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getPublishedPosts = unstable_cache(
  async (): Promise<Post[]> => {
    const supabase = createPublicClient();
    const rows = await safeQuery(
      supabase.from("posts").select(POST_SELECT).eq("published", true).order("published_at", { ascending: false })
    );
    return rows.map((r) => mapChildArrays(r, postMapping) as unknown as Post);
  },
  ["published-posts"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  return safeQuery(
    supabase.from("inquiries").select("*").order("created_at", { ascending: false })
  );
}

const _getJobs = unstable_cache(
  async (publishedOnly: boolean): Promise<Job[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["jobs"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getSettings = unstable_cache(
  async (): Promise<Setting[]> => {
    const supabase = createPublicClient();
    return safeQuery(supabase.from("settings").select("*").order("key"));
  },
  ["settings"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getHeroSection = unstable_cache(
  async (page: string): Promise<HeroSection | null> => {
    const supabase = createPublicClient();
    return safeQuerySingle(
      supabase.from("hero_sections").select("*").eq("page", page).single()
    );
  },
  ["hero-section"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getAllHeroSections = unstable_cache(
  async (): Promise<HeroSection[]> => {
    const supabase = createPublicClient();
    return safeQuery(
      supabase.from("hero_sections").select("*").order("page", { ascending: true })
    );
  },
  ["all-hero-sections"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getValueCards = unstable_cache(
  async (publishedOnly: boolean): Promise<ValueCard[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("value_cards").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["value-cards"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getStatistics = unstable_cache(
  async (publishedOnly: boolean): Promise<Statistic[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("statistics").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["statistics"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getCoreValues = unstable_cache(
  async (publishedOnly: boolean): Promise<CoreValue[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("core_values").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["core-values"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getTeamMembers = unstable_cache(
  async (publishedOnly: boolean): Promise<TeamMember[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("team_members").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["team-members"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getPricingTiers = unstable_cache(
  async (publishedOnly: boolean): Promise<PricingTier[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("pricing_tiers").select(PRICING_TIER_SELECT).order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("active", true);
    const rows = await safeQuery(query);
    return rows.map((r) => mapChildArrays(r, pricingTierMapping) as unknown as PricingTier);
  },
  ["pricing-tiers"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getPricingNotes = unstable_cache(
  async (publishedOnly: boolean): Promise<PricingNote[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("pricing_notes").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("active", true);
    return safeQuery(query);
  },
  ["pricing-notes"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getPricingAddons = unstable_cache(
  async (publishedOnly: boolean): Promise<PricingAddon[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("pricing_addons").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("active", true);
    return safeQuery(query);
  },
  ["pricing-addons"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getIndustries = unstable_cache(
  async (publishedOnly: boolean): Promise<Industry[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("industries").select(INDUSTRY_SELECT).order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("archived", false);
    const rows = await safeQuery(query);
    return rows.map((r) => mapChildArrays(r, industryMapping) as unknown as Industry);
  },
  ["industries"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getResources = unstable_cache(
  async (publishedOnly: boolean): Promise<Resource[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("resources").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["resources"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getTrustedCompanies = unstable_cache(
  async (publishedOnly: boolean): Promise<TrustedCompany[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("trusted_companies").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["trusted-companies"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getPolicies = unstable_cache(
  async (publishedOnly: boolean): Promise<Policy[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("policies").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("status", "active");
    return safeQuery(query);
  },
  ["policies"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getContactInfo = unstable_cache(
  async (): Promise<ContactInfo | null> => {
    const supabase = createPublicClient();
    return safeQuerySingle(
      supabase.from("contact_info").select("*").limit(1).single()
    );
  },
  ["contact-info"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getSocialMedia = unstable_cache(
  async (publishedOnly: boolean): Promise<SocialMedia[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("social_media").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["social-media"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getFaqs = unstable_cache(
  async (page: string | undefined, publishedOnly: boolean): Promise<Faq[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("faqs").select("*").order("sort_order", { ascending: true });
    if (page) {
      query = query.eq("page", page);
    }
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["faqs"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getDemoApps = unstable_cache(
  async (publishedOnly: boolean): Promise<DemoApp[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("demo_apps").select(DEMO_APP_SELECT).order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    const rows = await safeQuery(query);
    return rows.map((r) => mapChildArrays(r, demoAppMapping) as unknown as DemoApp);
  },
  ["demo-apps"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getTechStack = unstable_cache(
  async (publishedOnly: boolean): Promise<TechStack[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("tech_stack").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["tech-stack"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getBenefits = unstable_cache(
  async (publishedOnly: boolean): Promise<Benefit[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("benefits").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["benefits"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

const _getTestimonials = unstable_cache(
  async (publishedOnly: boolean): Promise<Testimonial[]> => {
    const supabase = createPublicClient();
    let query = supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
    if (publishedOnly) query = query.eq("published", true);
    return safeQuery(query);
  },
  ["testimonials"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

// ─── Public wrapper exports with default params ────────────────────────

export function getSolutions(publishedOnly = false) { return _getSolutions(publishedOnly); }
export function getCaseStudies(publishedOnly = false) { return _getCaseStudies(publishedOnly); }
export function getPosts() { return _getPosts(); }
export function getPublishedPosts() { return _getPublishedPosts(); }
export function getJobs(publishedOnly = false) { return _getJobs(publishedOnly); }
export function getSettings() { return _getSettings(); }
export function getHeroSection(page: string) { return _getHeroSection(page); }
export function getAllHeroSections() { return _getAllHeroSections(); }
export function getValueCards(publishedOnly = false) { return _getValueCards(publishedOnly); }
export function getStatistics(publishedOnly = false) { return _getStatistics(publishedOnly); }
export function getCoreValues(publishedOnly = false) { return _getCoreValues(publishedOnly); }
export function getTeamMembers(publishedOnly = false) { return _getTeamMembers(publishedOnly); }
export function getPricingTiers(publishedOnly = false) { return _getPricingTiers(publishedOnly); }
export function getPricingNotes(publishedOnly = false) { return _getPricingNotes(publishedOnly); }
export function getPricingAddons(publishedOnly = false) { return _getPricingAddons(publishedOnly); }
export function getIndustries(publishedOnly = false) { return _getIndustries(publishedOnly); }
export function getResources(publishedOnly = false) { return _getResources(publishedOnly); }
export function getTrustedCompanies(publishedOnly = false) { return _getTrustedCompanies(publishedOnly); }
export function getPolicies(publishedOnly = false) { return _getPolicies(publishedOnly); }
export function getContactInfo() { return _getContactInfo(); }
export function getSocialMedia(publishedOnly = false) { return _getSocialMedia(publishedOnly); }
export function getFaqs(page?: string, publishedOnly = false) { return _getFaqs(page, publishedOnly); }
export function getDemoApps(publishedOnly = false) { return _getDemoApps(publishedOnly); }
export function getTechStack(publishedOnly = false) { return _getTechStack(publishedOnly); }
export function getBenefits(publishedOnly = false) { return _getBenefits(publishedOnly); }
export function getTestimonials(publishedOnly = false) { return _getTestimonials(publishedOnly); }

// ─── Admin variants ───────────────────────────────────────────────────
// These use the cookie-aware createClient() which bypasses RLS via the
// service role. Admins can see all rows including drafts, unpublished,
// and archived content. Not cached — always returns fresh data.

export async function getAdminSolutions(): Promise<Solution[]> {
  const supabase = await createClient();
  const rows = await safeQuery(supabase.from("solutions").select(SOLUTION_SELECT).order("sort_order", { ascending: true }));
  return rows.map((r) => mapSolution(r));
}
export async function getAdminCaseStudies(): Promise<CaseStudy[]> {
  const supabase = await createClient();
  const rows = await safeQuery(supabase.from("case_studies").select(CASE_STUDY_SELECT).order("sort_order", { ascending: true }));
  return rows.map((r) => mapChildArrays(r, caseStudyMapping) as unknown as CaseStudy);
}
export async function getAdminPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const rows = await safeQuery(supabase.from("posts").select(POST_SELECT).order("published_at", { ascending: false }));
  return rows.map((r) => mapChildArrays(r, postMapping) as unknown as Post);
}
export async function getAdminJobs(): Promise<Job[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("jobs").select("*").order("created_at", { ascending: false }));
}
export async function getAdminHeroSections(): Promise<HeroSection[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("hero_sections").select("*").order("page", { ascending: true }));
}
export async function getAdminValueCards(): Promise<ValueCard[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("value_cards").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminStatistics(): Promise<Statistic[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("statistics").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminCoreValues(): Promise<CoreValue[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("core_values").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("team_members").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminPricingTiers(): Promise<PricingTier[]> {
  const supabase = await createClient();
  const rows = await safeQuery(supabase.from("pricing_tiers").select(PRICING_TIER_SELECT).order("sort_order", { ascending: true }));
  return rows.map((r) => mapChildArrays(r, pricingTierMapping) as unknown as PricingTier);
}
export async function getAdminPricingNotes(): Promise<PricingNote[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("pricing_notes").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminPricingAddons(): Promise<PricingAddon[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("pricing_addons").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminIndustries(): Promise<Industry[]> {
  const supabase = await createClient();
  const rows = await safeQuery(supabase.from("industries").select(INDUSTRY_SELECT).order("sort_order", { ascending: true }));
  return rows.map((r) => mapChildArrays(r, industryMapping) as unknown as Industry);
}
export async function getAdminResources(): Promise<Resource[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("resources").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminTrustedCompanies(): Promise<TrustedCompany[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("trusted_companies").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminPolicies(): Promise<Policy[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("policies").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminContactInfo(): Promise<ContactInfo | null> {
  const supabase = await createClient();
  return safeQuerySingle(supabase.from("contact_info").select("*").limit(1).single());
}
export async function getAdminSocialMedia(): Promise<SocialMedia[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("social_media").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminFaqs(page?: string): Promise<Faq[]> {
  const supabase = await createClient();
  let query = supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  if (page) query = query.eq("page", page);
  return safeQuery(query);
}
export async function getAdminDemoApps(): Promise<DemoApp[]> {
  const supabase = await createClient();
  const rows = await safeQuery(supabase.from("demo_apps").select(DEMO_APP_SELECT).order("sort_order", { ascending: true }));
  return rows.map((r) => mapChildArrays(r, demoAppMapping) as unknown as DemoApp);
}
export async function getAdminTechStack(): Promise<TechStack[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("tech_stack").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminBenefits(): Promise<Benefit[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("benefits").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("testimonials").select("*").order("sort_order", { ascending: true }));
}
export async function getAdminSettings(): Promise<Setting[]> {
  const supabase = await createClient();
  return safeQuery(supabase.from("settings").select("*").order("key"));
}

export async function getMediaLibrary(): Promise<MediaItem[]> {
  const supabase = await createClient();
  return safeQuery(
    supabase.from("media_library").select("*").order("created_at", { ascending: false })
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const row = await safeQuerySingle(
    supabase.from("posts").select(POST_SELECT).eq("slug", slug).eq("published", true).single()
  );
  return row ? (mapChildArrays(row, postMapping) as unknown as Post) : null;
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const supabase = await createClient();
  const row = await safeQuerySingle(
    supabase.from("case_studies").select(CASE_STUDY_SELECT).eq("slug", slug).eq("published", true).single()
  );
  return row ? (mapChildArrays(row, caseStudyMapping) as unknown as CaseStudy) : null;
}

export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  const supabase = await createClient();
  const row = await safeQuerySingle(
    supabase.from("industries").select(INDUSTRY_SELECT).eq("slug", slug).eq("archived", false).single()
  );
  return row ? (mapChildArrays(row, industryMapping) as unknown as Industry) : null;
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const supabase = await createClient();
  return safeQuery(
    supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false })
  );
}

export async function getResearch(publishedOnly = false): Promise<Research[]> {
  const supabase = await createClient();
  let query = supabase.from("research").select(RESEARCH_SELECT).order("published_at", { ascending: false });
  if (publishedOnly) query = query.eq("published", true);
  const rows = await safeQuery(query);
  return rows.map((r) => mapChildArrays(r, researchMapping) as unknown as Research);
}

export async function getResearchBySlug(slug: string): Promise<Research | null> {
  const supabase = await createClient();
  const row = await safeQuerySingle(
    supabase.from("research").select(RESEARCH_SELECT).eq("slug", slug).eq("published", true).single()
  );
  return row ? (mapChildArrays(row, researchMapping) as unknown as Research) : null;
}

const marketingKeys: (keyof MarketingSettings)[] = [
  "ga4_measurement_id",
  "gtm_container_id",
  "clarity_id",
  "hotjar_id",
  "sentry_dsn",
  "logrocket_id",
  "meta_pixel_id",
  "meta_capi_token",
  "google_ads_conversion_id",
  "google_ads_conversion_label",
  "google_remarketing_tag_id",
  "microsoft_uet_tag_id",
  "linkedin_insight_tag_id",
  "tiktok_pixel_id",
  "pinterest_tag_id",
  "reddit_pixel_id",
  "snap_pixel_id",
  "x_pixel_id",
  "google_search_console_verification",
  "bing_webmaster_verification",
  "yandex_verification",
  "baidu_verification",
  "pinterest_verification",
  "facebook_domain_verification",
  "default_og_image",
  "twitter_handle",
  "twitter_creator",
  "facebook_app_id",
  "telegram_url",
  "messenger_url",
  "pwa_theme_color",
  "pwa_background_color",
];

const _getMarketingSettings = unstable_cache(
  async (): Promise<MarketingSettings> => {
    const supabase = createPublicClient();
    const settings = await safeQuery(supabase.from("settings").select("*"));
    const map = new Map(settings.map((s) => [s.key, s.value ?? ""]));
    const result = {} as MarketingSettings;
    for (const key of marketingKeys) {
      result[key] = map.get(key) ?? "";
    }
    return result;
  },
  ["marketing-settings"],
  { revalidate: CACHE_TTL, tags: CACHE_TAGS }
);

export function getMarketingSettings() {
  return _getMarketingSettings();
}
