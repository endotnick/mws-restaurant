import idb from 'idb';

const staticCache = 'static-cache-v3';
const imageCache = 'image-cache-v1';
const allCaches = [staticCache, imageCache];

const dbPromise = idb.open('locations-db', 3, (upgradeDb) => {
  switch (upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore('locations');
    case 1:
      upgradeDb.createObjectStore('reviews');
    case 2:
      upgradeDb.createObjectStore('pending');
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCache)
    .then(cache => cache.addAll([
      '/',
      '/index.html',
      '/build/js/main.js',
      '/build/js/restaurant_info.js',
      '/src/css/styles.css',
      '/restaurant.html',
    ])
      .catch((error) => {
        console.error(error);
      })));
});

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

  // fetch everything else
  event.respondWith(caches.match(event.request, { ignoreSearch: true })
    .then(response =>
      response || fetch(event.request)
        .then(innerResponse => caches.open(staticCache)
          .then((cache) => {
            if (event.request.url.indexOf('mapbox') === -1) {
              cache.put(event.request, innerResponse.clone());
            }
            return innerResponse;
          })))
    .catch((error) => {
      throw error;
    }));
};

const handleRequest = (event, id, target) => {
  event.respondWith(dbPromise
    .then(db => db.transaction(target).objectStore(target).get(id))
    .then(data => (data) || fetch(event.request)
      .then(response => response.json())
      .then(json => dbPromise
        .then((db) => {
          const store = db.transaction(target, 'readwrite').objectStore(target);
          store.put(json, id);
          if (id === -1) { // if we got the full set,
            // store each element separately
            json.forEach((restaurant) => {
              store.put(restaurant, restaurant.id);
            });
          }
          return json;
        })))
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => new Response(error)));
};

const handleExternalRequest = (event, id) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.href.indexOf('reviews') > -1) {
    handleRequest(event, id, 'reviews');
  } else {
    handleRequest(event, id, 'locations');
  }
};

const putData = (data, index, store) => {
  dbPromise.then((db) => {
    const tx = db.transaction(store, 'readwrite').objectStore(store);
    tx.put(data, index);
  });
};

const updateFavorite = (event, query, id) => {
  const status = (query.match(/[^=]+$/)[0].toLowerCase() === 'true');  
  const store = 'locations';
  // update all restaurants
  dbPromise
    .then((db) => {
      const tx = db.transaction(store, 'readwrite').objectStore(store);
      tx.get(-1)
        .then((restaurants) => {
          const restaurant = restaurants.filter(r => r.id === id)[0];
          restaurant.is_favorite = status;
          putData(restaurants, -1, store);
        });
    });

  // update individual restaurant
  dbPromise
    .then((db) => {
      const tx = db.transaction(store, 'readwrite').objectStore(store);
      tx.get(id)
        .then((restaurant) => {
          restaurant.is_favorite = status;
          putData(restaurant, id, store);
        });
    });
};

const createReview = (request) => {
  const store = 'reviews';
  request.json()
    .then((body) => {
      dbPromise
        .then((db) => {
          const tx = db.transaction(store, 'readwrite').objectStore(store);
          const id = `${body.restaurant_id}`;
          tx.get(id)
            .then((restaurant) => {
              restaurant.push(body);
              putData(restaurant, id, store);
            });
        });
    });
};

const addPendingUpdate = (request) => {
  const { url } = request;
  const { method } = request;
  const store = 'pending';
  request.json()
    .then((body) => {
      const data = {
        url,
        method,
        body,
      };
      putData(data, Date.now(), store);
    })
    .catch((error) => {
      console.log(error);
    });
};

const create = (event) => {
  const requestUrl = new URL(event.request.url);
  // update local db
  if (requestUrl.pathname === '/reviews/') {
    createReview(event.request.clone());
  }
  const clone = event.request.clone();
  // update rest server
  fetch(event)
    .catch((error) => {
      // queue updates if failed
      addPendingUpdate(clone);
    });
};

const read = (event) => {
  const requestUrl = new URL(event.request.url);
  let id;
  if (requestUrl.port === '1337') {
    if (requestUrl.pathname === '/reviews/') {
      id = requestUrl.searchParams.get('restaurant_id');
    } else {
      const last = requestUrl.pathname.match(/[^/]+$/)[0];
      id = (last === 'restaurants') ? -1 : parseInt(last, 10);
    }
    handleExternalRequest(event, id);
  } else {
    handleLocalRequest(event, requestUrl);
  }
};

const update = (event) => {
  const requestUrl = new URL(event.request.url);
  const query = requestUrl.search;
  const id = parseInt(requestUrl.pathname.match(/restaurants\/(.+)\/$/)[1], 10);

  // update local db
  if (query.indexOf('favorite') > -1) {
    updateFavorite(event, query, id);
  }

  // update rest server
  fetch(event)
    .catch((error) => {
      // queue updates if failed
      throw error; // offline
    });
};

self.addEventListener('fetch', (event) => {
  switch (event.request.method) {
    case 'PUT':
      update(event);
      break;
    case 'POST':
      create(event);
      break;
    default:
      read(event);
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then(cacheNames => Promise.all(cacheNames
      .filter(cacheName => cacheName.startsWith('static-') && !allCaches.includes(cacheName))
      .map(cacheName => caches.delete(cacheName)))));
});
