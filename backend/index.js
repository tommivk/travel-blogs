const express = require('express')
const app = express()
const PORT = 8008
const cors = require('cors')
app.use(cors())

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
