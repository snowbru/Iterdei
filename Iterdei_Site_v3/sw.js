// Service Worker – Iterdei – version étendue

const CACHE_NAME = "iterdei-cache-v2";

// Fichiers à mettre en cache au premier chargement (precache)
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./voyages.html",
  "./contact.html",
  "./admin.html",
  "./404.html",
  "./css/style.css",
  "./js/main.js",
  "./js/voyages.js",
  "./js/contact.js",
  "./js/admin.js",
  "./assets/logo.png",
  "./assets/iterdei-logo.svg",
  "./manifest.json",
  "./fonts/Inter.woff2",
  "./fonts/PlayfairDisplay.woff2"
];

// Installation et pré‑caching des fichiers essentiels
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation : nettoyage des anciennes versions du cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Règle de réponse : "cache‑first avec mise à jour réseau"
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non HTTP
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const respClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, respClone)
            );
          }
          return networkResponse;
        })
        .catch(() => {
          // Mode hors‑ligne : afficher 404 personnalisée ou fallback
          if (event.request.destination === "document") {
            return caches.match("./404.html");
          }
        });

      return response || fetchPromise;
    })
  );
});

// Notification en console (debug)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
