const picturesRouter = require('express').Router()
const jwt = require('jsonwebtoken')

const Picture = require('../models/picture')
const User = require('../models/user')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

picturesRouter.get('/', async (req, res) => {
  const pictures = await Picture.find({})
  res.json(pictures.map((p) => p.toJSON()))
})

picturesRouter.post('/', async (req, res) => {
  const body = req.body
  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  try {
    const user = await User.findById(decodedToken.id)

    const newPicture = new Picture({
      imgURL: body.imgURL,
      date: Date.now(),
      user: user._id,
      public: body.public,
      location: body.location,
    })

    const savedPicture = await newPicture.save()
    console.log('saved: ', savedPicture)
    user.pictures = user.pictures.concat(savedPicture._id)
    await user.save()
    res.json(savedPicture.toJSON())
  } catch (error) {
    console.log(error)
    return res.status(500).send()
  }
})

module.exports = picturesRouter
