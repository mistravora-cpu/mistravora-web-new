"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── Admin RBAC ────────────────────────────────────────────────────────
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  return !!adminRecord;
}

// ─── Table allowlist ───────────────────────────────────────────────────
// Prevents arbitrary table access via server actions — even a compromised
// admin session can only mutate these explicitly-allowed tables.
const ALLOWED_TABLES = new Set([
  // Parent content tables
  "solutions",
  "case_studies",
  "posts",
  "jobs",
  "hero_sections",
  "value_cards",
  "statistics",
  "core_values",
  "team_members",
  "pricing_tiers",
  "pricing_notes",
  "pricing_addons",
  "industries",
  "resources",
  "trusted_companies",
  "policies",
  "contact_info",
  "social_media",
  "faqs",
  "demo_apps",
  "tech_stack",
  "benefits",
  "testimonials",
  "media_library",
  "research",
  // Child tables (normalized arrays)
  "solution_features",
  "solution_technologies",
  "solution_services",
  "solution_process_steps",
  "solution_pricing_packages",
  "solution_pricing_package_features",
  "case_study_results",
  "case_study_technologies",
  "post_tags",
  "industry_challenges",
  "industry_solutions",
  "pricing_tier_features",
  "demo_app_features",
  "research_tags",
  "solution_demo_links",
  // AI discovery tables
  "authors",
  "glossary_terms",
  "knowledge_base",
  "knowledge_base_tags",
  "services",
  "service_features",
  "service_technologies",
  "service_faqs",
]);

function isAllowedTable(table: string): boolean {
  return ALLOWED_TABLES.has(table);
}

// ─── Server actions ────────────────────────────────────────────────────
export async function upsertRow(
  table: string,
  data: Record<string, unknown>,
  id?: string
) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  if (!isAllowedTable(table)) return { error: "Invalid table" };

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase
      .from(table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from(table).insert(data);
    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("public-data", { expire: 0 });
  return { error: null };
}

export async function deleteRow(table: string, id: string) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  if (!isAllowedTable(table)) return { error: "Invalid table" };

  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("public-data", { expire: 0 });
  return { error: null };
}

// Allowed setting keys — prevents arbitrary key injection.
const ALLOWED_SETTING_KEYS = new Set([
  // Marketing — analytics
  "gtm_container_id",
  "ga4_measurement_id",
  "clarity_id",
  "hotjar_id",
  "logrocket_id",
  "sentry_dsn",
  // Marketing — advertising
  "meta_pixel_id",
  "meta_capi_token",
  "facebook_app_id",
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
  // Marketing — social
  "messenger_url",
  "telegram_url",
  "twitter_handle",
  "twitter_creator",
  "default_og_image",
  // SEO verification
  "google_search_console_verification",
  "bing_webmaster_verification",
  "yandex_verification",
  "baidu_verification",
  "pinterest_verification",
  "facebook_domain_verification",
  // Site settings
  "site_name",
  "site_tagline",
  "site_title",
  "site_email",
  "site_phone",
  "site_address",
  "site_whatsapp",
  "site_geo_lat",
  "site_geo_lng",
  "footer_text",
  "business_hours",
  "timezone",
  "show_business_hours",
  "enable_chat_widget",
  "enable_cookie_consent",
  "enable_newsletter",
  "pwa_theme_color",
  "pwa_background_color",
]);

export async function saveSettings(data: Record<string, string>) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };

  // Filter to only allowed keys — reject arbitrary key injection.
  const filtered = Object.entries(data).filter(([key]) =>
    ALLOWED_SETTING_KEYS.has(key)
  );
  if (filtered.length === 0) return { error: "No valid settings keys" };

  const supabase = await createClient();
  const updates = filtered.map(([key, value]) =>
    supabase
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" })
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) return { error: firstError.error.message };
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidateTag("public-data", { expire: 0 });
  return { error: null };
}
