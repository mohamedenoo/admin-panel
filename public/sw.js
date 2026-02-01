// public/sw.js
const CACHE_STATIC = 'att-static-v3'; // ← غيّر الرقم لما تعدّل SW
const FALLBACK_HTML = '/index.html';

// أصول ثابتة اختيارية (مش هنضيف index.html علشان ما نحجز نسخة قديمة)
const PRE_CACHE = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// نثبت نسخة SW فورًا
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_STATIC).then((c) => c.addAll(PRE_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_STATIC ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// مساعد: نعرف نوع الطلب
function isNavigationRequest(req) {
  return req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));
}
function isStaticAsset(req) {
  const dest = req.destination;
  return ['script', 'style', 'image', 'font', 'worker'].includes(dest);
}

// الاستراتيجية:
// 1) للـ Navigation: Network-First (أحدث HTML)، ولو أوفلاين: fallback من الكاش لو موجود.
// 2) للـ Static assets: Cache-First (أسرع بكثير مع هاشات Vite).
// 3) لباقي الطلبات: نحاول الشبكة ثم الكاش كاحتياطي.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // تجاهل طلبات chrome-extension وما شابه
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && !url.href.startsWith('https://')) return;

  // Navigation → Network First
  if (isNavigationRequest(req)) {
    event.respondWith(
      (async () => {
        try {
          // نطلب الـ HTML من الشبكة دائمًا
          const fresh = await fetch(req);
          // ممكن نخزّن نسخة كـ fallback للمرة الجاية (اختياري)
          const cache = await caches.open(CACHE_STATIC);
          cache.put(FALLBACK_HTML, fresh.clone());
          return fresh;
        } catch {
          // أوفلاين → fallback
          const cached = await caches.match(FALLBACK_HTML);
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // Static assets → Cache First
  if (isStaticAsset(req)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        const cache = await caches.open(CACHE_STATIC);
        cache.put(req, res.clone());
        return res;
      })()
    );
    return;
  }

  // باقي الطلبات (API مثلاً) → Network then fallback cache
  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch {
        const cached = await caches.match(req);
        return cached || new Response('Offline', { status: 503 });
      }
    })()
  );
});

// قناة بسيطة لإبلاغ الواجهة بوجود نسخة جديدة (اختياري)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});