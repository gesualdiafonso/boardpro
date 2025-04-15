const CACHE_NAME = 'boardpro_v1'

const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/app.css',
    '/assets/icons/boardpro192x192.png',
    '/assets/icons/boardpro512x512.png',
];

// Evento de instalação (precache)

self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cacheando assets...');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .catch(err => {
                console.error('Service Worker: Erro ao cachear assets', err);
            })
    );
    self.skipWaiting(); // Ativa imediatamente o SW
});

// Evento de ativação (limpeza do caches antigos)

self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim() // Foraça controle imediato das páginas
});

// interceptando requisições (cache first)
self.addEventListener('fetch', event => {
    // ignorando chamadas externas
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
        .then(cached => {
            return cached || fetch(event.request)
            .catch(() => {
                // fallback: se for navegaçnao e offline - serve index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
        })
    )
});
