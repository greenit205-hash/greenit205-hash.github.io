/* Offline dla aplikacji Jadłospis. Po każdej zmianie plików podnieś numer CACHE. */
const CACHE = "jadlospis-v2";
const CORE = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-maskable.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;                       // zapytania do AI omijają cache
  if (url.hostname.endsWith("openfoodfacts.org")) return;
  if (url.hostname.endsWith("workers.dev")) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
