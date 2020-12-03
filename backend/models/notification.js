const mongoose = require('mongoose')

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
})

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
