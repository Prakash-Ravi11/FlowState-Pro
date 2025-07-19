const CACHE_NAME = 'flowstate-pro-v4';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install event - force immediate update
self.addEventListener('install', function(event) {
    console.log('🔄 Installing new version...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('✅ Caching resources');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('🚀 Skipping waiting');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up and take control
self.addEventListener('activate', function(event) {
    console.log('⚡ Activating new version...');
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Deleting cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control immediately
            self.clients.claim()
        ])
    );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', function(event) {
    const request = event.request;
    
    // Always fetch HTML from network to get updates
    if (request.url.includes('.html') || request.url.endsWith('/')) {
        event.respondWith(
            fetch(request)
                .then(function(response) {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(function() {
                    return caches.match(request);
                })
        );
    } else {
        // For other resources, try cache first
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    return response || fetch(request);
                })
        );
    }
});

// Handle skip waiting message
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
