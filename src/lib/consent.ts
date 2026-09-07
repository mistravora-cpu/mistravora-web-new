"use client";

const CONSENT_KEY = "mistravora-consent";
export const CONSENT_VERSION = 3;

export type ConsentChoice = {
  version: number;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
};

type Consent = ConsentChoice | null;

export function isCurrentConsent(value: unknown): value is ConsentChoice {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    (value as ConsentChoice).version === CONSENT_VERSION &&
    typeof (value as ConsentChoice).analytics === "boolean" &&
    typeof (value as ConsentChoice).marketing === "boolean" &&
    Number.isFinite(Date.parse((value as ConsentChoice).timestamp)) &&
    Date.now() - Date.parse((value as ConsentChoice).timestamp) >= 0 &&
    Date.now() - Date.parse((value as ConsentChoice).timestamp) < 180 * 24 * 60 * 60 * 1000
  );
}

function loadConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    if (raw === "accepted" || raw === "declined") return null;
    const parsed: unknown = JSON.parse(raw);
    return isCurrentConsent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
  } catch {
    // Keep the in-memory choice when browser storage is unavailable.
  }
}

/* ── Consent store (module-level, used with useSyncExternalStore) ── */
let storedConsent: Consent = null;
const consentListeners = new Set<() => void>();

if (typeof window !== "undefined") {
  storedConsent = loadConsent();
}

export function subscribeConsent(cb: () => void) {
  consentListeners.add(cb);
  return () => {
    consentListeners.delete(cb);
  };
}

export function getConsentSnapshot(): Consent {
  return storedConsent;
}

export function getConsentSSR(): Consent {
  return null;
}

export function setConsentValue(value: Consent) {
  storedConsent = value;
  updateGoogleConsent(value);
  consentListeners.forEach((l) => l());
}

function updateGoogleConsent(consent: Consent) {
  if (typeof window === "undefined") return;
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => { window.dataLayer!.push(args); };
  window.gtag("consent", "update", {
    analytics_storage: consent?.analytics ? "granted" : "denied",
    ad_storage: consent?.marketing ? "granted" : "denied",
    ad_user_data: consent?.marketing ? "granted" : "denied",
    ad_personalization: consent?.marketing ? "granted" : "denied",
  });
}
if (typeof window !== "undefined") {
  window.dataLayer ??= [];
  window.gtag ??= (...args: unknown[]) => { window.dataLayer!.push(args); };
  window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  if (storedConsent) updateGoogleConsent(storedConsent);
}
