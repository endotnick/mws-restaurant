# Mobile Web Specialist Certification Course

## Live Demo:
![](restaurant_reviews.gif)
Please note that this app is currently hosted on Heroku's free tier, so the first load will be weird while the dynos spin up, it should run normally after about 20 seconds.  
https://mws-reviews.herokuapp.com

## Project Submission: Stage 3
For this stage of the project, the following improvements were made:
1. Add a form to allow users to submit their own reviews.
2. Add functionality to defer submission of the form until connection is re-established.
3. Add functionality to mark a restaurant as a favorite.
4. Meet the updated performance requirements:
    - Progressive Web App score should be at 90 or better: *currently 92.*
    - Performance score should be at 90 or better: *currently 98.*
    - Accessibility score should be at 90 or better: *currently 94.*

### Previous Stages:
#### Stage 2

For this stage of the project, I was tasked with updating my project to make the following improvements:
1. Use server data instead of local memory
2. Use IndexedDB to cache JSON responses
3. Meet the minimum performance requirements
    - Progressive Web App score should be at 90 or better: *at 91 when submitted.*
    - Performance score should be at 70 or better: *at 95 when submitted.*
    - Accessibility score should be at 90 or better: *at 94 when submitted.*

#### Stage 1

For this stage of the project, I was provided with a static website and made the following improvements:
1. Made the site fully responsive
2. Improved accessibilty for all users
3. Implemented a Service Worker to cache and serve static assets

## To Run Locally:
---
### Installation:
#### Clone and run dev server:
    git clone https://github.com/udacity/mws-restaurant-stage-3.git
    npm install
    npm install sails -g
    node server
    
#### Clone the repository and build the project in separate folder: 
Images are generated using gulp, so you'll need the gulp-cli installed locally (https://gulpjs.com/).

    git clone https://github.com/endotnick/mws-restaurant.git
    npm install
    npm run build
    
#### Launch a webserver from project folder:
    python3 -m http.server 8000   

#### Navigate to localhost:8000
---
#### Credits
Icon made by [iconnice](https://www.flaticon.com/authors/iconnice) from www.flaticon.com
