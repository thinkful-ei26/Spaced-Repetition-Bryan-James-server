'use strict'

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  DATABASE_URL:
    process.env.DATABASE_URL || 'mongodb://bryantheuser:abc12345@ds011800.mlab.com:11800/bryan-james-dsa-learn-python',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost/thinkful-backend-test',
  JWT_SECRET: 'somereallylongstringforapassword',
  JWT_EXPIRY: '7d',
}
