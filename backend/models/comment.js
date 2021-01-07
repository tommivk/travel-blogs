/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  content: { type: String, minlength: 1, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: Date,
});

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
