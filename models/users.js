const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const usersSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  questionPool: [
    { someIndex: Number, timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
    // { timesCorrect: Number, timesWrong: Number },
  ],
  levelTwoQuestionPool: [
    {
      question: { type: mongoose.Schema.Types.String, ref: 'Question' },
      timesCorrect: Number,
      timesWrong: Number,
    },
    // Dynamically populated from a db of 100 questions. Will have a seed utility that generates 10 questions from base dataset and pushes those to a linked list
  ],
})

usersSchema.set('toJSON', {
  virtuals: true, // include built-in virtual `id`
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  },
})

usersSchema.methods.serialize = function() {
  return { username: this.username, name: this.name }
}

usersSchema.methods.validatePassword = function(AttemptedPassword) {
  return bcrypt.compare(AttemptedPassword, this.password)
}

usersSchema.statics.hashPassword = function(unhashedPass) {
  const hashed = bcrypt.hash(unhashedPass, 10)
  return hashed
}

module.exports = mongoose.model('User', usersSchema)
