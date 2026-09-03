const CACHE = "mistravora-v3";
const OFFLINE = "/offline.html";

// Precache only the offline fallback — everything else is cached on-demand.
// Don't precache the logo since its path changed; it'll be cached when first loaded.
const PRECACHE = [OFFLINE];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // Ignore precache failures — the SW should still install
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API, dashboard, or admin routes.
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/admin")
  ) {
    return;
  }

  // Navigation requests (HTML pages): network-first with cache fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache valid HTML responses.
          if (response.ok) {
            const ct = response.headers.get("Content-Type") || "";
            if (ct.includes("text/html")) {
              const clone = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
            }
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            return (
              caches.match(OFFLINE).then((offline) => {
                if (offline) return offline;
                return new Response("Offline", {
                  status: 503,
                  headers: { "Content-Type": "text/html; charset=utf-8" },
                });
              })
            );
          })
        )
    );
    return;
  }

  // Static assets: cache-first with network fallback.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const ct = response.headers.get("Content-Type") || "";
            // Only cache if we got a valid content type
            if (ct) {
              const clone = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
            }
          }
          return response;
        })
        .catch(() => {
          // Return a transparent 1x1 GIF for image requests to avoid broken icons
          if (request.destination === "image") {
            return new Response(
              "GIF89a\u0001\u0000\u0001\u0000\u0000\u0000\u0000;\u0000\u0000",
              { status: 200, headers: { "Content-Type": "image/gif" } }
            );
          }
          return new Response("", { status: 504 });
        });
    })
  );
});
