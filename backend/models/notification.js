/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  receivers: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  readBy: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
  content: {
    message: { type: String },
    contentType: { type: String },
    contentID: { type: String },
  },
  createdAt: Date,
});

notificationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
