'use strict'

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')
const localStrategy = require('./passport/local')
const jwtStrategy = require('./passport/jwt')
const { PORT, CLIENT_ORIGIN } = require('./config')
const { dbConnect } = require('./db-mongoose')
// const {dbConnect} = require('./db-knex');
const app = express()
// Router handlers:
const authRouter = require('./routes/auth')
const regisRouter = require('./routes/register')

mongoose.Promise = global.Promise
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('autoIndex', false)

passport.use(localStrategy)
passport.use(jwtStrategy)
app.use(express.json())
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test',
  })
)

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
)
app.use(express.static('public'))

app.use('/api/auth', authRouter) // /login and /refresh routes here
app.use('/api/', regisRouter) // /users route here

//catch-all route:
app.use('*', (req, res, next) => {
  return res.status(404).json({ message: 'Not Found' })
})

//handle errors here:
app.use('*', (err, req, res, next) => {
  const error = err || new Error('Internal system malfunction')
  error.status = err.status || 500
  error.reason = err.reason || 'Unknown Reason'
  error.message = err.message || 'Message not found'
  res.status(error.status).json({ error })
}) //reminder to test this error obj ^^

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`)
    })
    .on('error', err => {
      console.error('Express failed to start')
      console.error(err)
    })
}

if (require.main === module) {
  dbConnect()
  runServer()
}

module.exports = { app }
