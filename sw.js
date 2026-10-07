// ========================================
// 🔥 SERVICE WORKER - AryseX Quiz
// Version avec Notifications Push
// ========================================

const CACHE_NAME = 'arysex-quiz-v3';
const FILES = [
    '/',
    '/index.html',
    '/main.js',
    '/script.js',
    '/manifest.json',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-192.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png'
];

// ========================================
// 📦 INSTALLATION
// ========================================
self.addEventListener('install', event => {
    console.log('🔧 Service Worker : installation...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Mise en cache des fichiers...');
                return cache.addAll(FILES);
            })
            .catch(err => console.error('❌ Erreur cache:', err))
    );
    self.skipWaiting();
});

// ========================================
// 🚀 ACTIVATION
// ========================================
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker : activation...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('🗑️ Ancien cache supprimé:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// ========================================
// 🌐 FETCH (Cache-first avec fallback réseau)
// ========================================
self.addEventListener('fetch', event => {
    // Ne pas intercepter les requêtes socket.io
    if (event.request.url.includes('socket.io')) {
        return;
    }

    // Ne pas intercepter les requêtes POST
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si trouvé dans le cache, on retourne
                if (response) {
                    return response;
                }
                // Sinon, on va chercher sur le réseau
                return fetch(event.request)
                    .then(networkResponse => {
                        // Ne pas cacher les réponses invalides
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        // Cacher la nouvelle ressource
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                        return networkResponse;
                    })
                    .catch(() => {
                        // En cas d'échec réseau, retourner l'index
                        return caches.match('/');
                    });
            })
    );
});

// ========================================
// 🔔 NOTIFICATIONS PUSH
// ========================================
self.addEventListener('push', event => {
    console.log('📬 Push reçu:', event);

    let data = {
        title: 'AryseX Quiz',
        body: 'Nouveau quiz disponible ! 🎯',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        url: '/'
    };

    // Essayer de parser les données reçues
    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        tag: data.tag || 'arysex-quiz',
        renotify: true,
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now()
        },
        actions: [
            { action: 'open', title: '▶️ Jouer' },
            { action: 'close', title: '❌ Fermer' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ========================================
// 👆 CLIC SUR NOTIFICATION
// ========================================
self.addEventListener('notificationclick', event => {
    console.log('👆 Clic sur notification:', event.action);
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ 
            type: 'window', 
            includeUncontrolled: true 
        })
        .then(windowClients => {
            // Si une fenêtre est déjà ouverte, focus dessus
            for (let client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sinon, ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// ========================================
// 💬 MESSAGES DEPUIS LA PAGE
// ========================================
self.addEventListener('message', event => {
    console.log('💬 Message reçu:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'TEST_NOTIFICATION') {
        self.registration.showNotification('🎯 AryseX Quiz', {
            body: 'Ceci est une notification de test !',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-96.png',
            vibrate: [200, 100, 200]
        });
    }
});

// ========================================
// 🔄 SYNCHRONISATION EN ARRIÈRE-PLAN (optionnel)
// ========================================
self.addEventListener('sync', event => {
    if (event.tag === 'sync-scores') {
        console.log('🔄 Synchronisation des scores...');
        // Ici tu pourrais synchroniser les scores en attente
    }
});

console.log('✅ Service Worker chargé - AryseX Quiz v3');