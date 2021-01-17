const testingRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const Comment = require('../models/comment');
const Picture = require('../models/picture');
const Notification = require('../models/notification');

testingRouter.post('/reset', async (request, response) => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  await Comment.deleteMany({});
  await Picture.deleteMany({});
  await Notification.deleteMany({});

  return response.status(204).end();
});

module.exports = testingRouter;
