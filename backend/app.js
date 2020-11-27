require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const admin = require('firebase-admin')
const cors = require('cors')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const blogsRouter = require('./controllers/blogs')
const picturesRouter = require('./controllers/pictures')
let MongoURI = process.env.MONGO_DB_URI
let FirebaseURI = process.env.FIREBASE_DB_URI

if (process.env.NODE_ENV === 'test') {
  Mongo_TEST_URI = process.env.MONGO_DB_TEST_URI
  Firebase_TEST_URI = process.env.FIREBASE_DB_TEST_URI
}

mongoose.connect(MongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: FirebaseURI,
})

app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/pictures', picturesRouter)

const errorHandler = (error, req, res, next) => {
  console.log('error: ', error.message)

  if (error.name === 'JsonWebTokenError') {
    res.send(401).send({ error: 'token missing or invalid' })
  }

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

module.exports = app
