// Bump CACHE_NAME on every deploy so returning visitors get the new build.
const CACHE_NAME = 'church2-cache-v6';
const ASSETS = [
    './index.html',
    './styles.css',
    './app.js',
    './ai-engine.js',
    './js/brand.js',
    './js/config.js',
    './js/api.js',
    './vendor/chart.umd.js',
    './manifest.json',
    './icon.svg'
];

self.addEventListener('install', (e) => {
    // Activate the new worker immediately instead of waiting for old tabs to close.
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Purge caches from previous versions so old assets aren't served forever.
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    // Only handle GET; let the browser deal with POST/etc.
    if (e.request.method !== 'GET') return;

    // Network-first for navigations so a new index.html is picked up when online,
    // falling back to the cached shell when offline.
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy));
                    return res;
                })
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Cache-first for same-origin static assets; ignore cross-origin (CDN) requests.
    const url = new URL(e.request.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(
        caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
});
