'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../index');
const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const User = require('../models/users');
const mongoose = require('mongoose');

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

describe('Mocha and Chai', function() {
  it('should be properly setup', function() {
    expect(true).to.be.true;
  });
});
describe('The Questions routes!!', function(){

  const firstName = 'Test';
  const lastName = 'Test';
  const username = 'Test';
  const password = '1234567890';
  let scopeUser = null;


  it('Should make me a sandwich', function(){
    
 
    return chai.request(app)
    .post('/api/users')
    .send({ firstName, lastName, username, password})
      .then(testUser=>{
    //let token = somethinglike testUser.authToken;
      scopeUser = testUser.body;
      console.log("Hello first test");
      //console.log("Hello ", scopeUser);
      //expect('a sandwich').to.be.tasty;
    });

  });






});
