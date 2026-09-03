"use client";

import * as React from "react";
import Script from "next/script";

const CONSENT_KEY = "mistravora-consent";
const CONSENT_VERSION = 2;

function checkConsent(category: "analytics" | "marketing"): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === CONSENT_VERSION) {
      return parsed[category] === true;
    }
    if (raw === "accepted") return true;
    return false;
  } catch {
    return false;
  }
}

const subscribe = () => () => {};

type ConsentGatedScriptProps = {
  category: "analytics" | "marketing";
  id: string;
  src?: string;
  children?: React.ReactNode;
};

/**
 * Consent-gated script renderer.
 *
 * For external scripts (with `src`): uses next/script which handles
 * async loading and deduplication.
 *
 * For inline scripts: uses a plain <script> tag with dangerouslySetInnerHTML
 * to avoid next/script's internal appendChild handling which causes
 * "Unexpected identifier" errors during React streaming.
 */
export function ConsentGatedScript({
  category,
  id,
  src,
  children,
}: ConsentGatedScriptProps) {
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false);
  const allowed = mounted && checkConsent(category);

  if (!allowed) return null;

  // External script — use next/script for async loading
  if (src) {
    return <Script src={src} id={id} strategy="afterInteractive" />;
  }

  // Inline script — use dangerouslySetInnerHTML to avoid next/script
  // appendChild issues during React streaming
  const content = typeof children === "string" ? children : "";
  return (
    <script
      id={id}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
