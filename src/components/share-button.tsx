"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/track-event";
export function ShareButton({ title }: { title: string }) {
  const [label, setLabel] = useState("Share this page");
  async function share() {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setLabel("Link copied"); }
      trackEvent("share", { content_type: "article" });
    } catch { /* Cancellation leaves the page unchanged. */ }
  }
  return <button type="button" onClick={share} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted" aria-live="polite">{label}</button>;
}
