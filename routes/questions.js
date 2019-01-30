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
  const id = req.body.id;
  const answer = req.body.Answer;
  //validate question and answer are legit
  //check if answer is right or wrong
  
  return Question.find({"_id": id})
  .then(([whichQuestion, ...data])=>{
    if(answer===whichQuestion.Answer){
  
      let rightReply = {"feedback": "Correct"};
    return res.json(rightReply);
  
  }
  let wrongReply = {"feedback": `Sorry the correct answer is: ${whichQuestion.Answer}`,
  };
  return res.json(wrongReply);
  });
  
});
// Route to handle client asking for a question:
questionRouter.post('/next', (req, res, next)=>{
  //this route handles the sending of next question to user
  //const userId = req.user.id;
  const id = req.body.id;
  // this route is called for both the initial question and skip next question button
  if(!id){
    //here the question request is null, so we just send back the first question on the list
    return Question.find()//returns 10 questions from mLab
    .then((data)=>{
      return res.json(data[0]);
    })
    .catch(()=>{});
  }
  // here the question from the client is for the next question after they are currently on.
  // do validate req.body.question here
  
  return Question.find()
  .then((results)=>{
 //logic here to loop through all questions in db and grab the next one.
  //let nextQuestion = null;
 for(let i = 0; i<results.length; i++){
   //loop through all questions in db
   if(results[i]["_id"] == id){
     //found the question client has sent us
     let nextQuestion;
     if(i=== results.length-1){
       //the last question in the pool, send them the first till we have algorithm
      nextQuestion = results[0];
     } else {
       //the next one on the list is sent back to client
      nextQuestion = results[i+1];
     }
     return res.json(nextQuestion);
    
   }
 }

 return res.sendStatus(400);
  })
  .catch(()=>{
    return res.sendStatus(400);
  });
  
});
questionRouter.post('/all', (req,res, next)=>{
  //const userId = req.user.id;
  // return User.find({id: userId})// get current users' questions from questionPool
  return Question.find()
  .then(results=> res.json(results))
  .catch(err=>next(err));
});
module.exports =  questionRouter;