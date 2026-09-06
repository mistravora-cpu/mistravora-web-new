"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/track-event";
import { captureAttribution } from "@/lib/attribution";
import { subscribeConsent, getConsentSnapshot } from "@/lib/consent";

// Keep one callback identity across renders and client-side navigations.
// Next's hook registers observers again whenever this reference changes.
const reportWebVitals: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  trackEvent("web_vital", {
    metric_name: metric.name,
    value: metric.value,
    metric_id: metric.id,
    rating: metric.rating,
  });
};

export function MarketingEvents() {
  const pathname = usePathname();
  const lastPage = useRef("");
  useReportWebVitals(reportWebVitals);
  useEffect(() => {
    const page = () => {
      captureAttribution();
      if (!getConsentSnapshot()?.analytics || lastPage.current === pathname)
        return;
      lastPage.current = pathname;
      trackEvent("content_view", {
        page_path: pathname,
        page_type: pathname.split("/")[1] || "home",
      });
      if (pathname === "/pricing") trackEvent("pricing_viewed");
      if (pathname.startsWith("/projects/"))
        trackEvent("case_study_viewed", { page_path: pathname });
    };
    page();
    return subscribeConsent(page);
  }, [pathname]);
  useEffect(() => {
    const started = new WeakSet<HTMLFormElement>();
    const onFocus = (event: FocusEvent) => {
      const form = (event.target as HTMLElement).closest("form");
      if (!form || started.has(form)) return;
      started.add(form);
      trackEvent("form_start", {
        form_name: form.dataset.formName ?? "public_form",
        page_path: pathname,
      });
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      const name =
        link.dataset.event ??
        (url.protocol === "tel:"
          ? "phone_click"
          : url.protocol === "mailto:"
            ? "email_click"
            : ["wa.me", "api.whatsapp.com"].includes(url.hostname)
              ? "whatsapp_click"
              : url.origin !== window.location.origin
                ? "external_link"
                : ["/contact", "/book"].includes(url.pathname)
                  ? "cta_click"
                  : null);
      // Do not transmit phone numbers, email addresses, search queries, or form values.
      if (name)
        trackEvent(name, {
          page_path: pathname,
          destination:
            url.protocol === "https:" || url.protocol === "http:"
              ? url.hostname + url.pathname
              : url.protocol,
        });
    };
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocus);
    };
  }, [pathname]);
  return null;
}
