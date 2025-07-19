const CACHE_NAME = 'flowstate-pro-v3';  // Increment version number
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install event - force immediate activation
self.addEventListener('install', function(event) {
    console.log('🔄 New version installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('✅ Cache opened');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('🚀 Forcing immediate activation');
                return self.skipWaiting(); // Force immediate activation
            })
    );
});

// Activate event - clean old caches and take control
self.addEventListener('activate', function(event) {
    console.log('⚡ Service Worker activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('🔥 Taking control of all clients');
            return self.clients.claim(); // Take control immediately
        })
    );
});

// Fetch event - always try network first for HTML
self.addEventListener('fetch', function(event) {
    // For HTML files, always try network first to get updates
    if (event.request.url.includes('.html') || event.request.url.endsWith('/')) {
        event.respondWith(
            fetch(event.request)
                .then(function(response) {
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(function() {
                    // If network fails, serve from cache
                    return caches.match(event.request);
                })
        );
    } else {
        // For other resources, try cache first
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    return response || fetch(event.request);
                })
        );
    }
});

// Listen for messages from the main thread
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
