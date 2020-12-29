const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const defaultPictureURL = process.env.DEFAULT_PICTURE_URL

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 2,
    required: true,
  },
  avatar: {
    type: String,
    default: defaultPictureURL,
  },
  pictures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Picture',
    },
  ],
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
  pictureSubscribers: [mongoose.Schema.Types.ObjectId],
  blogSubscribers: [mongoose.Schema.Types.ObjectId],
  joinDate: Date,
  passwordHash: String,
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User
