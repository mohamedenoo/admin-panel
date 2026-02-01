// public/sw.js
const CACHE = "att-cache-v2";  // ← غيّرنا الإصدار لإجبار التحديث
const ASSETS = ["/", "/index.html", "/manifest.json"];

// نزّل الأصول الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // ← فعّل النسخة الجديدة فورًا
});

// نظّف أي كاش قديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim(); // ← سيطر على كل التابات فورًا
});

// إستراتيجية بسيطة: Cache falling back to Network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});