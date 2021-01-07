const picturesRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Comment = require('../models/comment');
const Picture = require('../models/picture');
const Notification = require('../models/notification');
const User = require('../models/user');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

picturesRouter.get('/', async (req, res) => {
  const pictures = await Picture.find({})
    .populate('user')
    .populate('votes.user')
    .populate({
      path: 'comments',
      model: 'Comment',
      populate: { path: 'user', model: 'User' },
    });
  res.json(pictures.map((p) => p.toJSON()));
});

picturesRouter.delete('/:id/vote', async (req, res) => {
  try {
    const picture = await Picture.findById(req.params.id);
    if (!picture) {
      return res.status(404).send().end();
    }
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const usersVote = await picture.votes.find(
      (vote) => vote.user.toString() === user._id.toString()
    );

    if (!usersVote) {
      res.send(400).end();
    }
    if (usersVote.dir !== 1 && usersVote.dir !== -1) {
      res.send(400).end();
    }

    if (usersVote.dir === 1) {
      picture.voteResult -= 1;
    } else {
      picture.voteResult += 1;
    }

    picture.votes = await picture.votes.filter(
      (vote) => vote.user.toString() !== user._id.toString(),
    );

    const newPicture = await picture.save();
    await newPicture
      .populate('user')
      .populate('votes.user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      })
      .execPopulate();

    res.json(newPicture);
  } catch (error) {
    console.log(error);
  }
});

picturesRouter.put('/:id/vote', async (req, res) => {
  const { body } = req;
  try {
    const picture = await Picture.findById(req.params.id);

    if (!picture) {
      return res.status(404).send().end();
    }

    if (body.dir !== 1 && body.dir !== -1) {
      return res.status(400).send().end();
    }

    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const usersVote = await picture.votes.find(
      (vote) => vote.user.toString() === user._id.toString()
    );

    if (usersVote && usersVote.dir === body.dir) {
      return res.status(400).send().end();
    }
    if (usersVote) {
      picture.votes = picture.votes.map((vote) =>
        (vote.user.toString() === user._id.toString()
          ? (vote.dir = body.dir)
          : vote)
      );
    } else {
      picture.votes = picture.votes.concat({
        user: user._id,
        dir: body.dir,
      });
    }
    const newPicture = {
      voteResult: usersVote
        ? (picture.voteResult += body.dir * 2)
        : (picture.voteResult += body.dir),
      votes: picture.votes,
    };
    const updatedPicture = await Picture.findByIdAndUpdate(
      picture._id,
      newPicture,
      { new: true },
    )
      .populate('user')
      .populate('votes.user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      });
    console.log(updatedPicture);
    res.json(updatedPicture.toJSON());
  } catch (error) {
    console.log(error);
  }
});

picturesRouter.post('/', async (req, res) => {
  const { body } = req;
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  console.log(body);
  if (!token || !decodedToken) {
    return res.status(401).json({ error: 'token missing or invalid' });
  }

  try {
    const user = await User.findById(decodedToken.id);

    const newPicture = new Picture({
      imgURL: body.imgURL,
      firebaseID: body.firebaseID,
      date: Date.now(),
      user: user._id,
      public: body.public,
      location: body.location,
      title: body.title,
      voteResult: 0,
      votes: [],
      comments: [],
    });

    const savedPicture = await newPicture.save();

    user.pictures = user.pictures.concat(savedPicture._id);
    await user.save();

    if (body.public && user.pictureSubscribers.length > 0) {
      const notification = new Notification({
        sender: user,
        receivers: user.pictureSubscribers,
        readBy: [],
        content: {
          message: `New picture posted by ${user.username}`,
          contentType: 'picture',
          contentID: savedPicture.id,
        },
        createdAt: new Date(),
      });
      await notification.save();
    }

    return res.json(savedPicture.toJSON());
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});

picturesRouter.post('/:id/comment', async (req, res) => {
  const { body } = req;
  const pictureId = req.params.id;
  const token = getTokenFrom(req);
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const comment = new Comment({
      content: body.content,
      user: user._id,
      date: new Date(),
    });

    const newComment = await comment.save();
    const picture = await Picture.findById(req.params.id);

    picture.comments = [newComment].concat(picture.comments);

    const newPicture = await Picture.findByIdAndUpdate(pictureId, picture, {
      new: true,
    })
      .populate('user')
      .populate('votes.user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      });
    console.log(newPicture);
    return res.json(newPicture.toJSON());
  } catch (error) {
    return console.log(error);
  }
});

module.exports = picturesRouter;
