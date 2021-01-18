const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const admin = require('firebase-admin');
const User = require('../models/user');

loginRouter.post('/', async (req, res, next) => {
  try {
    const { body } = req;
    if (!body.username || !body.password) {
      return res.send(401).end();
    }

    const user = await User.findOne({ username: body.username }).populate({ path: 'blogs', model: 'Blog', populate: { path: 'author', model: 'User' } }).populate('pictures');

    const passwordCorrect = user === null
      ? false : await bcrypt.compare(body.password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: 'invalid username or password',
      });
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);
    console.log(token);
    const fbtoken = await admin
      .auth()
      .createCustomToken(userForToken.id.toString() + process.env.FBSECRET);

    return res.status(200).send({
      token,
      fbtoken,
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
