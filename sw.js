const CACHE_NAME = 'closet-hub-v1';
const URLS_TO_CACHE = [
  '/closet-infantil-hub/',
  '/closet-infantil-hub/index.html',
  '/closet-infantil-hub/login.html',
  '/closet-infantil-hub/ClosetInfantil_OrdemProducao.html',
  '/closet-infantil-hub/ClosetInfantil_Terceirizados.html',
  '/closet-infantil-hub/ClosetInfantil_FechamentoGeral.html',
  '/closet-infantil-hub/ClosetInfantil_Custo.html',
  '/closet-infantil-hub/ClosetInfantil_Precificacao.html',
  '/closet-infantil-hub/ClosetInfantil_Friso.html',
  '/closet-infantil-hub/ClosetInfantil_Sistema_Producao.html',
  '/closet-infantil-hub/ClosetInfantil_Produtividade.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Firebase requests: sempre network
  if(event.request.url.includes('firebase') || event.request.url.includes('google')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Atualizar cache com versão nova
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});