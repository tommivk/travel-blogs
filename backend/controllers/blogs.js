const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const uploadImage = require('../utils/uploadImage');
const multer = require('../utils/multer');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({})
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      })
      .populate({ path: 'author', model: 'User' });

    res.json(blogs.map((blog) => blog.toJSON()));
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', multer.single('image'), async (req, res, next) => {
  try {
    const { body } = req;

    const token = getTokenFrom(req);

    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const { imgURL, firebaseID } = await uploadImage(req.file, user._id, 'blogcovers/');

    const locations = JSON.parse(body.locations);

    const newBlog = new Blog({
      title: body.title,
      description: body.description,
      author: user._id,
      date: Date.now(),
      content: body.content,
      stars: [],
      headerImageURL: imgURL,
      headerImageID: firebaseID,
      locations,
      comments: [],
    });

    const savedBlog = await newBlog.save();
    user.blogs = user.blogs.concat(savedBlog);
    await user.save();
    await savedBlog.populate('author').execPopulate();

    if (user.blogSubscribers.length > 0) {
      const notification = new Notification({
        sender: user,
        receivers: user.blogSubscribers,
        readBy: [],
        content: {
          message: `New blog created by ${user.username}`,
          contentType: 'blog',
          contentID: `${savedBlog.id}`,
        },
        createdAt: new Date(),
      });

      await notification.save();
    }

    return res.json(savedBlog.toJSON());
  } catch (error) {
    return next(error);
  }
});

blogsRouter.delete('/:blogId', async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);
    const blog = await Blog.findById(blogId);

    if (!blog || !user) {
      return res.status(500).send();
    }

    if (blog.author._id.toString() !== user._id.toString()) {
      return res.status(401).send();
    }
    user.blogs = user.blogs.filter((b) => b._id.toString() !== blogId);
    await user.save();
    await Blog.findByIdAndDelete(blogId);

    if (blog.headerImageID) {
      await admin.storage().bucket(process.env.BUCKET_NAME).file(`blogcovers/${user.id}/${blog.headerImageID}`).delete();
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

blogsRouter.delete('/:blogId/comments/:commentId', async (req, res, next) => {
  try {
    const { blogId, commentId } = req.params;
    const token = getTokenFrom(req);

    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);
    const comment = await Comment.findById(commentId);

    if (comment.user.toString() !== user._id.toString()) {
      return res.status(401).send();
    }

    const blog = await Blog.findById(blogId);

    if (!blog.comments.includes(commentId)) {
      return res.status(400).send();
    }

    blog.comments = blog.comments.filter((c) => c._id.toString() !== commentId);
    const newBlog = await blog.save();

    await Comment.findByIdAndDelete(commentId);

    await newBlog.populate({
      path: 'comments',
      model: 'Comment',
      populate: { path: 'user', model: 'User' },
    })
      .populate({ path: 'author', model: 'User' }).execPopulate();

    return res.send(newBlog);
  } catch (error) {
    return next(error);
  }
});

blogsRouter.post('/:id/comments', async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const { body } = req;

    const token = getTokenFrom(req);

    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(400).send();
    }

    const comment = new Comment({
      user: user._id,
      content: body.content,
      date: new Date(),
    });

    const newComment = await comment.save();
    const newBlog = blog;
    newBlog.comments = [newComment].concat(newBlog.comments);

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, newBlog, {
      new: true,
    })
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      })
      .populate({ path: 'author', model: 'User' });

    return res.json(updatedBlog.toJSON());
  } catch (error) {
    return next(error);
  }
});

blogsRouter.put('/:id/star', async (req, res, next) => {
  try {
    const { body } = req;
    const token = getTokenFrom(req);

    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send().end();
    }
    if (body.action !== 'add' && body.action !== 'remove') {
      return res.status(401).send().end;
    }
    if (body.action === 'add') {
      if (blog.stars.includes(user._id)) {
        return res.status(401).send().end();
      }
      const updatedBlog = {
        stars: blog.stars.concat(user._id),
      };

      const newBlog = await Blog.findByIdAndUpdate(blog.id, updatedBlog, {
        new: true,
      })
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: { path: 'user', model: 'User' },
        })
        .populate({ path: 'author', model: 'User' });

      return res.json(newBlog.toJSON());
    }
    if (body.action === 'remove') {
      const userVoted = blog.stars.includes(user._id);

      if (!userVoted) {
        return res.status(401).send().end();
      }

      const updatedBlog = {
        stars: blog.stars
          .filter((star) => (star._id.toString() === user._id.toString() ? null : star)),
      };

      const newBlog = await Blog.findByIdAndUpdate(blog.id, updatedBlog, {
        new: true,
      })
        .populate({
          path: 'comments',
          model: 'Comment',
          populate: { path: 'user', model: 'User' },
        })
        .populate({ path: 'author', model: 'User' });
      return res.json(newBlog.toJSON());
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = blogsRouter;
