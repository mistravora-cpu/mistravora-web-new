"use client";

import * as React from "react";
import Script from "next/script";

import { subscribeConsent, getConsentSnapshot, getConsentSSR } from "@/lib/consent";

type ConsentGatedScriptProps = {
  category: "analytics" | "marketing";
  id: string;
  src?: string;
  children?: React.ReactNode;
};

export function ConsentGatedScript({
  category,
  id,
  src,
  children,
}: ConsentGatedScriptProps) {
  const consent = React.useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentSSR);
  if (!consent?.[category]) return null;

  if (src) {
    return <Script src={src} id={id} strategy="afterInteractive" />;
  }

  const content = typeof children === "string" ? children : "";
  return <Script id={id} strategy="afterInteractive">{content}</Script>;
}
