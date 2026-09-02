"use client";

import * as React from "react";

export function ServiceWorker() {
  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    } else {
      // In dev, unregister any stale service workers left over from a
      // previous app (e.g. an old Vite SPA) that may be intercepting
      // requests and serving cached responses with wrong Content-Type.
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.info(
                  "[sw] Unregistered stale service worker in dev mode:",
                  registration.scope,
                );
              }
            });
          }
          // Also clear any caches left behind by the old SW.
          if ("caches" in window) {
            caches.keys().then((names) => {
              for (const name of names) {
                caches.delete(name);
              }
            });
          }
        })
        .catch(console.error);
    }
  }, []);

  return null;
}
