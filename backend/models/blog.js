const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: { type: String, minlength: 5, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: Date,
  description: { type: String, minlength: 5, required: true },
  content: { type: String, minlength: 50, required: true },
  locations: [
    {
      lat: Number,
      lng: Number,
      city: String,
      country: String,
    },
  ],
  stars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  headerImageURL: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
