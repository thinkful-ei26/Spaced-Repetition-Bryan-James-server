const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
})

questionSchema.set('toJSON', {
  virtuals: true, // include built-in virtual `id`
  transform: (doc, result) => {
    delete result._id
    delete result.__v
  },
})

module.exports = mongoose.model('Question', questionSchema)
