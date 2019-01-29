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
  const question = req.body.Question;
  const answer = req.body.Answer;
  //validate question and answer are legit
  //check if answer is right or wrong
  const whichQuestion = User.find({questionPool: question});
  if(answer===whichQuestion.answer){
  
      let rightReply = {"feedback": "Some correct message here",
    
      };
    res.json(rightReply);
  
  }

  let wrongReply = {"feedback": `Sorry the correct answer is: ${whichQuestion.answer}`,
  
  };
  res.json(wrongReply);
});
// Route to handle client asking for a question:
questionRouter.post('/next', (req, res, next)=>{
  //this route handles the sending of next question to user
  //const userId = req.user.id;
  const question = req.body.Question;
  // this route is called for both the initial question and skip next question button
  if(!question){
    //here the question request is null, so we just send back the first question on the list
    return Question.find()//returns 10 questions from mLab
    .then((data)=>{
      res.json(data[0]);
    })
    .catch(()=>{});
  }
  // here the question from the client is for the next question after they are currently on.
  // do validate req.body.question here
  
  return Question.find()
  .then((results)=>{
 //logic here to loop through all questions in db and grab the next one.
 //console.log("the next question, ", results);
 //let nextQuestion = null;
 for(let i = 0; i<results.length -1; i++){
   //loop through all questions in db
   if(results[i]["Question"] === question){
     //found the question client has sent us
     let nextQuestion = results[i+1];
     //the next one on the list is sent back to client
     res.json(nextQuestion);
   }
 }
 //console.log("Uh-hoh");
  })
  .catch(()=>{});
 
});
module.exports =  questionRouter;