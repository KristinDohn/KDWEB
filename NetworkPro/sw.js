// NetworkPro Service Worker v3 — pass-through (no caching)
// iOS PWA caching causes stale app issues; all requests go to network.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => {
  // Clear ALL old caches so previous sw.js versions don't serve stale files
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  // Pure network-first — no caching
  event.respondWith(fetch(event.request));
});
