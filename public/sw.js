// Service worker minimal : la carte et le QR code restent consultables hors ligne.
const CACHE = "taraji-v3";
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const PAGES = ["/", "/login/", "/voyager/", "/matchs/", "/famille/", "/profil/", "/admin/", "/admin/voyages/", "/admin/moderation/", "/admin/simulateur/"].map((p) => BASE + p);

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PAGES)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isStatic = req.url.includes("/_next/static/") || /\.(png|svg|ico|webmanifest)$/.test(req.url);
  if (isStatic) {
    // cache d'abord pour les ressources versionnées
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })),
    );
  } else {
    // réseau d'abord pour les pages et données, repli sur le cache hors ligne
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((hit) => hit || caches.match(BASE + "/"))),
    );
  }
});
