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
      joinDate: new Date(),
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

usersRouter.put('/:id/subscription', async (req, res, next) => {
  try {
    const body = req.body
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken) {
      console.log(token)
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    const userToSubscribe = await User.findById(req.params.id)

    if (!user || !userToSubscribe) {
      return res.status(400).send()
    }

    if (body.blogSubscription) {
      const isSubscribed = await userToSubscribe.blogSubscribers.find(
        (s) => s._id.toString() === user._id.toString()
      )
      if (!isSubscribed) {
        userToSubscribe.blogSubscribers.push(user)
      }
    }

    if (body.pictureSubscription) {
      const isSubscribed = await userToSubscribe.pictureSubscribers.find(
        (s) => s._id.toString() === user._id.toString()
      )
      if (!isSubscribed) {
        userToSubscribe.pictureSubscribers.push(user)
      }
    }

    if (!body.blogSubscription) {
      userToSubscribe.blogSubscribers = userToSubscribe.blogSubscribers.filter(
        (s) => s._id.toString() !== user._id.toString()
      )
    }

    if (!body.pictureSubscription) {
      userToSubscribe.pictureSubscribers = userToSubscribe.pictureSubscribers.filter(
        (s) => s._id.toString() !== user._id.toString()
      )
    }

    const result = await userToSubscribe.save()

    res.status(200).send(result)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
