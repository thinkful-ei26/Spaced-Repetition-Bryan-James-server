const express = require('express');
const questionRouter = express.Router();
const User = require('../models/users');
const Question = require('../models/questionData');
const passport = require('passport');

//file is for /next and /data routes
questionRouter.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));

questionRouter.post('/data', (req, res, next)=>{
  // this route handles algorithm logic
  //const userId = req.user.id;
  const userId = req.user.id;
  const answer = req.body.Answer;
  const whichQuestion = req.body.id;
  //validate question and answer are legit
  //check if answer is right or wrong
  
  return User.findOne({"_id": userId})
  .then((currentUser)=>{
    //here we have the User question array,
    let theRight = currentUser.questions[whichQuestion].Answer;
    if(answer===theRight.toLowerCase()){
  
      let rightReply = {"feedback": "Correct"};
    return res.json(rightReply);
  
  }
  let wrongReply = {"feedback": `Sorry the correct answer is: ${theRight}`,
  };
  return res.json(wrongReply);
  });
  
});
// Route to handle client asking for a question:
questionRouter.post('/next', (req, res, next)=>{
  //this route handles the sending of next question to user
  //const userId = req.user.id;
  const { nextQuestionIndex } = req.body;
  const userId = req.user.id;
  // this route is called for both the initial question and skip next question button
  if(!nextQuestionIndex){
    //here the question request is null, so we just send back the first question on the list
    return User.findOne({_id: userId})//returns 10 questions from mLab
    .then((theUser)=>{
      let firstQuestion = theUser.questions[theUser.head];
      return res.json(firstQuestion);//send client the question at the head of their list
    })
    .catch(()=>{});
  }
  // here the question from the client is for the next question after they are currently on.
  // do validate req.body.question here
  
  return User.findOne({_id:userId})
  .then((theUser)=>{
    let nextQIndex = theUser.questions[nextQuestionIndex];
    return res.json(nextQIndex);//send client the next question from the index they sent us
  })
  .catch(()=>{
    return res.sendStatus(400);
  });
  
});
questionRouter.post('/all', (req,res, next)=>{
  const userId = req.user.id;
  // return User.find({id: userId})// get current users' questions from questionPool
  return User.findOne({_id: userId})
  .then(results=> res.json(results.questions))
  .catch(err=>next(err));
});
module.exports =  questionRouter;