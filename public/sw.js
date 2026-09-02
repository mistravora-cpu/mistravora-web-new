const CACHE = "mistravora-v2";
const OFFLINE = "/offline.html";
const PRECACHE = [OFFLINE, "/mistravoralogo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
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

  // Navigation requests (HTML pages): always network-first so the user
  // gets the latest server-rendered HTML. Cache the fresh response for
  // offline fallback. Fall back to cached page, then offline.html.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache valid HTML responses.
          if (response.ok && response.headers.get("Content-Type")) {
            const ct = response.headers.get("Content-Type");
            if (ct && ct.includes("text/html")) {
              const clone = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, clone));
            }
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              caches.match(OFFLINE) ||
              new Response("Offline", {
                status: 503,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              })
          )
        )
    );
    return;
  }

  // Static assets: cache-first, but validate Content-Type to avoid
  // serving a cached response with a wrong MIME type.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
