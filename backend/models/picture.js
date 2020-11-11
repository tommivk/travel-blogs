const mongoose = require('mongoose')

const pictureSchema = mongoose.Schema({
  imgURL: String,
  date: Date,
  public: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    lat: Number,
    lng: Number,
  },
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
