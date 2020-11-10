require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const admin = require('firebase-admin')
//GOOGLE_APPLICATION_CREDENTIALS="/path/credentials.json"
const PORT = 8008
const cors = require('cors')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const blogsRouter = require('./controllers/blogs')
const picturesRouter = require('./controllers/pictures')
const MongoURI = process.env.MONGO_DB_URI
mongoose.connect(MongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://travelblogs-ac98f.firebaseio.com',
})

app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/pictures', picturesRouter)
app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
