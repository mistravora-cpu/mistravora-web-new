"use client";
import { getConsentSnapshot } from "@/lib/consent";
const KEY = "mistravora-attribution";
const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
export function captureAttribution() {
  if (!getConsentSnapshot()?.analytics) { try { sessionStorage.removeItem(KEY); } catch {} return; }
  try {
    const url = new URL(window.location.href);
    const campaign = Object.fromEntries(campaignKeys.map(key => [key, (url.searchParams.get(key) ?? "").slice(0, 100)]).filter(([, value]) => value));
    const previous = sessionStorage.getItem(KEY);
    if (previous && !Object.keys(campaign).length) return;
    const touch = { landing_page: url.pathname, referrer: document.referrer ? new URL(document.referrer).hostname : "direct", ...campaign };
    const first = previous ? JSON.parse(previous).first : touch;
    sessionStorage.setItem(KEY, JSON.stringify({ first, last: touch }));
  } catch { /* Attribution is optional; navigation must always work. */ }
}
export function getAttribution(): string {
  if (!getConsentSnapshot()?.analytics) return "";
  try { return sessionStorage.getItem(KEY) ?? ""; } catch { return ""; }
}
