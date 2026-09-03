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

// ─── Child table relationships ─────────────────────────────────────────
// Maps parent table + field name → child table + foreign key column + value column.
// When a "list" field is saved, these entries tell upsertRow to:
//   1. Strip the field from the parent row data
//   2. Sync the values into the child table (delete old, insert new)
const CHILD_TABLES: Record<string, Record<string, {
  childTable: string;
  fkColumn: string;
  valueColumn: string;
}>> = {
  case_studies: {
    results: { childTable: "case_study_results", fkColumn: "case_study_id", valueColumn: "result" },
    technologies: { childTable: "case_study_technologies", fkColumn: "case_study_id", valueColumn: "technology" },
  },
  solutions: {
    features: { childTable: "solution_features", fkColumn: "solution_id", valueColumn: "feature" },
    technologies: { childTable: "solution_technologies", fkColumn: "solution_id", valueColumn: "technology" },
    services: { childTable: "solution_services", fkColumn: "solution_id", valueColumn: "service_name" },
    process_steps: { childTable: "solution_process_steps", fkColumn: "solution_id", valueColumn: "step" },
  },
  posts: {
    tags: { childTable: "post_tags", fkColumn: "post_id", valueColumn: "tag" },
  },
  industries: {
    challenges: { childTable: "industry_challenges", fkColumn: "industry_id", valueColumn: "challenge" },
    solutions: { childTable: "industry_solutions", fkColumn: "industry_id", valueColumn: "solution" },
  },
  pricing_tiers: {
    features: { childTable: "pricing_tier_features", fkColumn: "pricing_tier_id", valueColumn: "feature" },
  },
  demo_apps: {
    features: { childTable: "demo_app_features", fkColumn: "demo_app_id", valueColumn: "feature" },
  },
  research: {
    tags: { childTable: "research_tags", fkColumn: "research_id", valueColumn: "tag" },
  },
};

// Fields that are "list" type but are NOT child tables — they're real array columns
// or text columns on the parent. These should be saved directly to the parent.
// (Currently none — all list fields map to child tables.)

// ─── Server actions ────────────────────────────────────────────────────
export async function upsertRow(
  table: string,
  data: Record<string, unknown>,
  id?: string
) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" };
  if (!isAllowedTable(table)) return { error: "Invalid table" };

  const supabase = await createClient();

  // Separate child table data from parent table data.
  // Child table fields (type "list" with a mapping in CHILD_TABLES) are
  // stripped from the parent row and synced into their child tables after
  // the parent row is saved.
  const childMap = CHILD_TABLES[table] ?? {};
  const parentData: Record<string, unknown> = {};
  const childData: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(data)) {
    if (childMap[key]) {
      // This is a child table field — extract it
      childData[key] = Array.isArray(value)
        ? (value as string[])
        : typeof value === "string"
          ? value.split("\n").map((s) => s.trim()).filter(Boolean)
          : [];
    } else {
      parentData[key] = value;
    }
  }

  let parentId: string | undefined = id;

  // Save parent row
  if (id) {
    const { error } = await supabase
      .from(table)
      .update({ ...parentData, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(parentData)
      .select("id")
      .single();
    if (error) return { error: error.message };
    parentId = inserted?.id;
  }

  // Sync child tables
  if (parentId && Object.keys(childData).length > 0) {
    for (const [field, values] of Object.entries(childData)) {
      const config = childMap[field];
      if (!config) continue;

      // Delete existing child rows
      const { error: delError } = await supabase
        .from(config.childTable)
        .delete()
        .eq(config.fkColumn, parentId);
      if (delError) return { error: delError.message };

      // Insert new child rows
      if (values.length > 0) {
        const rows = values.map((v, i) => ({
          [config.fkColumn]: parentId,
          [config.valueColumn]: v,
          sort_order: i,
        }));
        const { error: insertError } = await supabase
          .from(config.childTable)
          .insert(rows);
        if (insertError) return { error: insertError.message };
      }
    }
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
