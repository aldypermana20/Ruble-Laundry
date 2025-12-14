const CACHE_NAME = 'ruble-laundry-v1';
const urlsToCache = [
    '.',
    'index.html',
    'styles.css',
    'app.js',
    'offline.html',
    'manifest.json',
    'sounds/notification.mp3'
];

// Install Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installed successfully');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('Service Worker: Install failed', err);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated successfully');
            return self.clients.claim();
        })
    );
});

// Fetch - Cache First Strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then(fetchResponse => {
                        // Check if valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Clone the response
                        const responseToCache = fetchResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return fetchResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, show offline page
                        return caches.match('offline.html');
                    });
            })
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();
    
    // Handle different actions
    if (event.action === 'contact') {
        // Open WhatsApp or contact page
        event.waitUntil(
            clients.openWindow('https://wa.me/6281234567890')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action: focus existing window or open new one
        event.waitUntil(
            clients.matchAll({type: 'window', includeUncontrolled: true})
                .then(clientList => {
                    // Check if there's already a tab open
                    for (const client of clientList) {
                        if (client.url.includes('index.html') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // If not, open a new one
                    if (clients.openWindow) {
                        return clients.openWindow('index.html');
                    }
                })
        );
    }
});

// Handle push notification (for future implementation)
self.addEventListener('push', event => {
    console.log('Push notification received:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Notifikasi baru dari Ruble Laundry',
        icon: 'images/icons/icon-192x192.png',
        badge: 'images/icons/icon-192x192.png',
        sound: 'sounds/notification.mp3',
        vibrate: [200, 100, 200],
        tag: 'ruble-push',
        requireInteraction: false
    };
    
    event.waitUntil(
        self.registration.showNotification('Ruble Laundry', options)
    );
});