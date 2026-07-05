/* Service worker for the prayers PWA.
   NETWORK-FIRST on purpose: always fetch the freshest version from the network
   so app updates show immediately (no stale-cache problem). The cache is only a
   fallback for when the device is offline. */
const CACHE = 'tpilot-cache-v1';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then(function (res) {
        try {
          if (res && res.status === 200 && new URL(req.url).origin === self.location.origin) {
            const clone = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, clone); });
          }
        } catch (err) {}
        return res;
      })
      .catch(function () { return caches.match(req); })
  );
});
