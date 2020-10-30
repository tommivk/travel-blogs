require('dotenv').config()
const express = require('express')
const app = express()
const PORT = 8008
const cors = require('cors')
const usersRouter = require('./controllers/users')
app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
