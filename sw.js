const staticCacheName = 'static-cache-v3';
const imageCacheName = 'image-cache-v1';
const allCaches = [staticCacheName, imageCacheName];

self.addEventListener('fetch', function(event) {  
    var requestUrl = new URL(event.request.url);

    // handle images
    if (requestUrl.pathname.startsWith('/build/img/')) {
        event.respondWith(servePhoto(event.request));
        return;
    }

    // handle restaurant pages
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
        event.respondWith(
            caches.match(event.request, {ignoreSearch: true}).then(function(response) {
                if (response) {
                    return response;
                }   
                return fetch(event.request);             
            })
        )
    }

    // fetch everything else
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if(response) {
                return response;
            }
            return fetch(event.request);
        })
    )   

    function servePhoto(request) {
        const storageUrl = request.url.replace(/-\d+px\.webp$/, '');
        return caches.open(imageCacheName).then(function(cache) {
            return cache.match(storageUrl).then(function(response) {
                if(response) return response;
                return fetch(request).then(function(sourcedPhoto) {
                    cache.put(storageUrl, sourcedPhoto.clone());
                    return sourcedPhoto;
                })
            })
        })   
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
                'css/styles.css',
                '/restaurant.html',
                'data/restaurants.json'
            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('static-') && !allCaches.includes(cacheName);
                }).map(function(cacheName) {
                    return cache.delete(cacheName);
                })
            );
        })
    )
})
