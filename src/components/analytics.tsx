"use client";

import * as React from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Cookie, X, Check } from "lucide-react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const CONSENT_KEY = "mistravora-consent";
const CONSENT_VERSION = 2;

type ConsentChoice = {
  version: number;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
};

type Consent = ConsentChoice | null;

function isCurrentConsent(value: unknown): value is ConsentChoice {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    (value as ConsentChoice).version === CONSENT_VERSION
  );
}

function loadConsent(): Consent {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isCurrentConsent(parsed)) return parsed;
    if (raw === "accepted") {
      return {
        version: CONSENT_VERSION,
        analytics: true,
        marketing: true,
        functional: true,
        timestamp: new Date().toISOString(),
      };
    }
    if (raw === "declined") {
      return {
        version: CONSENT_VERSION,
        analytics: false,
        marketing: false,
        functional: true,
        timestamp: new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
}

/* ── Consent store (module-level, used with useSyncExternalStore) ── */
let storedConsent: Consent = null;
const consentListeners = new Set<() => void>();

if (typeof window !== "undefined") {
  storedConsent = loadConsent();
}

function subscribeConsent(cb: () => void) {
  consentListeners.add(cb);
  return () => {
    consentListeners.delete(cb);
  };
}

function getConsentSnapshot(): Consent {
  return storedConsent;
}

function getConsentSSR(): Consent {
  return null;
}

function setConsentValue(value: Consent) {
  storedConsent = value;
  consentListeners.forEach((l) => l());
}

const subscribe = () => () => {};

export function Analytics() {
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const consent = React.useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentSSR
  );
  const [showSettings, setShowSettings] = React.useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true);
  const [marketingEnabled, setMarketingEnabled] = React.useState(true);
  const [bannerVisible, setBannerVisible] = React.useState(false);

  React.useEffect(() => {
    if (mounted && !consent) {
      const timer = setTimeout(() => setBannerVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [mounted, consent]);

  const acceptAll = () => {
    const choice: ConsentChoice = {
      version: CONSENT_VERSION,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    saveConsent(choice);
    setConsentValue(choice);
    setBannerVisible(false);
    setShowSettings(false);
  };

  const declineAll = () => {
    const choice: ConsentChoice = {
      version: CONSENT_VERSION,
      analytics: false,
      marketing: false,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    saveConsent(choice);
    setConsentValue(choice);
    setBannerVisible(false);
    setShowSettings(false);
  };

  const saveSettings = () => {
    const choice: ConsentChoice = {
      version: CONSENT_VERSION,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    saveConsent(choice);
    setConsentValue(choice);
    setBannerVisible(false);
    setShowSettings(false);
  };

  const openSettings = () => {
    if (isCurrentConsent(consent)) {
      setAnalyticsEnabled(consent.analytics);
      setMarketingEnabled(consent.marketing);
    }
    setShowSettings(true);
  };

  const hasConsent = consent !== null;
  const analyticsAllowed = isCurrentConsent(consent) && consent.analytics;

  return (
    <>
      {/* Cookie consent banner */}
      {mounted && bannerVisible && !hasConsent && !showSettings && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md shadow-2xl animate-fade-in-up"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cookie aria-hidden className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold">We value your privacy</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  We use cookies to enhance your experience, analyze traffic, and improve our services.
                  You can choose which categories to allow.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" variant="outline" onClick={openSettings}>
                Customize
              </Button>
              <Button size="sm" variant="ghost" onClick={declineAll}>
                Decline
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Accept all
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-scale-in">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowSettings(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-bold tracking-tight">Cookie preferences</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose which cookie categories you want to allow. You can change these anytime.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {/* Functional */}
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-semibold">Functional</p>
                  <p className="text-xs text-muted-foreground">Required for the site to work. Always on.</p>
                </div>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  <Check aria-hidden className="h-3.5 w-3.5 text-primary" />
                </span>
              </div>

              {/* Analytics */}
              <button
                type="button"
                onClick={() => setAnalyticsEnabled((v) => !v)}
                className="flex items-center justify-between rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/30"
              >
                <div>
                  <p className="text-sm font-semibold">Analytics</p>
                  <p className="text-xs text-muted-foreground">Google Analytics, Clarity — anonymous usage data.</p>
                </div>
                <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${analyticsEnabled ? "bg-primary" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${analyticsEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </span>
              </button>

              {/* Marketing */}
              <button
                type="button"
                onClick={() => setMarketingEnabled((v) => !v)}
                className="flex items-center justify-between rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/30"
              >
                <div>
                  <p className="text-sm font-semibold">Marketing</p>
                  <p className="text-xs text-muted-foreground">Meta Pixel, Google Ads — conversion tracking.</p>
                </div>
                <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${marketingEnabled ? "bg-primary" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${marketingEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </span>
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={declineAll}>
                Decline all
              </Button>
              <Button size="sm" onClick={saveSettings}>
                Save preferences
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GA4 */}
      {analyticsAllowed && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <script
            id="ga4-init"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}', { 'anonymize_ip': true });`,
            }}
          />
        </>
      )}

      {/* Clarity */}
      {analyticsAllowed && CLARITY_ID && (
        <script
          id="clarity-init"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");`,
          }}
        />
      )}
    </>
  );
}
