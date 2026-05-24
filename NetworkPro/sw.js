// NetworkPro Service Worker v3 — network first, no stale cache issues
const CACHE_NAME = "networkpro-v3";

self.addEventListener("install", event => {
  // Skip waiting so new SW activates immediately
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  // Delete ALL old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  // Only handle same-origin requests for the app shell
  const url = new URL(event.request.url);
  const isAppShell = url.origin === self.location.origin &&
                     url.pathname.startsWith("/NetworkPro");

  if(!isAppShell) return; // Let all API calls (Supabase etc) go straight to network

  // Network first — fall back to cache only if truly offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if(response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        // Offline fallback
        caches.match(event.request).then(cached =>
          cached || caches.match("/NetworkPro/index.html")
        )
      )
  );
});
