"use client";

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
  }
}

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("event", eventName, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({ event: eventName, ...params });
  }
}

export function trackButtonClick(buttonName: string, section?: string) {
  trackEvent("admin_button_click", {
    event_category: "admin_interaction",
    event_label: buttonName,
    section: section ?? "unknown",
  });
}
