import { getMarketingSettings } from "@/lib/services";
import { ConsentGatedScript } from "@/components/consent-gated-script";
import { MarketingEvents } from "@/components/marketing-events";

/** Only explicitly enabled, supported providers; never load tags in the admin. */
export async function MarketingTags() {
  const settings = await getMarketingSettings();
  if (settings.enable_optional_tracking !== "true") return null;
  const m = {
    ga4: /^G-[A-Z0-9]+$/.test(settings.ga4_measurement_id) ? settings.ga4_measurement_id : "",
    ads: /^AW-\d+$/.test(settings.google_ads_conversion_id) ? settings.google_ads_conversion_id : "",
    label: /^[A-Za-z0-9_-]+$/.test(settings.google_ads_conversion_label) ? settings.google_ads_conversion_label : "",
  };
  if (!m.ga4 && !m.ads) return null;
  return <>
    {m.ga4 && <>
      <ConsentGatedScript category="analytics" id="ga4-src" src={`https://www.googletagmanager.com/gtag/js?id=${m.ga4}`} />
      <ConsentGatedScript category="analytics" id="ga4">{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());window.mistravoraAnalyticsTarget='${m.ga4}';gtag('config','${m.ga4}',{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,cookie_update:false,page_location:location.origin+location.pathname});window.dispatchEvent(new Event('mistravora:tracking-ready'));`}</ConsentGatedScript>
    </>}
    {m.ads && <>
      <ConsentGatedScript category="marketing" id="google-ads-src" src={`https://www.googletagmanager.com/gtag/js?id=${m.ads}`} />
      <ConsentGatedScript category="marketing" id="google-ads">{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${m.ads}',{allow_enhanced_conversions:false,page_location:location.origin+location.pathname});window.mistravoraAdsTarget='${m.label ? m.ads + '/' + m.label : ''}';`}</ConsentGatedScript>
    </>}
    <MarketingEvents />
  </>;
}
