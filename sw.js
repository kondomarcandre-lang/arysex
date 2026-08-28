const CACHE_NAME = 'arysex-quiz-v2';
const FILES = [
    '/',
    '/index.html',
    '/main.js',
    '/script.js', // (si tu en as un autre)
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES).catch(err => console.error('Cache fail:', err)))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(key => {
            if (key !== CACHE_NAME) return caches.delete(key);
        })))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request).catch(() => caches.match('/')))
    );
});