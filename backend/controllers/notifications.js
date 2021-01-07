const notificationsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Notification = require('../models/notification');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

notificationsRouter.get('/', async (req, res) => {
  const notifications = await Notification.find({});

  res.json(notifications.map((n) => n.toJSON()));
});

notificationsRouter.get('/user/:id', async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      receivers: { $in: req.params.id },
    });

    res.send(notifications.map((n) => n.toJSON()));
  } catch (error) {
    next(error);
  }
});

notificationsRouter.put('/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(400).send().end();
    }

    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    notification.readBy.push(user);
    const savedNotification = await notification.save();

    return res.send(savedNotification.toJSON());
  } catch (error) {
    return next(error);
  }
});

module.exports = notificationsRouter;
