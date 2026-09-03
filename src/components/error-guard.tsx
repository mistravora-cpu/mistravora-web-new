"use client";

import * as React from "react";

/**
 * ErrorGuard — suppresses console errors from third-party scripts
 * (Microsoft Clarity, GTM, GA4) that we can't control.
 *
 * These are known issues:
 * 1. Clarity bundles web-vitals internally and crashes when the
 *    browser's Performance API returns incomplete entries:
 *    "Cannot read properties of undefined (reading 'startTime')"
 * 2. Clarity's internal script injection can trigger:
 *    "a[c] is not a function"
 *
 * These errors don't affect user experience or our application —
 * they're internal measurement failures in third-party code.
 */
export function ErrorGuard() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // ── Global error handler — suppress third-party script errors ──
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || "";

      // Clarity web-vitals crash
      if (msg.includes("startTime") && msg.includes("undefined")) {
        event.preventDefault();
        return;
      }

      // Clarity internal function call error
      if (msg.includes("is not a function") && (event.filename || "").includes("clarity")) {
        event.preventDefault();
        return;
      }

      // web-vitals reportAllChanges crash
      if (msg.includes("reportAllChanges")) {
        event.preventDefault();
        return;
      }
    };

    // ── Global unhandledrejection handler ──
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason instanceof TypeError) {
        const msg = reason.message || "";
        if (msg.includes("startTime") || msg.includes("reportAllChanges")) {
          event.preventDefault();
          return;
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
