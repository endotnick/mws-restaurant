import idb from 'idb';

const staticCache = 'static-cache-v3';
const imageCache = 'image-cache-v1';
const allCaches = [staticCache, imageCache];

const dbPromise = idb.open('locations-db', 1, (upgradeDb) => {
  upgradeDb.createObjectStore('locations');
});

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCache)
    .then(cache => cache.addAll([
      '/',
      '/build/js/main.js',
      '/build/js/restaurant_info.js',
      '/src/css/styles.css',
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

  const handleLocalRequest = (event, requestUrl) => {
    // handle images
    if (requestUrl.pathname.startsWith('/build/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }

    // handle restaurant pages
    /*
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match(event.request, { ignoreSearch: true })
        .then(response => (response || fetch(event.request))));
    }
    */
    // fetch everything else
    event.respondWith(caches.match(event.request, { ignoreSearch: true })
      .then((response) => {
        return response || fetch(event.request)
          .then((innerResponse) => {
            return caches.open(staticCache)
              .then((cache) => {
                if (event.request.url.indexOf('maps') === -1) {
                  cache.put(event.request, innerResponse.clone());
                }
                return innerResponse;
              });
          });
      })
      .catch((error) => {
        console.error(error);
      }));
  };

  const handleExternalRequest = (event, id) => {
    event.respondWith(dbPromise
      .then(db => db.transaction('locations').objectStore('locations').get(id))
      .then(data => (data && data.data) || fetch(event.request)
        .then(response => response.json())
        .then(json => dbPromise
          .then((db) => {
            const store = db.transaction('locations', 'readwrite').objectStore('locations');
            store.put(json, id);
            return json;
          })))
      .then(response => new Response(JSON.stringify(response)))
      .catch(error => new Response(error)));
  };
  const requestUrl = new URL(event.request.url);
  if (requestUrl.port === '1337') {
    handleExternalRequest(event, requestUrl.searchParams.get('id') || 'restaurants');
  } else {
    handleLocalRequest(event, requestUrl);
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then(cacheNames => Promise.all(cacheNames
      .filter(cacheName => cacheName.startsWith('static-') && !allCaches.includes(cacheName))
      .map(cacheName => caches.delete(cacheName)))));
});
