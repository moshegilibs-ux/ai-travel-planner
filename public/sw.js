self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("trippilot-v1").then((cache) => cache.addAll(["/"])));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))),
  );
});
