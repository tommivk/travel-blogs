# TravelBlogs

https://fast-basin-89854.herokuapp.com/

## Starting the app locally

### Prerequisites

Intitialize new Firebase project and create a firebase credentials json file

Create a Google maps api key for Maps JavaScript and Maps Static Apis https://developers.google.com/

Create a LocationIQ api key https://locationiq.com/

### Frontend
```
cd frontend
```

install dependencies with `npm install`

create `.env.local` file with following content
```
REACT_APP_GOOGLE_MAP_API_KEY = '<Your google maps api key>'
REACT_APP_GEOCODE_API_KEY = '<Your locationIQ api key>'
```

create a new folder `videos` to src folder containing video file named `background.mp4` 


start frontend with
```
npm start
```
 

### Backend
```
cd backend
```
install dependencies with  `npm install`

create .env file with following content
```
MONGO_DB_URI = '<Your mongoDB URI>'
MONGO_DB_TEST_URI = '<Your mongoDB test database URI>'
SECRET = '<Your secret string>'
DEFAULT_PICTURE_URL = '<default avatar picture url>'
FIREBASE_DB_URI = '<Your Firebase storage URI>'
FIREBASE_DB_TEST_URI = '<Your firebase test storage URI>'
BUCKET_NAME = '<Your firebase storage bucket name>'
```
  
#### Start backend 

in production mode with 
```
GOOGLE_APPICATION_CREDENTIALS="<Path to your firebase credentials json file>" npm run start
```
or in development mode with
```
GOOGLE_APPICATION_CREDENTIALS="<Path to your firebase credentials json file>" npm run dev
```
run tests with
```
GOOGLE_APPICATION_CREDENTIALS="<Path to your firebase credentials json file>" npm run test
```
### End To End Tests
 
Start backend with 
```
GOOGLE_APPICATION_CREDENTIALS="<Path to your firebase credentials json file>" npm run test:start
```
Start Frontend with
```
npm start
```
run Cypress end to end tests with 
```
cd frontend
```
```
npm run cypress:open
```
