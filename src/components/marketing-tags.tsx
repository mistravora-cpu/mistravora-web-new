import { getMarketingSettings } from "@/lib/services";
import { ConsentGatedScript } from "@/components/consent-gated-script";

/** Load configured marketing tags after the relevant consent choice. */
export async function MarketingTags() {
  const settings = await getMarketingSettings();
  const m = { ...settings, ga4_measurement_id: settings.ga4_measurement_id || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, clarity_id: settings.clarity_id || process.env.NEXT_PUBLIC_CLARITY_ID };

  return (
    <>
      {/* GTM also waits for a visitor’s consent. */}
      {m.gtm_container_id ? <ConsentGatedScript category="analytics" id="gtm">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;d.head.appendChild(j);})(window,document,'script','dataLayer','${m.gtm_container_id}');`}</ConsentGatedScript> : null}

      {/* GA4 (if no GTM) — analytics category */}
      {!m.gtm_container_id && m.ga4_measurement_id ? (
        <>
          <ConsentGatedScript category="analytics" id="ga4-src" src={`https://www.googletagmanager.com/gtag/js?id=${m.ga4_measurement_id}`} />
          <ConsentGatedScript category="analytics" id="ga4">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${m.ga4_measurement_id}');`}
          </ConsentGatedScript>
        </>
      ) : null}

      {/* Microsoft Clarity — analytics category */}
      {m.clarity_id ? (
        <ConsentGatedScript category="analytics" id="clarity">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${m.clarity_id}");`}
        </ConsentGatedScript>
      ) : null}

      {/* Hotjar — analytics category */}
      {m.hotjar_id ? (
        <ConsentGatedScript category="analytics" id="hotjar">
          {`(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${m.hotjar_id},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </ConsentGatedScript>
      ) : null}

      {/* Meta Pixel — marketing category */}
      {m.meta_pixel_id ? (
        <ConsentGatedScript category="marketing" id="meta-pixel">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${m.meta_pixel_id}');fbq('track','PageView');`}
        </ConsentGatedScript>
      ) : null}

      {/* Google Ads Conversion — marketing category */}
      {m.google_ads_conversion_id ? (
        <ConsentGatedScript
          category="marketing"
          src={`https://www.googletagmanager.com/gtag/js?id=${m.google_ads_conversion_id}`}
          id="google-ads-src"
        />
      ) : null}
      {m.google_ads_conversion_id ? (
        <ConsentGatedScript category="marketing" id="google-ads">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${m.google_ads_conversion_id}'${m.google_ads_conversion_label ? `,{'send_to':'${m.google_ads_conversion_id}/${m.google_ads_conversion_label}'}` : ""});`}
        </ConsentGatedScript>
      ) : null}

      {/* Google Remarketing — marketing category */}
      {m.google_remarketing_tag_id ? (
        <ConsentGatedScript category="marketing" id="google-remarketing">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${m.google_remarketing_tag_id}');`}
        </ConsentGatedScript>
      ) : null}

      {/* Microsoft UET — marketing category */}
      {m.microsoft_uet_tag_id ? (
        <ConsentGatedScript category="marketing" id="microsoft-uet">
          {`(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${m.microsoft_uet_tag_id}"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");`}
        </ConsentGatedScript>
      ) : null}

      {/* LinkedIn Insight Tag — marketing category */}
      {m.linkedin_insight_tag_id ? (
        <ConsentGatedScript category="marketing" id="linkedin-insight">
          {`var _linkedin_partner_id="${m.linkedin_insight_tag_id}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`}
        </ConsentGatedScript>
      ) : null}

      {/* TikTok Pixel — marketing category */}
      {m.tiktok_pixel_id ? (
        <ConsentGatedScript category="marketing" id="tiktok-pixel">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${m.tiktok_pixel_id}');ttq.page()}(window,document,'ttq');`}
        </ConsentGatedScript>
      ) : null}

      {/* Pinterest Tag — marketing category */}
      {m.pinterest_tag_id ? (
        <ConsentGatedScript category="marketing" id="pinterest-tag">
          {`!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${m.pinterest_tag_id}');pintrk('page');`}
        </ConsentGatedScript>
      ) : null}

      {/* Reddit Pixel — marketing category */}
      {m.reddit_pixel_id ? (
        <ConsentGatedScript category="marketing" id="reddit-pixel">
          {`!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','${m.reddit_pixel_id}');rdt('track','PageVisit');`}
        </ConsentGatedScript>
      ) : null}

      {/* Snap Pixel — marketing category */}
      {m.snap_pixel_id ? (
        <ConsentGatedScript category="marketing" id="snap-pixel">
          {`(function(w,d){if(w.snaptr)return;var q=w.snaptr=function(){q.handleRequest?q.handleRequest.apply(q,arguments):q.queue.push(arguments)};q.queue=[];var s=d.createElement('script');s.async=true;s.src='https://sc-static.net/scevent.min.js';d.head.appendChild(s)})(window,document);snaptr('init','${m.snap_pixel_id}');snaptr('track','PAGE_VIEW');`}
        </ConsentGatedScript>
      ) : null}

      {/* X Pixel — marketing category */}
      {m.x_pixel_id ? (
        <ConsentGatedScript category="marketing" id="x-pixel">
          {`!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments)},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');twq('init','${m.x_pixel_id}');twq('track','PageView');`}
        </ConsentGatedScript>
      ) : null}
    </>
  );
}
