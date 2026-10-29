// Guarda el juego en el dispositivo para poder jugar sin internet
const CACHE = "abismo-2d1adb1e81", ARCHIVOS = ["./","index.html","manifest.webmanifest","privacidad.html","iconos/icono-192.png","iconos/icono-512.png","iconos/icono-apple-180.png","iconos/icono-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => { if (e.request.method === "GET") e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
