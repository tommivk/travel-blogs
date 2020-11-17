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
    description: body.description,
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

blogsRouter.put('/:id/star', async (req, res) => {
  const body = req.body

  try {
    const token = getTokenFrom(req)

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).send().end()
    }
    if (body.action !== 'add' && body.action !== 'remove') {
      return res.status(401).send().end
    }
    if (body.action === 'add') {
      if (blog.stars.includes(user._id)) {
        return res.status(401).send().end()
      }
      const updatedBlog = {
        stars: blog.stars.concat(user._id),
      }

      const newBlog = await Blog.findByIdAndUpdate(blog.id, updatedBlog, {
        new: true,
      }).populate('author')

      res.json(newBlog.toJSON())
    }
    if (body.action === 'remove') {
      const userVoted = blog.stars.includes(user._id)
      console.log(userVoted)
      if (!userVoted) {
        return res.status(401).send().end()
      }
      const updatedBlog = {
        stars: blog.stars.filter((star) =>
          star._id.toString() === user._id.toString() ? null : star
        ),
      }

      const newBlog = await Blog.findByIdAndUpdate(blog.id, updatedBlog, {
        new: true,
      }).populate('author')

      res.json(newBlog.toJSON())
    }
  } catch (error) {
    console.log(error)
  }
})

module.exports = blogsRouter
