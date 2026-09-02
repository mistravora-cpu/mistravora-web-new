"use client";

import * as React from "react";
import {
  Globe,
  Monitor,
  Music2,
  Pin,
  MessageSquare,
  Camera,
  Share2,
  Megaphone,
  Activity,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveSettings } from "../crud-actions";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password";
};

type GroupDef = {
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  fields: FieldDef[];
};

const groups: GroupDef[] = [
  {
    label: "Analytics & Monitoring",
    icon: Activity,
    fields: [
      { key: "ga4_measurement_id", label: "GA4 Measurement ID", placeholder: "G-XXXXXXXXXX" },
      { key: "gtm_container_id", label: "GTM Container ID", placeholder: "GTM-XXXXXXX" },
      { key: "clarity_id", label: "Microsoft Clarity ID", placeholder: "abcdef1234" },
      { key: "hotjar_id", label: "Hotjar Site ID", placeholder: "1234567" },
      { key: "sentry_dsn", label: "Sentry DSN", placeholder: "https://xxx@sentry.io/123" },
      { key: "logrocket_id", label: "LogRocket ID", placeholder: "xxxxx/yyyyy" },
    ],
  },
  {
    label: "Meta (Facebook)",
    icon: Megaphone,
    fields: [
      { key: "meta_pixel_id", label: "Meta Pixel ID", placeholder: "123456789012345" },
      { key: "meta_capi_token", label: "Conversions API Token", type: "password" },
    ],
  },
  {
    label: "Google Ads",
    icon: Globe,
    fields: [
      { key: "google_ads_conversion_id", label: "Google Ads Conversion ID", placeholder: "AW-XXXXXXXXX" },
      { key: "google_ads_conversion_label", label: "Conversion Label", placeholder: "abcDEF123" },
      { key: "google_remarketing_tag_id", label: "Remarketing Tag ID", placeholder: "AW-XXXXXXXXX" },
    ],
  },
  {
    label: "Microsoft",
    icon: Monitor,
    fields: [
      { key: "microsoft_uet_tag_id", label: "UET Tag ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
    ],
  },
  {
    label: "LinkedIn",
    icon: Share2,
    fields: [
      { key: "linkedin_insight_tag_id", label: "Insight Tag Partner ID", placeholder: "1234567" },
    ],
  },
  {
    label: "TikTok",
    icon: Music2,
    fields: [
      { key: "tiktok_pixel_id", label: "TikTok Pixel ID", placeholder: "XXXXXXXXXXXXXXX" },
    ],
  },
  {
    label: "Pinterest",
    icon: Pin,
    fields: [
      { key: "pinterest_tag_id", label: "Pinterest Tag ID", placeholder: "1234567890123" },
    ],
  },
  {
    label: "Reddit",
    icon: MessageSquare,
    fields: [
      { key: "reddit_pixel_id", label: "Reddit Pixel ID", placeholder: "t2_xxxxx" },
    ],
  },
  {
    label: "Snapchat",
    icon: Camera,
    fields: [
      { key: "snap_pixel_id", label: "Snap Pixel ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
    ],
  },
  {
    label: "X (Twitter)",
    icon: Share2,
    fields: [
      { key: "x_pixel_id", label: "X Pixel ID", placeholder: "xxxxx" },
    ],
  },
  {
    label: "Search Engine Verification",
    icon: ShieldCheck,
    fields: [
      { key: "google_search_console_verification", label: "Google Search Console", placeholder: "google-site-verification code" },
      { key: "bing_webmaster_verification", label: "Bing Webmaster", placeholder: "msvalidate.01 code" },
      { key: "yandex_verification", label: "Yandex", placeholder: "yandex-verification code" },
      { key: "baidu_verification", label: "Baidu", placeholder: "baidu-site-verification code" },
      { key: "pinterest_verification", label: "Pinterest", placeholder: "p:domain_verify code" },
      { key: "facebook_domain_verification", label: "Facebook Domain", placeholder: "facebook-domain-verification code" },
    ],
  },
  {
    label: "SEO & Social Defaults",
    icon: Globe,
    fields: [
      { key: "default_og_image", label: "Default OG Image URL", placeholder: "https://..." },
      { key: "twitter_handle", label: "Twitter Handle", placeholder: "@mistravora" },
      { key: "twitter_creator", label: "Twitter Creator", placeholder: "@username" },
      { key: "facebook_app_id", label: "Facebook App ID", placeholder: "1234567890" },
      { key: "telegram_url", label: "Telegram URL", placeholder: "https://t.me/..." },
      { key: "messenger_url", label: "Messenger URL", placeholder: "https://m.me/..." },
    ],
  },
];

type Props = {
  initialData: Record<string, string>;
};

export function MarketingEditor({ initialData }: Props) {
  const [values, setValues] = React.useState<Record<string, string>>(initialData);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await saveSettings(values);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.label}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-semibold">{group.label}</h2>
              </div>

              <div className="flex flex-col gap-3">
                {group.fields.map((field) => {
                  const value = values[field.key] ?? "";
                  const isSet = value.length > 0;
                  return (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor={field.key} className="text-xs font-medium text-muted-foreground">
                          {field.label}
                        </label>
                        <span
                          className={
                            isSet
                              ? "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                              : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          }
                        >
                          {isSet ? "Active" : "Not set"}
                        </span>
                      </div>
                      <input
                        id={field.key}
                        type={field.type ?? "text"}
                        value={value}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder ?? ""}
                        className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Check aria-hidden className="h-4 w-4" />
          {saving ? "Saving…" : "Save All Marketing Settings"}
        </Button>
        {saved ? (
          <span className="text-sm text-primary">Saved successfully!</span>
        ) : null}
      </div>
    </div>
  );
}
