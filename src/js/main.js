import DBHelper from './dbhelper';

let newMap;

/**
 * Register Servcie Worker
 */
const registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('Service worker registered!');
  }).catch((error) => {
    console.error('Registration failed!', error);
  });
};

const setClassFavorite = (element, status) => {
  if (status !== true) {
    element.classList.remove('favorite');
    element.classList.add('not_favorite');
    element.setAttribute('aria-label', 'favorite this restaurant');
  } else {
    element.classList.add('favorite');
    element.classList.remove('not_favorite');
    element.setAttribute('aria-label', 'remove this restaurant as favorite');
  }
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  const sizes = [200, 400, 600, 800];
  let sources = '';
  let filename = DBHelper.imageUrlForRestaurant(restaurant); // '/img/1.jpg'
  filename = filename.replace(/(\/img\/)|(\.jpg)/g, ''); // '1'
  sizes.forEach((size) => {
    sources += `/build/img/${filename}-${size}px.webp ${size}w, `;
  });
  image.setAttribute('srcset', sources);
  image.src = `/build/img/${filename}-400px.webp`;
  const alt = restaurant.alt || `image for ${restaurant.name}`;
  image.setAttribute('alt', alt);
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const favorite = document.createElement('button');
  favorite.innerHTML = '❤';
  favorite.classList.add('btn_fav');
  const initStatus = (`${restaurant.is_favorite}`.toLowerCase() === 'true');
  setClassFavorite(favorite, initStatus);
  favorite.onclick = () => {
    const currentStatus = (`${restaurant.is_favorite}`.toLowerCase() === 'true');
    DBHelper.updateFavorite(restaurant.id, !currentStatus);
    restaurant.is_favorite = !currentStatus;
    setClassFavorite(favorite, !currentStatus);
  };
  li.append(favorite);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', `View details about ${restaurant.name}`);
  li.append(more);

  return li;
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach((neighborhood) => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach((cuisine) => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach((restaurant) => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, newMap);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
    marker.on('click', onClick);
  });
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach((restaurant) => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Update page and map for current restaurants.
 */
window.updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;
  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};
/*
* Initialize leaflet map, called from HTML.
*/
const initMap = () => {
  newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false,
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiZWxsaW1pc3QiLCJhIjoiY2psc2dmbmhhMGZ1YzNwbzRyd3Q4NzY4biJ9.ojVHoAqsHCVB9BfJX_ikWw',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
  }).addTo(newMap);
  window.updateRestaurants();
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  initMap();
  fetchNeighborhoods();
  fetchCuisines();
  DBHelper.clearPending();
});
