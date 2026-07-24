// Service Worker - Closet Infantil Hub
// Versão: incrementar aqui força atualização em todos os dispositivos
const CACHE_VERSION = 'closet-hub-v8';
const CACHE_STATIC = 'closet-static-v8';

const STATIC_ASSETS = [
  '/closet-infantil-hub/manifest.json',
  '/closet-infantil-hub/icon-192.png',
  '/closet-infantil-hub/icon-512.png',
  '/closet-infantil-hub/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase e APIs externas: nunca interceptar
  if(url.hostname.includes('firebase') ||
     url.hostname.includes('googleapis') ||
     url.hostname.includes('gstatic') ||
     url.hostname.includes('firestore')) {
    return;
  }

  // HTMLs: forçar bypass total de cache (nem HTTP cache, nem SW cache)
  if(url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',           // ignora cache HTTP do browser
        headers: { 'Cache-Control': 'no-cache' }
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Ícones e manifest: cache-first (mudam raramente)
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
