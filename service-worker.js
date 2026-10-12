// ========================================
// 🔥 SERVICE WORKER - AryseX Quiz
// Version SANS cache (la plus simple et fiable)
// ========================================

self.addEventListener('install', (event) => {
    console.log('🔧 SW install');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ SW activé');
    event.waitUntil(self.clients.claim());
});

// ⚠️ Ne PAS intercepter les fetch — laisser le navigateur faire son travail
// (C'est ce qui causait l'erreur "Failed to convert value to Response")

// ========================================
// 🔔 PUSH
// ========================================
self.addEventListener('push', (event) => {
    console.log('📬 Push reçu');

    let data = {
        title: 'AryseX Quiz',
        body: 'Nouveau quiz disponible !',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        url: '/'
    };

    if (event.data) {
        try {
            data = Object.assign(data, event.data.json());
        } catch (e) {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            vibrate: [200, 100, 200],
            data: { url: data.url }
        })
    );
});

// ========================================
// 👆 CLIC NOTIFICATION
// ========================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});