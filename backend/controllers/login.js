const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const admin = require('firebase-admin')

loginRouter.post('/', async (request, response) => {
  const body = request.body
  const user = await User.findOne({ username: body.username }).populate(
    'pictures'
  )
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  try {
    const token = jwt.sign(userForToken, process.env.SECRET)

    const fbtoken = await admin
      .auth()
      .createCustomToken(userForToken.id.toString() + process.env.FBSECRET)

    response.status(200).send({
      token,
      fbtoken,
      avatar: user.avatar,
      username: user.username,
      pictures: user.pictures,
      id: user._id,
    })
  } catch (error) {
    console.log(error.message)
    response.status(500).send()
  }
})

module.exports = loginRouter
