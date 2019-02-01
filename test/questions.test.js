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
let token = null;
let testieUserForTestingTests = {
  "firstName": "ThisTest",
  "lastName": "ThisTest",
  "username": "ThisTest",
  "password": "12345myLuggage"
};
before(function() {
  return dbConnect(TEST_DATABASE_URL)
  .then(()=> {
    User.deleteMany();
  });
});

beforeEach(function(){
  
  return chai.request(app)
  .post('/api/users')
  .send(testieUserForTestingTests)
  .then(()=>{
    return chai.request(app)
    .post('/api/auth/login')
    .send({"username": "ThisTest", "password":"12345myLuggage"})
    .then(tokenData=>{
      token = tokenData.body.authToken;
      return User.createIndexes();
    });
  });
});

afterEach(function(){
  return User.deleteMany();
});

after(function() {
  return dbDisconnect();
});

describe('The Questions routes!!', function(){
  const firstName = 'Test';
  const lastName = 'Test';
  const username = 'Test';
  const password = '1234567890';
  let scopeUser = null;
 // let token = null;
  chai.request(app)
  .post('/api/users')
  .send({ firstName, lastName, username, password})
  .then(testUser=>{
    scopeUser = testUser.body;
    return chai.request(app)
      .post('/api/auth/login')
      .send({username, password});
  })
  .then(resultLogin=>{
    token = resultLogin.body.authToken;
  })
  .catch(()=>{});
  describe('the /data route', function(){
   
    it('Should double the questions m value if the answer was correct', function(){

    });
    it('Should rearrange the users questions order if answer was correct', function(){
      //console.log("Before ", token);
      // return chai.request(app)
      // .post('/api/data')
      // .set('Authorization', `Bearer ${token}`)
      // .send({})
      //   .then(testPostAll=>{
      //     //console.log("Hello ", testPostAll.body); //works
      //     expect(testPostAll.body).to.be.an('array');
      //    // expect(testPostAll.).to.be.an('array');
      //   });
      // return chai.request(app)
      // .post('/api/users')
      // .send({ firstName, lastName, username, password})
      // .then(testUser=>{
      //   scopeUser = testUser.body;
      //   //console.log("Hello ***", token); //works
      //   expect(scopeUser).to.be.an('object');
      // });
      
    });
    it('Should reset the quesion m value to 1 if wrong answer submitted', function(){

    });
    it('Should update the question array for the user with the new next spot for the wrong question', function(){

    });
  });
  describe('the /next route', function(){
    it('Should send a head question if no question is sent by the client', function(){

    });
    it('Should sent the next question if a question is sent', function(){

    });
  });
  describe('the /all route', function(){
    it('Should return all the currentUser questions',function(){
      return chai.request(app)
        .post('/api/all')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .then(response=>{
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.length(10);
          expect(response.body[0]).to.have.keys('Question', 'Answer', 'id', 'm', 'next');
          expect(response.body[0].Answer).to.be.equal(null);
        })
        .catch(()=>{});
  });
  describe('the /reset route', function(){
    it('Should reset users questions Array back to default state', function(){

/*
      return chai.request(app)
        .get('/api/reset')
        .set('Authorization', `Bearer ${token}`)
        .then(result=>{
          console.log("herehrehr", result);
          //expect(result).
        });
        */
    });
  });
 });
});


