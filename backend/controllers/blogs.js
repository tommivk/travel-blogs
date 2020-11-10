const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const blogsRouter = require('express').Router()

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', async (req, res) => {
  console.log('asd')
  const blogs = await Blog.find({}).populate('author')
  res.json(blogs.map((blog) => blog.toJSON()))
})

blogsRouter.post('/', async (req, res) => {
  const body = req.body
  const token = getTokenFrom(req)

  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  console.log(token)
  const user = await User.findById(decodedToken.id)
  console.log(user)
  const userID = user._id
  console.log(userID)
  const newBlog = new Blog({
    title: body.title,
    author: userID,
    date: Date.now(),
    content: body.content,
    stars: [],
    headerImageURL: body.headerImageURL,
    locations: body.locations,
  })

  const savedBlog = await newBlog.save()
  res.json(savedBlog.toJSON())
})

module.exports = blogsRouter
