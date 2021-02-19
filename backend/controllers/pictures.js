const picturesRouter = require('express').Router();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const Comment = require('../models/comment');
const Picture = require('../models/picture');
const Notification = require('../models/notification');
const User = require('../models/user');
const uploadImage = require('../utils/uploadImage');
const multer = require('../utils/multer');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }
  return null;
};

picturesRouter.get('/', async (req, res, next) => {
  try {
    const pictures = await Picture.find({ public: true })
      .populate('user')
      .populate('votes.user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      });
    return res.json(pictures.map((p) => p.toJSON()));
  } catch (error) {
    return next(error);
  }
});

picturesRouter.delete('/:pictureId', async (req, res, next) => {
  try {
    const { pictureId } = req.params;
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);
    const picture = await Picture.findById(pictureId);

    if (!user || !picture) {
      return res.status(500).send();
    }

    if (user._id.toString() !== picture.user._id.toString()) {
      return res.status(401).send();
    }

    user.pictures = user.pictures.filter((pic) => pic._id.toString() !== pictureId.toString());
    await user.save();

    await Picture.findByIdAndDelete(pictureId);

    await admin.storage().bucket(process.env.BUCKET_NAME).file(`images/${user.id}/${picture.firebaseID}`).delete();

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

picturesRouter.put('/:pictureID', async (req, res, next) => {
  try {
    const { pictureID } = req.params;

    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);
    const picture = await Picture.findById(pictureID);

    if (!user || !picture) {
      return res.status(500).send();
    }

    if (user._id.toString() !== picture.user._id.toString()) {
      return res.status(401).send();
    }

    if (req.body.public !== undefined) {
      const newData = {
        public: req.body.public,
      };

      const newPicture = await Picture.findByIdAndUpdate(pictureID, newData, { new: true }).populate('user');

      return res.status(200).send(newPicture);
    }

    return res.status(400).end();
  } catch (error) {
    return next(error);
  }
});

picturesRouter.delete('/:id/vote', async (req, res, next) => {
  try {
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);
    const picture = await Picture.findById(req.params.id);

    const usersVote = await picture.votes.find(
      (vote) => vote.user.toString() === user._id.toString(),
    );

    if (!usersVote) {
      return res.status(400).end();
    }

    const newData = {
      voteResult: picture.voteResult -= usersVote.dir,
      votes: picture.votes.filter((vote) => vote.user.toString() !== user._id.toString()),
    };

    const newPicture = await Picture
      .findByIdAndUpdate(req.params.id, newData, { new: true })
      .populate('user')
      .populate('votes.user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      });

    return res.status(200).send(newPicture);
  } catch (error) {
    return next(error);
  }
});

picturesRouter.post('/:id/vote', async (req, res, next) => {
  try {
    const { body } = req;
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    if (!body.dir) {
      return res.status(400).end();
    }

    if (body.dir !== 1 && body.dir !== -1) {
      return res.status(400).end();
    }

    const user = await User.findById(decodedToken.id);
    const picture = await Picture.findById(req.params.id);

    const usersVote = await picture.votes.find(
      (vote) => vote.user.toString() === user._id.toString(),
    );

    if (usersVote) {
      return res.status(400).end();
    }

    const newData = {
      voteResult: picture.voteResult += body.dir,
      votes: picture.votes.concat({ user, dir: body.dir }),
    };

    const updatedPicture = await Picture
      .findByIdAndUpdate(req.params.id, newData, { new: true })
      .populate('user')
      .populate('votes.user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      });

    return res.status(200).send(updatedPicture);
  } catch (error) {
    return next(error);
  }
});

picturesRouter.post('/', multer.single('image'), async (req, res, next) => {
  try {
    const { body } = req;

    if (!req.file) {
      return res.status(401).end();
    }

    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const { imgURL, firebaseID } = await uploadImage(req.file, user._id, 'images/');

    const location = JSON.parse(body.location);

    const newPicture = new Picture({
      imgURL,
      firebaseID,
      date: Date.now(),
      user: user._id,
      public: body.public,
      location,
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

    await savedPicture.populate('user').execPopulate();

    return res.json(savedPicture.toJSON());
  } catch (error) {
    return next(error);
  }
});

picturesRouter.post('/:id/comment', async (req, res, next) => {
  try {
    const { body } = req;
    const pictureId = req.params.id;
    const token = getTokenFrom(req);

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
    return next(error);
  }
});

picturesRouter.delete('/:pictureId/comments/:commentId', async (req, res, next) => {
  try {
    const { pictureId, commentId } = req.params;

    const token = getTokenFrom(req);

    const decodedToken = jwt.verify(token, process.env.SECRET);

    if (!token || !decodedToken) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);
    const picture = await Picture.findById(pictureId);
    const comment = await Comment.findById(commentId);

    if (!comment || !picture || !user) {
      return res.status(400).send();
    }

    if (!picture.comments.includes(commentId)) {
      return res.status(400).send();
    }

    if (comment.user.toString() !== user._id.toString()) {
      return res.status(401).send();
    }

    picture.comments = picture.comments.filter((c) => c._id.toString() !== commentId);
    const newPicture = await picture.save();

    await Comment.findByIdAndDelete(commentId);

    await newPicture.populate('user')
      .populate('votes.user')
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: { path: 'user', model: 'User' },
      }).execPopulate();

    return res.send(newPicture);
  } catch (error) {
    return next(error);
  }
});

picturesRouter.get('/picture-of-the-week', async (req, res, next) => {
  try {
    const pictures = await Picture.find({
      date: {
        $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
        $lt: new Date(),
      },
    }).sort({ voteResult: -1 });

    if (pictures[0]) {
      return res.status(200).send(pictures[0]);
    }

    return res.status(404).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = picturesRouter;
