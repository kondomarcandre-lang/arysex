// ========================================
// SERVICE WORKER - AryseX Quiz
// ========================================

// 🔥 CHANGEMENT DE VERSION POUR FORCER LA MISE À JOUR
const CACHE_NAME = 'arysex-quiz-v4';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// ========================================
// INSTALLATION
// ========================================

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache ouvert v4');
                // Ajouter chaque fichier un par un pour éviter l'échec total
                return Promise.allSettled(
                    ASSETS.map(url => {
                        return cache.add(url).catch(err => {
                            console.warn('⚠️ Fichier non trouvé, ignoré:', url, err);
                            return Promise.resolve();
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});

// ========================================
// ACTIVATION
// ========================================

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Suppression de:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker activé v4');
            return self.clients.claim();
        })
    );
});

// ========================================
// INTERCEPTION DES REQUÊTES
// ========================================

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request).catch(() => {
                    // Si la requête échoue, retourner une réponse simple
                    return new Response('Contenu indisponible', { status: 404 });
                });
            })
    );
});

// ========================================
// 🔔 NOTIFICATIONS PUSH
// ========================================

self.addEventListener('push', function(event) {
    const options = {
        body: '🔥 Relevez le défi du jour ! +50 points bonus',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        },
        actions: [
            { action: 'play', title: '🎮 Jouer' },
            { action: 'stats', title: '📊 Stats' },
            { action: 'close', title: '❌ Fermer' }
        ]
    };
    event.waitUntil(
        self.registration.showNotification('🧠 AryseX Quiz', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.action === 'play') {
        event.waitUntil(clients.openWindow('/'));
    } else if (event.action === 'stats') {
        event.waitUntil(clients.openWindow('/?stats=true'));
    }
});