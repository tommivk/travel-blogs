const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (req, res, next) => {
  try {
    const { body } = req;
    if (!body.username || !body.password) {
      return res.status(401).send({ error: 'Username and password fields cannot be empty' });
    }

    const user = await User.findOne({ username: body.username }).populate({ path: 'blogs', model: 'Blog', populate: { path: 'author', model: 'User' } }).populate('pictures');

    const passwordCorrect = user === null
      ? false : await bcrypt.compare(body.password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: 'Wrong credentials',
      });
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);

    return res.status(200).send({
      token,
      avatar: user.avatar,
      username: user.username,
      pictures: user.pictures,
      blogs: user.blogs,
      id: user._id,
      joinDate: user.joinDate,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = loginRouter;
