require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = 8008
const cors = require('cors')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const MongoURI = process.env.MONGO_DB_URI
mongoose.connect(MongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
