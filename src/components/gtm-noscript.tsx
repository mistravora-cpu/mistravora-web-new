import { getMarketingSettings } from "@/lib/services";

/**
 * GTM noscript iframe — rendered immediately after the opening <body> tag.
 * Uses dangerouslySetInnerHTML to avoid React hydration issues with
 * <noscript> content during streaming.
 */
export async function GtmNoscript() {
  const m = await getMarketingSettings();

  if (!m.gtm_container_id) return null;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${m.gtm_container_id}" height="0" width="0" style="display:none;visibility:hidden" title="gtm"></iframe></noscript>`,
      }}
    />
  );
}
