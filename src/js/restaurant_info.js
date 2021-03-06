import DBHelper from './dbhelper';

let restaurant;
let newMap;

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const header = document.createElement('div');
  header.className = 'review-header';
  li.setAttribute('tabindex', '0');
  li.appendChild(header);

  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'review-name';
  header.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toDateString();
  date.className = 'review-date';
  header.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'review-rating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'review-comments';
  li.appendChild(comments);

  return li;
};

const submitReview = () => {
  const reviewer = document.getElementById('new-review-name').value;
  const reviewRating = parseInt(document.getElementById('new-review-rating').value, 10);
  const comment = document.getElementById('new-review-comment').value;
  const requestUrl = new URL(window.location.href);
  const id = parseInt(requestUrl.searchParams.get('id'), 10);

  const body = {
    restaurant_id: id,
    name: reviewer,
    createdAt: Date.now(),
    rating: reviewRating,
    comments: comment,
  };
  DBHelper.postReview(body);
  window.location.reload();
};

const createReviewForm = () => {
  const review = {
    name: 'Your review!',
    rating: '?',
    comments: '',
    createdAt: Date.now(),
  };

  const li = createReviewHTML(review);
  li.removeChild(li.getElementsByClassName('review-comments')[0]);
  li.removeChild(li.getElementsByClassName('review-rating')[0]);
  const form = document.createElement('form');
  form.id = 'new-review-form';

  const nameLabel = document.createElement('label');
  nameLabel.innerHTML = 'Author: ';
  nameLabel.name = 'name-title';
  nameLabel.setAttribute('for', 'new-review-name');
  nameLabel.className = 'new-review-subtitle';
  form.appendChild(nameLabel);

  const name = document.createElement('input');
  name.type = 'text';
  name.name = 'reviewer-name';
  name.id = 'new-review-name';
  form.appendChild(name);

  const ratingLabel = document.createElement('label');
  ratingLabel.innerHTML = 'Rating: ';
  ratingLabel.name = 'rating-title';
  ratingLabel.setAttribute('for', 'new-review-rating');
  ratingLabel.className = 'new-review-subtitle';
  form.appendChild(ratingLabel);

  const rating = document.createElement('select');
  rating.name = 'Rating';
  rating.id = 'new-review-rating';

  for (let i = 1; i < 6; i += 1) {
    const option = document.createElement('option');
    option.text = i;
    rating.add(option);
  }

  form.appendChild(rating);

  const br = document.createElement('br');
  form.appendChild(br);

  const commentLabel = document.createElement('label');
  commentLabel.innerHTML = 'Comments: ';
  commentLabel.name = 'comments-title';
  commentLabel.setAttribute('for', 'new-review-comment');
  commentLabel.className = 'new-review-subtitle';
  form.appendChild(commentLabel);

  const comments = document.createElement('textarea');
  comments.name = 'comment';
  comments.id = 'new-review-comment';
  form.appendChild(comments);

  const submit = document.createElement('input');
  submit.value = 'Submit';
  submit.id = 'new-review-submit';
  submit.type = 'button';
  submit.onclick = () => submitReview();
  form.appendChild(submit);

  li.appendChild(form);
  return li;
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewForm());
  reviews.forEach((review) => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

const getReviews = (location) => {
  const endpoint = `${DBHelper.DATABASE_REVIEWS_URL}/?restaurant_id=${location.id}`;
  fetch(endpoint)
    .then(response => response.json())
    .then(reviews => fillReviewsHTML(reviews));
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
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

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  getReviews(self.restaurant);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-role', 'Current Page');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, newMap);
    }
  });
};

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  DBHelper.clearPending();
});
