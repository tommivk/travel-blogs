require('dotenv').config();
const express = require('express');

const app = express();
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const cors = require('cors');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const blogsRouter = require('./controllers/blogs');
const picturesRouter = require('./controllers/pictures');
const noticationsRouter = require('./controllers/notifications');
const citiesRouter = require('./controllers/cities');

let MongoURI = process.env.MONGO_DB_URI;
let FirebaseURI = process.env.FIREBASE_DB_URI;

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  MongoURI = process.env.MONGO_DB_TEST_URI;
  FirebaseURI = process.env.FIREBASE_DB_TEST_URI;
}

mongoose.connect(MongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: FirebaseURI,
});

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/pictures', picturesRouter);
app.use('/api/notifications', noticationsRouter);
app.use('/api/cities', citiesRouter);

if (process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line global-require
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

const errorHandler = (error, req, res, next) => {
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).send({ error: 'token missing or invalid' });
  }

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === 'ImageUploadValidationError') {
    return res.status(401).send({ error: error.message });
  }

  return next(error);
};

app.use(errorHandler);

module.exports = app;
