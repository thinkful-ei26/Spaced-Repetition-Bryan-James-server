const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../index');
const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const User = require('../models/users');
//const mongoose = require('mongoose');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

before(function() {
  return dbConnect(TEST_DATABASE_URL)
  .then(()=> {
    User.deleteMany();
  });
});

beforeEach(function(){
    return User.createIndexes();
});

afterEach(function(){
  return User.deleteMany();
});

after(function() {
  return dbDisconnect();
});

describe('The Register routes', function(){

  const firstName = 'Test';
  const lastName = 'Test';
  const username = 'Test';
  const password = '1234567890';
  let scopeUser = null;

  it('Should return users w/ questions array but no answers', function(){
    return chai.request(app)
    .post('/api/users')
    .send({ firstName, lastName, username, password})
      .then(testUser=>{
        scopeUser = testUser.body;
        expect(scopeUser).to.be.an('object');
        expect(scopeUser).to.have.keys('firstName', 'lastName', 'username', 'questions', 'head', 'id', 'levelTwoQuestionPool');
        expect(scopeUser.questions).to.be.an('array');
        expect(scopeUser.questions).to.have.length(10);
        expect(scopeUser.questions[0]).to.have.keys('Question', 'Answer', 'id', 'm', 'next');
        expect(scopeUser.questions[0].Answer).to.be.equal(null);
    });

  });

  it('Should return an error if the password is invalid', function(){
    return chai.request(app)
    .post('/api/users')
    .send({firstName, lastName, username, "password": "P"})
      .then((response)=>{
        expect(response).to.have.status(401);
      })
      .catch(()=>{});
  });
});
