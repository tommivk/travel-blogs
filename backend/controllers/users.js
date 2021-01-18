const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const Notification = require('../models/notification');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate({ path: 'blogs', model: 'Blog', populate: { path: 'author', model: 'User' } }).populate('pictures');
  res.json(users.map((user) => user.toJSON()));
});

usersRouter.post('/', async (req, res) => {
  const { body } = req;

  if (!body.username || !body.password) {
    return res.send(400).end();
  }

  if (body.password.length < 5) {
    return res
      .status(400)
      .send({ message: 'password must be at least 5 characters long' });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      passwordHash,
      joinDate: new Date(),
    });

    const savedUser = await user.save();

    const notification = new Notification({
      receivers: [savedUser.id],
      readBy: [],
      content: {
        message: `Welcome to travelblogs ${savedUser.username}!`,
        contentType: 'welcome',
        contentID: '',
      },
    });

    await notification.save();

    return res.json(savedUser.toJSON());
  } catch (error) {
    return res.status(400).send(error);
  }
});

usersRouter.put('/:userId', async (req, res, next) => {
  try {
    const { body } = req;
    const { userId } = req.params;
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    if (userId.toString() !== decodedToken.id.toString()) {
      return res.status(401).send();
    }

    const user = await User.findByIdAndUpdate(decodedToken.id, body, {
      new: true,
    }).populate('pictures').populate('blogs');

    const newUser = user.toJSON();
    newUser.token = token;

    return res.status(200).send(newUser);
  } catch (error) {
    return next(error);
  }
});

usersRouter.put('/:id/subscription', async (req, res, next) => {
  try {
    const { body } = req;
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);
    const userToSubscribe = await User.findById(req.params.id);

    if (!user || !userToSubscribe) {
      return res.status(400).send();
    }

    if (body.blogSubscription) {
      const isSubscribed = await userToSubscribe.blogSubscribers.find(
        (s) => s._id.toString() === user._id.toString(),
      );
      if (!isSubscribed) {
        userToSubscribe.blogSubscribers.push(user);
      }
    }

    if (body.pictureSubscription) {
      const isSubscribed = await userToSubscribe.pictureSubscribers.find(
        (s) => s._id.toString() === user._id.toString(),
      );
      if (!isSubscribed) {
        userToSubscribe.pictureSubscribers.push(user);
      }
    }

    if (!body.blogSubscription) {
      userToSubscribe.blogSubscribers = userToSubscribe.blogSubscribers.filter(
        (s) => s._id.toString() !== user._id.toString(),
      );
    }

    if (!body.pictureSubscription) {
      userToSubscribe.pictureSubscribers = userToSubscribe.pictureSubscribers.filter(
        (s) => s._id.toString() !== user._id.toString(),
      );
    }

    const updatedUser = await userToSubscribe.save();
    await updatedUser.populate('pictures').populate('blogs').execPopulate();

    return res.status(200).send(updatedUser);
  } catch (error) {
    return next(error);
  }
});

module.exports = usersRouter;
