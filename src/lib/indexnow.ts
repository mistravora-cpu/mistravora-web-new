import "server-only";
import { after } from "next/server";
import { createPublicClient } from "./supabase/public";
import { createAdminClient } from "./supabase/admin";
import { indexNowConfig, indexNowPayload, indexNowUrls, type IndexNowResult } from "./indexnow-config";
import { memberSlug } from "./team-slug";

const detailTables: Record<string, { prefix: string; fields: string; publication: "published" | "status" | "author" | "archived" | "seo" }> = {
  posts: { prefix: "/blog", fields: "slug,published,published_at", publication: "published" },
  research: { prefix: "/research", fields: "slug,published,published_at", publication: "published" },
  case_studies: { prefix: "/projects", fields: "slug,published", publication: "published" },
  industries: { prefix: "/industries", fields: "slug,archived", publication: "archived" },
  services: { prefix: "/services", fields: "slug,published", publication: "published" },
  solutions: { prefix: "/solutions", fields: "slug,published", publication: "published" },
  glossary_terms: { prefix: "/glossary", fields: "slug,published", publication: "published" },
  knowledge_base: { prefix: "/knowledge-base", fields: "slug,published,published_at", publication: "published" },
  resources: { prefix: "/resources", fields: "slug,published", publication: "published" },
  authors: { prefix: "/authors", fields: "slug", publication: "author" },
  policies: { prefix: "/policies", fields: "slug,status", publication: "status" },
  team_members: { prefix: "/about/team", fields: "slug,name,published", publication: "published" },
  page_seo: { prefix: "", fields: "path", publication: "seo" },
};
const staticPaths: Record<string, string[]> = {
  posts: ["/blog", "/insights"], research: ["/research", "/insights"],
  case_studies: ["/", "/projects", "/insights"], industries: ["/industries"],
  services: ["/", "/services"], solutions: ["/solutions"],
  glossary_terms: ["/glossary", "/insights"], knowledge_base: ["/knowledge-base", "/insights"],
  resources: ["/resources", "/insights"], authors: ["/authors", "/insights"],
  policies: ["/policies"], team_members: ["/about"], jobs: ["/careers"], benefits: ["/careers"],
  statistics: ["/", "/about"], value_cards: ["/"], core_values: ["/about"],
  trusted_companies: ["/"], tech_stack: ["/about"], demo_apps: ["/demos"],
  pricing_tiers: ["/pricing"], pricing_notes: ["/pricing"], pricing_addons: ["/pricing"],
  booking_slots: ["/book"], contact_info: ["/contact"],
};
// These changes can affect several public pages; use the published sitemap.
const sharedTables = new Set([
  "settings", "page_seo", "hero_sections", "testimonials", "faqs", "social_media",
  "solution_features", "solution_technologies", "solution_services", "solution_process_steps",
  "solution_pricing_packages", "solution_pricing_package_features", "solution_demo_links",
  "case_study_results", "case_study_technologies", "post_tags", "industry_challenges",
  "industry_solutions", "pricing_tier_features", "demo_app_features", "research_tags",
  "knowledge_base_tags", "service_features", "service_technologies", "service_faqs",
]);
const statusKey = "indexnow_last_submission";

export async function captureIndexNowPaths(table: string, id?: string): Promise<string[]> {
  const config = detailTables[table];
  if (!config || !id || process.env.VERCEL_ENV !== "production") return [];
  const { data, error } = await createPublicClient().from(table).select(config.fields)
    .eq("id", id).abortSignal(AbortSignal.timeout(5000)).maybeSingle();
  if (error) throw new Error("Unable to read the previous public URL for IndexNow.");
  const row = data as unknown as { slug?: string; name?: string; path?: string; published?: boolean; archived?: boolean; published_at?: string; status?: string } | null;
  if (!row || (config.publication === "published" && row.published !== true)
    || (config.publication === "archived" && row.archived !== false)
    || (config.publication === "status" && row.status !== "active")
    || (row.published_at && Date.parse(row.published_at) > Date.now())) return [];
  if (config.publication === "seo") return row.path ? [row.path] : [];
  const slug = table === "team_members" ? memberSlug({ id, slug: row.slug, name: row.name || "" }) : row.slug;
  return slug ? [`${config.prefix}/${slug}`] : [];
}

