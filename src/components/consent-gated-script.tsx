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
  strategy?: "afterInteractive" | "lazyOnload";
  src?: string;
  children?: React.ReactNode;
};

export function ConsentGatedScript({
  category,
  id,
  strategy = "afterInteractive",
  src,
  children,
}: ConsentGatedScriptProps) {
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false);
  const allowed = mounted && checkConsent(category);

  if (!allowed) return null;

  if (src) {
    return <Script src={src} id={id} strategy={strategy} />;
  }

  return (
    <Script id={id} strategy={strategy}>
      {children}
    </Script>
  );
}
