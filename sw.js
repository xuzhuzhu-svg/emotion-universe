/* 情绪宇宙 Service Worker · 让页面可离线 / 添加到主屏 */
const CACHE = "eu-v1";
const ASSETS = ["index.html", "manifest.webmanifest", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached ||
      fetch(e.request).then(resp => {
        const cp = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp).catch(() => {}));
        return resp;
      }).catch(() => caches.match("index.html"))
    )
  );
});
