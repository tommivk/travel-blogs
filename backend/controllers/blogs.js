const Blog = require('../models/blog')
const User = require('../models/user')
const blogsRouter = require('express').Router()

blogsRouter.get('/', async (req, res) => {
  console.log('asd')
  const blogs = await Blog.find({})
  res.json(blogs.map((blog) => blog.toJSON()))
})

blogsRouter.post('/', async (req, res) => {
  const body = req.body
  const user = await User.findOne({ username: body.username })
  console.log(user)
  const userID = user._id
  console.log(userID)
  const newBlog = new Blog({
    title: body.title,
    author: userID,
    date: Date.now(),
    content: body.content,
    stars: [],
    headerImage: body.headerImage,
    location: body.location,
  })

  const savedBlog = await newBlog.save()
  res.json(savedBlog.toJSON())
})

module.exports = blogsRouter
