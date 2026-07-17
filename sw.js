// Service Worker - Closet Infantil Hub
// Versão: incrementar aqui força atualização em todos os dispositivos
const CACHE_VERSION = 'closet-hub-v7';
const CACHE_STATIC = 'closet-static-v7';

// Assets estáticos que podem ser cacheados (ícones, manifest)
const STATIC_ASSETS = [
  '/closet-infantil-hub/manifest.json',
  '/closet-infantil-hub/icon-192.png',
  '/closet-infantil-hub/icon-512.png',
  '/closet-infantil-hub/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Ativar imediatamente
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k !== CACHE_STATIC)
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase e APIs externas: sempre rede, nunca cache
  if(url.hostname.includes('firebase') ||
     url.hostname.includes('googleapis') ||
     url.hostname.includes('gstatic') ||
     url.hostname.includes('firestore')) {
    return; // deixa o browser tratar normalmente
  }

  // HTMLs: sempre rede (network-only) — dados sempre frescos
  if(url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Sem internet: tentar cache como fallback
        return caches.match(event.request);
      })
    );
    return;
  }

  // Ícones e manifest: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
