const CACHE_NAME = 'closet-hub-v3';
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
  self.skipWaiting(); // Ativa imediatamente sem esperar
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Toma controle imediato
  );
});

self.addEventListener('fetch', event => {
  // Firebase e APIs externas: sempre buscar da rede
  if(event.request.url.includes('firebase') ||
     event.request.url.includes('googleapis') ||
     event.request.url.includes('gstatic')) {
    return;
  }

  // Estratégia: network-first para HTMLs, cache-first para assets
  const isHTML = event.request.url.endsWith('.html') || event.request.url.endsWith('/');
  
  if(isHTML) {
    // Network first: sempre tenta pegar versão mais nova
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first para imagens e outros assets
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
