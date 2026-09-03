import { getMarketingSettings } from "@/lib/services";

/**
 * GTM noscript iframe — rendered immediately after the opening <body> tag.
 * This is the second part of the Google Tag Manager installation.
 * The first part (the <script> in <head>) is handled by MarketingTags.
 */
export async function GtmNoscript() {
  const m = await getMarketingSettings();

  if (!m.gtm_container_id) return null;

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${m.gtm_container_id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="gtm"
      />
    </noscript>
  );
}
