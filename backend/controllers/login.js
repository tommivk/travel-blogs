const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const admin = require('firebase-admin')

loginRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body
    if (!body.username || !body.password) {
      return res.send(401).end()
    }

    const user = await User.findOne({ username: body.username })

    const passwordCorrect =
      user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash)

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: 'invalid username or password',
      })
    }

    await user.populate('pictures').populate('blogs').execPopulate()

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)
    console.log(token)
    const fbtoken = await admin
      .auth()
      .createCustomToken(userForToken.id.toString() + process.env.FBSECRET)

    res.status(200).send({
      token,
      fbtoken,
      avatar: user.avatar,
      username: user.username,
      pictures: user.pictures,
      blogs: user.blogs,
      id: user._id,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = loginRouter
