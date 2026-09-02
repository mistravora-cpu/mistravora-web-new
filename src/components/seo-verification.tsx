import { getMarketingSettings } from "@/lib/services";

export async function SeoVerification() {
  const m = await getMarketingSettings();

  return (
    <>
      {m.google_search_console_verification ? (
        <meta
          name="google-site-verification"
          content={m.google_search_console_verification}
        />
      ) : null}
      {m.bing_webmaster_verification ? (
        <meta
          name="msvalidate.01"
          content={m.bing_webmaster_verification}
        />
      ) : null}
      {m.yandex_verification ? (
        <meta name="yandex-verification" content={m.yandex_verification} />
      ) : null}
      {m.baidu_verification ? (
        <meta name="baidu-site-verification" content={m.baidu_verification} />
      ) : null}
      {m.pinterest_verification ? (
        <meta name="p:domain_verify" content={m.pinterest_verification} />
      ) : null}
      {m.facebook_domain_verification ? (
        <meta name="facebook-domain-verification" content={m.facebook_domain_verification} />
      ) : null}
    </>
  );
}
