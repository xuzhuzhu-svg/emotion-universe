/* 情绪宇宙 Service Worker · 让页面可离线 / 添加到主屏 */
const CACHE = "eu-v2";
const ASSETS = ["index.html", "manifest.webmanifest", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // 删掉旧版本缓存，避免旧的（有 bug 的）index.html 被继续命中
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
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
