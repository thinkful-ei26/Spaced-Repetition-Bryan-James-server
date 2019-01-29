const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  Question: { type: String, required: true },
  Answer: { type: String, required: true },
})

questionSchema.set('toJSON', {
  virtuals: true, // include built-in virtual `id`
  transform: (doc, result) => {
    delete result._id
    delete result.__v
  },
})

module.exports = mongoose.model('Question', questionSchema)
