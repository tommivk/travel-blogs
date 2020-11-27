const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const blogsRouter = require('express').Router()

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({})
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      })
      .populate({ path: 'author', model: 'User' })

    res.json(blogs.map((blog) => blog.toJSON()))
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body

    const token = getTokenFrom(req)

    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const userID = user._id

    const newBlog = new Blog({
      title: body.title,
      description: body.description,
      author: userID,
      date: Date.now(),
      content: body.content,
      stars: [],
      headerImageURL: body.headerImageURL,
      locations: body.locations,
      comments: [],
    })

    const savedBlog = await newBlog.save()
    await savedBlog.populate('author').execPopulate()

    res.json(savedBlog.toJSON())
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/:id/comments', async (req, res, next) => {
  try {
    const blogId = req.params.id
    const body = req.body

    const token = getTokenFrom(req)

    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = await Blog.findById(blogId)
    if (!blog) {
      return res.status(500).send()
    }
    const comment = new Comment({
      user: user._id,
      content: body.content,
      date: new Date(),
    })
    const newComment = await comment.save()
    const newBlog = blog
    newBlog.comments = [newComment].concat(newBlog.comments)

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, newBlog, {
      new: true,
    })
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      })
      .populate({ path: 'author', model: 'User' })

    res.json(updatedBlog.toJSON())
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id/star', async (req, res, next) => {
  try {
    const body = req.body
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
      })
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: { path: 'user', model: 'User' },
        })
        .populate({ path: 'author', model: 'User' })

      console.log(newBlog)

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
      })
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: { path: 'user', model: 'User' },
        })
        .populate({ path: 'author', model: 'User' })

      res.json(newBlog.toJSON())
    }
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter
