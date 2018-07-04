const staticCacheName = 'static-cache-v3';
const imageCacheName = 'image-cache-v1';
const allCaches = [staticCacheName, imageCacheName];

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  function servePhoto(request) {
    const storageUrl = request.url.replace(/-\d+px\.webp$/, '');
    return caches.open(imageCacheName).then(cache => cache.match(storageUrl).then((response) => {
      if (response) return response;
      return fetch(request).then((sourcedPhoto) => {
        cache.put(storageUrl, sourcedPhoto.clone());
        return sourcedPhoto;
      });
    }));
  }

  // handle images
  if (requestUrl.pathname.startsWith('/build/img/')) {
    event.respondWith(servePhoto(event.request));
    return;
  }

  // handle restaurant pages
  if (requestUrl.pathname.startsWith('/restaurant.html')) {
    event.respondWith(caches.match(event.request, { ignoreSearch: true }).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    }));
  }

  // fetch everything else
  event.respondWith(caches.match(event.request).then((response) => {
    if (response) {
      return response;
    }
    return fetch(event.request);
  }));
});

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCacheName).then(cache => cache.addAll([
    '/',
    'build/js/all.js',
    /*
    'js/main.js',
    'js/restaurant_info.js',
    'js/dbhelper.js',
    */
    'css/styles.css',
    '/restaurant.html',
    'data/restaurants.json',
  ])));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.filter(cacheName => cacheName.startsWith('static-') && !allCaches.includes(cacheName)).map(cacheName => cache.delete(cacheName)))));
});
