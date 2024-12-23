self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('admin-panel-cache').then(cache => {
      return cache.addAll([
        '/admin.html',
        '/manifest.json',
        '/favico.png',
        '/log.png',
        // Adicione outros arquivos que você deseja armazenar em cache
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
