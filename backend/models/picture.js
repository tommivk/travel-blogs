const mongoose = require('mongoose')

const pictureSchema = mongoose.Schema({
  imgURL: {type: String, required: true },
  firebaseID: {type: String, required: true },
  date: Date,
  public: {type: Boolean, required: true },
  title: {type: String, minlength: 3, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    lat: Number,
    lng: Number,
    city: String,
    country: String,
  },
  voteResult: Number,
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      dir: {
        type: Number,
      },
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
})

pictureSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})
const Picture = mongoose.model('Picture', pictureSchema)
module.exports = Picture
