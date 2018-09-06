import idb from 'idb';

const staticCache = 'static-cache-v3';
const imageCache = 'image-cache-v1';
const allCaches = [staticCache, imageCache];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCache)
    .then(cache => cache.addAll([
      '/',
      '/index.html',
      'build/js/main.js',
      'build/js/restaurant_info.js',
      'css/styles.css',
      '/restaurant.html',
    ])
      .catch((error) => {
        console.error(error);
      })));
});


self.addEventListener('fetch', (event) => {
  const servePhoto = (request) => {
    const storageUrl = request.url.replace(/-\d+px\.webp$/, '');
    return caches.open(imageCache)
      .then(cache => cache.match(storageUrl)
        .then(response => response || fetch(request)
          .then((sourcedPhoto) => {
            cache.put(storageUrl, sourcedPhoto.clone());
            return sourcedPhoto;
          })));
  };

  const handleLocalRequest = (event) => {
    const requestUrl = new URL(event.request.url);
    // handle images
    if (requestUrl.pathname.startsWith('/build/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }

    // handle restaurant pages
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match(event.request, { ignoreSearch: true })
        .then(response => (response || fetch(event.request))));
    }

    // fetch everything else
    event.respondWith(caches.match(event.request)
      .then(response => response || fetch(event.request)));
  };

  const handleExternalRequest = (event, id) => {

  };
  // if request is to server

  // if request is local
  handleLocalRequest(event);
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then(cacheNames => Promise.all(cacheNames
      .filter(cacheName => cacheName.startsWith('static-') && !allCaches.includes(cacheName))
      .map(cacheName => caches.delete(cacheName)))));
});
