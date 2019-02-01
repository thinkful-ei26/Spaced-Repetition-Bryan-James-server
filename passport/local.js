const { Strategy: LocalStrategy } = require('passport-local')
const User = require('../models/users')

const localStrategy = new LocalStrategy((username, password, done) => {
  let user
  return User.findOne({ username: username })
    .then(result => {
      user = result
      if (!user) {
        return Promise.reject({
          status: 401,
        })
      }
      return user.validatePassword(password)
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          status: 401,
        })
      }
      return done(null, user.serialNoAnswerButAllUserInfo());
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false)
      }
      return done(err)
    })
})

module.exports = localStrategy
