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
 *
 * This component also patches PerformanceObserver to guard against
 * undefined entries, which prevents the root cause of many
 * web-vitals crashes.
 */
export function ErrorGuard() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // ── 1. Patch PerformanceObserver to filter undefined entries ──
    // The web-vitals library (bundled inside Clarity) crashes when
    // PerformanceObserver callbacks receive undefined entries.
    // This patch wraps the callback to filter them out.
    if (typeof PerformanceObserver !== "undefined") {
      const OrigPO = PerformanceObserver;
      class PatchedPerformanceObserver extends OrigPO {
        constructor(callback: PerformanceObserverCallback) {
          const wrappedCallback: PerformanceObserverCallback = (
            list: PerformanceObserverEntryList,
            observer: PerformanceObserver
          ) => {
            // Guard: filter out any undefined/null entries
            try {
              const entries = list.getEntries();
              if (!entries || entries.length === 0) return;
              // Check for entries missing startTime (the root cause)
              const hasValidEntries = entries.every(
                (e) => e && typeof e.startTime === "number"
              );
              if (!hasValidEntries) return;
            } catch {
              return;
            }
            return callback(list, observer);
          };
          super(wrappedCallback);
        }
      }

      // Preserve static methods (cast to bypass readonly)
      (PatchedPerformanceObserver as unknown as {
        supportedEntryTypes: typeof OrigPO.supportedEntryTypes;
      }).supportedEntryTypes = OrigPO.supportedEntryTypes;

      // Replace global PerformanceObserver
      window.PerformanceObserver = PatchedPerformanceObserver as unknown as typeof PerformanceObserver;
    }

    // ── 2. Global error handler — suppress third-party script errors ──
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || "";
      const filename = event.filename || "";

      // Clarity web-vitals crash
      if (msg.includes("startTime") && msg.includes("undefined")) {
        event.preventDefault();
        return;
      }

      // Clarity internal function call error
      if (msg.includes("is not a function") && filename.includes("clarity")) {
        event.preventDefault();
        return;
      }

      // web-vitals reportAllChanges crash
      if (msg.includes("reportAllChanges")) {
        event.preventDefault();
        return;
      }
    };

    // ── 3. Global unhandledrejection handler ──
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
