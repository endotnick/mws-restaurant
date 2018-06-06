const staticCacheName = 'static-cache-v3';
const dynamicCacheName = 'dynamic-cache-v1';

self.addEventListener('fetch', function(event) {      
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if(response) {
                return response;
            }
            return fetch(event.request);
        })
    )   

    if (event.request.url.endsWith('.webp')) { //, '.js', '.css', '.html'
        console.log(event.request);
    }
});

self.addEventListener('install', function(event){    
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                '/',
                'js/main.js',
                'js/restaurant_info.js',
                'js/dbhelper.js',
                'css/styles.css'
            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('static-') && cacheName != staticCacheName;                    
                }).map(function(cacheName) {
                    return cache.delete(cacheName);
                })
            );
        })
    )
})
