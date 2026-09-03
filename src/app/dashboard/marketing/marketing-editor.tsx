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
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveSettings } from "../crud-actions";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password";
  help?: string;
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
      {
        key: "ga4_measurement_id",
        label: "GA4 Measurement ID",
        placeholder: "G-XXXXXXXXXX",
        help: "In Google Analytics → Admin → Data Streams → click your stream → find 'Measurement ID' (starts with G-). The full code block is generated automatically — just paste the ID.",
      },
      {
        key: "gtm_container_id",
        label: "GTM Container ID",
        placeholder: "GTM-XXXXXXX",
        help: "In Google Tag Manager → Admin → click your container → find 'Container ID' (starts with GTM-). Only use GTM if you want to manage all tags through it instead of individually.",
      },
      {
        key: "clarity_id",
        label: "Microsoft Clarity ID",
        placeholder: "abcdef1234",
        help: "In Clarity → your project → Setup → find the 'id' value inside the code block. It looks like: clarity('init', 'YOUR_ID_HERE'). Just paste that ID string.",
      },
      {
        key: "hotjar_id",
        label: "Hotjar Site ID",
        placeholder: "1234567",
        help: "In Hotjar → Settings → Site Setup → find 'Site ID' (a number). The full script is generated automatically.",
      },
      {
        key: "sentry_dsn",
        label: "Sentry DSN",
        placeholder: "https://xxx@sentry.io/123",
        help: "In Sentry → Project Settings → Client Keys (DSN) → copy the DSN URL.",
      },
      {
        key: "logrocket_id",
        label: "LogRocket ID",
        placeholder: "xxxxx/yyyyy",
        help: "In LogRocket → Settings → Setup → find your App ID (format: org/appname).",
      },
    ],
  },
  {
    label: "Meta (Facebook)",
    icon: Megaphone,
    fields: [
      {
        key: "meta_pixel_id",
        label: "Meta Pixel ID",
        placeholder: "123456789012345",
        help: "In Meta Events Manager → Data Sources → your pixel → find the Pixel ID (a long number). The full pixel code is generated automatically.",
      },
      {
        key: "meta_capi_token",
        label: "Conversions API Token",
        type: "password",
        help: "In Meta Events Manager → Settings → Conversions API → Generate access token. This is optional — only needed for server-side event matching.",
      },
    ],
  },
  {
    label: "Google Ads",
    icon: Globe,
    fields: [
      {
        key: "google_ads_conversion_id",
        label: "Google Ads Conversion ID",
        placeholder: "AW-XXXXXXXXX",
        help: "In Google Ads → Tools → Conversions → click your conversion → find 'Tag ID' (starts with AW-). The full gtag script is generated automatically.",
      },
      {
        key: "google_ads_conversion_label",
        label: "Conversion Label",
        placeholder: "abcDEF123",
        help: "In Google Ads → Tools → Conversions → your conversion → find 'Label' (a string like abcDEF123). Optional — only needed for specific conversion tracking.",
      },
      {
        key: "google_remarketing_tag_id",
        label: "Remarketing Tag ID",
        placeholder: "AW-XXXXXXXXX",
        help: "In Google Ads → Tools → Audience Manager → your audience source → find the Tag ID (starts with AW-).",
      },
    ],
  },
  {
    label: "Microsoft",
    icon: Monitor,
    fields: [
      {
        key: "microsoft_uet_tag_id",
        label: "UET Tag ID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        help: "In Microsoft Ads → Tools → UET tags → find your tag's 'Tag ID' (a UUID). The full UET script is generated automatically.",
      },
    ],
  },
  {
    label: "LinkedIn",
    icon: Share2,
    fields: [
      {
        key: "linkedin_insight_tag_id",
        label: "Insight Tag Partner ID",
        placeholder: "1234567",
        help: "In LinkedIn Campaign Manager → Account Assets → Insight Tag → find 'Partner ID' (a number). The full script is generated automatically.",
      },
    ],
  },
  {
    label: "TikTok",
    icon: Music2,
    fields: [
      {
        key: "tiktok_pixel_id",
        label: "TikTok Pixel ID",
        placeholder: "XXXXXXXXXXXXXXX",
        help: "In TikTok Ads Manager → Assets → Events → Web Events → find your Pixel ID. The full pixel code is generated automatically.",
      },
    ],
  },
  {
    label: "Pinterest",
    icon: Pin,
    fields: [
      {
        key: "pinterest_tag_id",
        label: "Pinterest Tag ID",
        placeholder: "1234567890123",
        help: "In Pinterest Ads → Ads Manager → Conversions → find your Tag ID (a long number). The full tag code is generated automatically.",
      },
    ],
  },
  {
    label: "Reddit",
    icon: MessageSquare,
    fields: [
      {
        key: "reddit_pixel_id",
        label: "Reddit Pixel ID",
        placeholder: "t2_xxxxx",
        help: "In Reddit Ads → Account → Events → Pixel → find your Pixel ID (starts with t2_). The full pixel code is generated automatically.",
      },
    ],
  },
  {
    label: "Snapchat",
    icon: Camera,
    fields: [
      {
        key: "snap_pixel_id",
        label: "Snap Pixel ID",
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        help: "In Snapchat Ads Manager → Events Manager → find your Pixel ID (a UUID). The full pixel code is generated automatically.",
      },
    ],
  },
  {
    label: "X (Twitter)",
    icon: Share2,
    fields: [
      {
        key: "x_pixel_id",
        label: "X Pixel ID",
        placeholder: "xxxxx",
        help: "In X Ads → Tools → Events Manager → find your Pixel ID. The full pixel code is generated automatically.",
      },
    ],
  },
  {
    label: "Search Engine Verification",
    icon: ShieldCheck,
    fields: [
      {
        key: "google_search_console_verification",
        label: "Google Search Console",
        placeholder: "google-site-verification code",
        help: "In Google Search Console → Settings → Verification methods → HTML tag → copy ONLY the content value inside content='...'. Do NOT paste the full meta tag — just the code string. The meta tag is generated automatically.",
      },
      {
        key: "bing_webmaster_verification",
        label: "Bing Webmaster",
        placeholder: "msvalidate.01 code",
        help: "In Bing Webmaster Tools → Settings → Site verification → copy ONLY the content value. The meta tag is generated automatically.",
      },
      {
        key: "yandex_verification",
        label: "Yandex",
        placeholder: "yandex-verification code",
        help: "In Yandex Webmaster → copy ONLY the verification code string. The meta tag is generated automatically.",
      },
      {
        key: "baidu_verification",
        label: "Baidu",
        placeholder: "baidu-site-verification code",
        help: "In Baidu Webmaster Tools → copy ONLY the verification code. The meta tag is generated automatically.",
      },
      {
        key: "pinterest_verification",
        label: "Pinterest",
        placeholder: "p:domain_verify code",
        help: "In Pinterest → Settings → Claim your website → copy ONLY the code value. The meta tag is generated automatically.",
      },
      {
        key: "facebook_domain_verification",
        label: "Facebook Domain",
        placeholder: "facebook-domain-verification code",
        help: "In Meta Business → Brand Safety → Domains → copy ONLY the verification code. The meta tag is generated automatically.",
      },
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
  const [showHelp, setShowHelp] = React.useState<Set<string>>(new Set());

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleHelp(key: string) {
    setShowHelp((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <HelpCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm leading-6 text-muted-foreground">
          <p className="font-medium text-foreground">You only need to paste the ID — not the full code block.</p>
          <p className="mt-1">
            Each platform gives you a code snippet, but inside that snippet is an ID.
            Extract just the ID and paste it here. The full script code is generated
            and injected automatically into your site. Click the{" "}
            <HelpCircle className="inline h-3.5 w-3.5" /> icon next to each field for
            step-by-step instructions.
          </p>
        </div>
      </div>

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
                  const isHelpOpen = showHelp.has(field.key);
                  return (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor={field.key} className="text-xs font-medium text-muted-foreground">
                          {field.label}
                        </label>
                        <div className="flex items-center gap-2">
                          {field.help ? (
                            <button
                              type="button"
                              onClick={() => toggleHelp(field.key)}
                              aria-label={`Help for ${field.label}`}
                              className="text-muted-foreground/60 transition-colors hover:text-primary"
                            >
                              <HelpCircle aria-hidden className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
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
                      </div>
                      <input
                        id={field.key}
                        type={field.type ?? "text"}
                        value={value}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder ?? ""}
                        className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      {field.help && isHelpOpen ? (
                        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
                          {field.help}
                        </p>
                      ) : null}
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
