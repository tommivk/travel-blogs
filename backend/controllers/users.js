const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs').populate('pictures')
  res.json(users.map((user) => user.toJSON()))
})

usersRouter.post('/', async (req, res) => {
  const body = req.body
  if (!body.username || !body.password) {
    return res.send(400).end()
  }
  try {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      passwordHash,
    })

    const savedUser = await user.save()
    res.json(savedUser.toJSON())
  } catch (error) {
    res.status(400).send(error)
  }
})

usersRouter.put('/', async (req, res) => {
  const body = req.body
  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const updatedUser = {
    avatar: body.avatar,
  }
  const newUser = await User.findByIdAndUpdate(decodedToken.id, updatedUser, {
    new: true,
  }).populate('pictures')
  console.log(newUser.toJSON())
  res.status(200).send(newUser.toJSON())
})

module.exports = usersRouter
