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
  const pictures = await Picture.find({}).populate('user')
  res.json(pictures.map((p) => p.toJSON()))
})

picturesRouter.put('/:id/vote', async (req, res) => {
  const body = req.body
  try {
    const picture = await Picture.findById(req.params.id)

    if (!picture) {
      return res.status(404).send().end()
    }

    if (body.dir !== 1 && body.dir !== -1) {
      return res.status(400).send().end()
    }

    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const usersVote = await picture.votes.find(
      (vote) => vote.user.toString() === user._id.toString()
    )

    if (usersVote && usersVote.dir === body.dir) {
      return res.status(400).send().end()
    }
    if (usersVote) {
      picture.votes = picture.votes.map((vote) =>
        vote.user.toString() === user._id.toString()
          ? (vote.dir = body.dir)
          : vote
      )
    } else {
      picture.votes = picture.votes.concat({
        user: user._id,
        dir: body.dir,
      })
    }
    const newPicture = {
      voteResult: usersVote
        ? (picture.voteResult += body.dir * 2)
        : (picture.voteResult += body.dir),
      votes: picture.votes,
    }
    const updatedPicture = await Picture.findByIdAndUpdate(
      picture._id,
      newPicture,
      { new: true }
    ).populate('user')
    res.json(updatedPicture.toJSON())
  } catch (error) {
    console.log(error)
  }
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
      title: body.title,
      voteResult: 0,
      votes: [],
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
