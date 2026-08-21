// SERVICE WORKER DÉSACTIVÉ POUR DÉBOGAGE
self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    // On laisse tout passer, aucune mise en cache
    return;
});