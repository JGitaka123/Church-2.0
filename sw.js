const CACHE_NAME = 'church2-cache-v1';
const ASSETS = [
    './index.html',
    './styles.css',
    './app.js',
    './ai-engine.js',
    './church_logo.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});
