const CACHE_NAME = 'flowstate-pro-v2';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Enhanced install event
self.addEventListener('install', function(event) {
    console.log('PWA Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('PWA cache opened');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('PWA ready for installation');
                return self.skipWaiting();
            })
    );
});

// Enhanced activate event  
self.addEventListener('activate', function(event) {
    console.log('PWA Service Worker activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
    );
});
