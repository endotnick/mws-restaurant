import idb from 'idb';

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

/**
 * Common database helper functions.
 */
export default class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_REVIEWS_URL() {
    const port = 1337;
    return `http://localhost:${port}/reviews`;
  }

  static clearPending() {
    const store = 'pending';
    dbPromise
      .then((db) => {
        const keyTx = db.transaction(store, 'readwrite').objectStore(store);
        keyTx.getAllKeys()
          .then((eventKeys) => {
            eventKeys.forEach((key) => {
              const eventTx = db.transaction(store, 'readwrite').objectStore(store);
              eventTx.get(key)
                .then((data) => {
                  // fetch may be making more entries
                  fetch(data.url, {
                    method: data.method,
                    body: JSON.stringify(data.body),
                  })
                    .then((response) => {
                      if (response.ok) {
                        const delTx = db.transaction(store, 'readwrite').objectStore(store);
                        delTx.delete(key);
                      }
                    });
                });
            });
          });
      });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, id) {
    // use fetch API instead
    const target = id ? `${DBHelper.DATABASE_URL}/${id}` : DBHelper.DATABASE_URL;
    fetch(target)
      .then(response => response.json())
      .then(restaurants => callback(null, restaurants))
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurant) => {
      if (error) {
        callback(error, null);
      } else if (restaurant) { // Got the restaurant
        callback(null, restaurant);
      } else { // Restaurant does not exist in the database
        callback('Restaurant does not exist', null);
      }
    }, id);
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph ? `/img/${restaurant.photograph}` : `/img/${restaurant.id}.jpg`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
      },
    );
    marker.addTo(map);
    return marker;
  }

  static updateFavorite(id, status) {
    const target = `${this.DATABASE_URL}/${id}/?is_favorite=${status}`;
    fetch(target, {
      method: 'PUT',
    });
  }

  static postReview(data) {
    const target = `${this.DATABASE_REVIEWS_URL}/`;
    fetch(target, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
