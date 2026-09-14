"use client";

import { getConsentSnapshot } from "@/lib/consent";

type EventParams = {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    mistravoraAnalyticsTarget?: string;
    mistravoraAdsTarget?: string;
  }
}

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === "undefined" || window.location?.pathname.startsWith("/dashboard")) return;
  const consent = getConsentSnapshot();
  if (eventName === "generate_lead" && consent?.marketing && window.gtag && /^AW-\d+\/[A-Za-z0-9_-]+$/.test(window.mistravoraAdsTarget ?? "")) {
    window.gtag("event", "conversion", {send_to: window.mistravoraAdsTarget, page_location: window.location.origin + window.location.pathname});
  }
  if (!consent?.analytics || !window.mistravoraAnalyticsTarget || !window.gtag) return;
  window.gtag("event", eventName, {...params, page_location: window.location.origin + window.location.pathname, send_to: window.mistravoraAnalyticsTarget});
}

export function trackButtonClick(buttonName: string, section?: string) {
  trackEvent("admin_button_click", {
    event_category: "admin_interaction",
    event_label: buttonName,
    section: section ?? "unknown",
  });
}