export async function getIndexNowStatus(): Promise<IndexNowResult | null> {
  const { data, error } = await createAdminClient().from("settings").select("value")
    .eq("key", statusKey).abortSignal(AbortSignal.timeout(5000)).maybeSingle();
  if (error) throw new Error("Unable to load IndexNow submission status.");
  try {
    const value = data?.value ? JSON.parse(data.value) : null;
    return value && typeof value.ok === "boolean" && typeof value.message === "string"
      && Number.isInteger(value.count) && typeof value.checkedAt === "string"
      && Number.isFinite(Date.parse(value.checkedAt))
      ? { ...value, urls: indexNowUrls(Array.isArray(value.urls) ? value.urls.filter((url: unknown) => typeof url === "string") : []) } as IndexNowResult
      : null;
  } catch { return null; }
}

async function recordResult(result: IndexNowResult): Promise<IndexNowResult> {
  try {
    const { error } = await createAdminClient().from("settings").upsert({ key: statusKey, value: JSON.stringify(result) }, { onConflict: "key" })
      .abortSignal(AbortSignal.timeout(5000));
    if (error) return { ...result, message: `${result.message} The status could not be saved; retry from this screen.` };
  } catch { return { ...result, message: `${result.message} The status could not be saved; retry from this screen.` }; }
  return result;
}

export async function submitIndexNow(paths: string[]): Promise<IndexNowResult> {
  const checkedAt = new Date().toISOString();
  if (process.env.VERCEL_ENV !== "production") {
    return { ok: false, count: 0, checkedAt, message: "IndexNow submissions run on the production deployment only." };
  }
  let count = 0;
  let urls: string[] = [];
  try {
    const payload = indexNowPayload(paths);
    count = payload.urlList.length;
    urls = payload.urlList;
    const proof = await fetch(payload.keyLocation, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(6000) });
    if (!proof.ok || (await proof.text()).trim() !== indexNowConfig.key) {
      return recordResult({ ok: false, checkedAt, count, urls, message: "The IndexNow ownership file is not live yet. Deploy it, then retry." });
    }
    const response = await fetch(indexNowConfig.endpoint, {
      method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
    });
    const messages: Record<number, string> = {
      200: "URLs received by IndexNow. Receipt does not mean they are indexed.",
      202: "URLs received; IndexNow ownership-key validation is pending.",
      400: "IndexNow rejected the request format.",
      403: "IndexNow could not verify the ownership key. Check the public key file and retry.",
      422: "IndexNow rejected the host or URL scope.",
      429: "IndexNow rate limit reached. Wait before retrying.",
    };
    return recordResult({ ok: response.status === 200 || response.status === 202, status: response.status,
      checkedAt, count, urls, message: messages[response.status] ?? "IndexNow is unavailable. Retry later from Marketing & SEO." });
  } catch {
    return recordResult({ ok: false, checkedAt, count, urls, message: "IndexNow could not be reached. Your content is saved; retry from Marketing & SEO." });
  }
}

export async function submitIndexNowSitemap(retryPaths: string[] = []): Promise<IndexNowResult> {
  if (process.env.VERCEL_ENV !== "production") return submitIndexNow([]);
  const sitemap = (await import("@/app/sitemap")).default;
  return submitIndexNow([...retryPaths, ...(await sitemap()).map(entry => entry.url)]);
}

export function queueIndexNow(table: string, id?: string, previousPaths: string[] | null = []) {
  if (process.env.VERCEL_ENV !== "production" || (!staticPaths[table] && !sharedTables.has(table))) return;
  after(async () => {
    try {
      const paths = [...(staticPaths[table] ?? []), ...(previousPaths ?? []), ...await captureIndexNowPaths(table, id)];
      if (sharedTables.has(table)) {
        const sitemap = (await import("@/app/sitemap")).default;
        paths.push(...(await sitemap()).map(entry => entry.url));
      }
      const result = await submitIndexNow(paths);
      if (previousPaths === null) await recordResult({ ...result, ok: false,
        message: `${result.message} The previous URL could not be read before saving. Check any renamed or removed URL in Bing Webmaster Tools.` });
    } catch {
      await recordResult({ ok: false, checkedAt: new Date().toISOString(), count: 0,
        message: "Content was saved, but its indexing notification could not be prepared. Retry from Marketing & SEO." });
    }
  });
}
