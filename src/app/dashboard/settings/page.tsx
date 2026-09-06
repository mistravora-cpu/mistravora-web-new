import type { Metadata } from "next";
import { getAdminSettings as getSettings } from "@/lib/services";
import { SettingsEditor } from "./settings-editor";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

const groups = [
  {
    label: "General Settings",
    fields: [
      { key: "site_name", label: "Site Name" },
      { key: "site_tagline", label: "Site Tagline" },
      { key: "site_title", label: "Site Title (SEO)" },
      { key: "footer_text", label: "Footer Text" },
      { key: "business_hours", label: "Business Hours" },
      { key: "timezone", label: "Timezone", placeholder: "Asia/Colombo" },
    ],
  },
  {
    label: "Business profile",
    fields: [
      { key: "site_headline", label: "Homepage headline" },
      { key: "site_intro", label: "Short public introduction", type: "textarea" as const },
      { key: "site_description", label: "Company positioning", type: "textarea" as const },
      { key: "company_founder", label: "Founder" },
      { key: "company_cofounder", label: "Co-Founder" },
      { key: "company_founded", label: "Founded (YYYY-MM)" },
      { key: "company_story", label: "Company story", type: "textarea" as const },
      { key: "service_coverage", label: "Markets and locations served", type: "textarea" as const },
      { key: "customer_types", label: "Customer types", type: "textarea" as const },
      { key: "industry_coverage", label: "Industries served", type: "textarea" as const },
      { key: "response_expectation", label: "Response expectation" },
      { key: "core_offering", label: "Core offerings (one per line)", type: "textarea" as const },
    ],
  },
  {
    label: "Features",
    fields: [
      { key: "show_business_hours", label: "Show Business Hours", type: "boolean" as const },
      { key: "enable_cookie_consent", label: "Cookie Consent", type: "boolean" as const },
      { key: "enable_newsletter", label: "Newsletter", type: "boolean" as const },
      { key: "enable_chat_widget", label: "Chat Widget", type: "boolean" as const },
    ],
  },
  {
    label: "Geo Location",
    fields: [
      { key: "site_geo_lat", label: "Latitude", placeholder: "6.9271" },
      { key: "site_geo_lng", label: "Longitude", placeholder: "79.8612" },
    ],
  },
];

export default async function SettingsAdminPage() {
  const settings = await getSettings();
  const settingsMap = new Map(settings.map((s) => [s.key, s.value ?? ""]));
  const initialData: Record<string, string> = {};
  for (const group of groups) {
    for (const field of group.fields) {
      initialData[field.key] = settingsMap.get(field.key) ?? "";
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage the public business profile. Contact details are managed under Contact. Changes refresh cached public content.
        </p>
      </div>
      <SettingsEditor groups={groups} initialData={initialData} />
    </div>
  );
}
