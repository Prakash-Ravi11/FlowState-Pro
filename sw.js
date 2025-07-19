const CACHE_NAME = 'flowstate-pro-v1';
const urlsToCache = [
    '/flowstate-pro-new/',
    '/flowstate-pro-new/index.html',
    '/flowstate-pro-new/manifest.json',
    '/flowstate-pro-new/icon-192.png',
    '/flowstate-pro-new/icon-512.png',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache).catch(error => {
                    console.error('Failed to cache:', error);
                });
            })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
            .catch(function() {
                return caches.match('/flowstate-pro-new/index.html');
            })
    );
});
