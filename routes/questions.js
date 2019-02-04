const express = require('express');
const questionRouter = express.Router();
const User = require('../models/users');
//const Question = require('../models/questionData');
const passport = require('passport');

//file is for /next and /data routes
questionRouter.use('/', passport.authenticate('jwt', {session : false, failWithError: true }));

questionRouter.post('/data', (req, res, next)=>{
  // this route handles algorithm logic
  const userId = req.user.id;
  const answer = req.body.Answer;
  const indexOfCurrentQuestion = req.body.id;
  let replyMessage = {"feedback": "Correct"};
  return User.findOne({"_id": userId})
  .then((currentUser)=>{
    let qArray = [...currentUser.questions];
    let newHeadValue = qArray[indexOfCurrentQuestion].next;
    let updatePackage = {head: newHeadValue, questions: qArray};
    let theRight = qArray[indexOfCurrentQuestion].Answer;
    let newMValue;
    if(answer===theRight.toLowerCase()){
      newMValue = qArray[indexOfCurrentQuestion].m *2;
      if(newMValue >= qArray.length){
        newMValue = qArray.length;
      }
      qArray[indexOfCurrentQuestion].m = newMValue;
    }else {
      replyMessage = {"feedback": `Sorry the correct answer is: ${theRight}`};
      qArray[indexOfCurrentQuestion].m = 1;
      newMValue = 1;
    }
     
     if( newMValue>= qArray.length){
      newMValue -= qArray.length;
      }
      let indexOfNewSpot = indexOfCurrentQuestion;
      let tempIndex = qArray[indexOfCurrentQuestion].id;
      for(let i = 0; i < newMValue; i++){
       tempIndex = tempIndex +1;
        if(tempIndex >= qArray.length){
          tempIndex = tempIndex - qArray.length;
        }
        indexOfNewSpot = qArray[tempIndex].id;
      }
      let captureNewSpotQuestion = qArray[indexOfNewSpot];
      qArray[indexOfCurrentQuestion].next = captureNewSpotQuestion.next;
      captureNewSpotQuestion.next = currentUser.questions[indexOfCurrentQuestion].id;
      for(let i = 0; i < qArray.length; i++){
        if((qArray[i].next === qArray[indexOfCurrentQuestion].id)&& (!Object.is(qArray[i], captureNewSpotQuestion))){
          qArray[i].next = newHeadValue;
        }
      }
    return User.findOneAndUpdate({_id: userId}, updatePackage, {new:true, $set: 1})
        .then(()=>res.json(replyMessage))
        .catch(err=>next(err));
    });
});

// Route to handle client asking for a question:
questionRouter.post('/next', (req, res, next)=>{
  //this route handles the sending of next question to user
  const { nextQuestionIndex } = req.body;
  const userId = req.user.id;
  // this route is called for both the initial question and skip next question button
  if(nextQuestionIndex === null || nextQuestionIndex === undefined){
    //here the question request is null, so we just send back the first question on the list
    return User.findOne({_id: userId})//returns 10 questions from mLab
    .then((theUser)=>{
      let firstQuestion = theUser.questions[theUser.head];
      firstQuestion.Answer = null;
      return res.json(firstQuestion);//send client the question at the head of their list
    })
    .catch(()=>{});
  }
  // here the question from the client is for the next question after they are currently on.
  // do validate req.body.question here
  
  return User.findOneAndUpdate({_id:userId}, {head: nextQuestionIndex}, {new:true, $set:1})
  .then((theUser)=>{
    let nextQIndex = theUser.questions[nextQuestionIndex];
    nextQIndex.Answer =null;
    return res.json(nextQIndex);//send client the next question from the index they sent us
  })
  .catch((err)=>{
    return next(err);
  });
  
});
questionRouter.post('/all', (req,res, next)=>{
  const userId = req.user.id;
  // get current users' questions from questionPool
  return User.findOne({_id: userId})
  .then(results=> {
    let filtered = [...results.serialNoAnswer().questions];
    return res.json(filtered);
  })
  .catch(err=>next(err));
});

questionRouter.get('/reset', (req, res, next)=>{
  //here we want to reset all the currentUser's questions array to inital values.
  const userId = req.user.id;
  let freshArray = {head: 0,
    questions: [{
      'Question': 'A Python data type that holds an ordered collection of values, which can be of any type. This is equivalant to an "array" in many other languages. Python <blank>s are "mutable," implying that they can be changed once created.',
      'Answer': 'list',
      m: 1,
      next: 1,
      id: 0
    },
    {
      'Question': '<blank>s are assigned values using the = operator, which is not to be confused with the == sign used for testing equality. A <blank> can hold almost any type of value such as lists, dictionaries, functions.',
      'Answer': 'variable',
      m: 1,
      next: 2,
      id:1
    },
    {
      'Question': 'Python builds <blank>s using the syntax: def <blank>_name(variable): <blank>s can be stand-alone or can return values. <blank>s can also contain other functions.',
      'Answer': 'function',
      m: 1,
      next: 3,
      id:2
    },
    {
      'Question': '<blank>s store characters and have many built-in convenience methods that let you modify their content.',
      'Answer': 'string',
      m: 1,
      next: 4,
      id:3
    },
    {
      'Question': 'Using <blank> returns the number of _top-level_ items contained in the object being queried. Length of string',
      'Answer': 'len()',
      m: 1,
      next: 5,
      id:4
    },
    {
      'Question': 'A function to display the output of a program. Using the parenthesized version is arguably more consistent.',
      'Answer': 'print',
      m: 1,
      next: 6,
      id:5
    },
    {
      'Question': 'The <blank> function returns a list of integers, the sequence of which is defined by the arguments passed to it. Used in for loops.',
      'Answer': 'range',
      m: 1,
      next: 7,
      id:6
    },
    {
      'Question': 'A <blank> loop permits code to execute repeatedly until a certain condition is met. This is useful if the number of iterations required to complete a task is unknown prior to flow entering the loop.',
      'Answer': 'while',
      m: 1,
      next: 8,
      id:7
    },
    {
      'Question': 'Using the <blank> function allows you to represent the content of a variable as a string, provided that the data type of the variable provides a neat way to do so. <blank> does not change the variable in place, it returns a stringified version of it.',
      'Answer': 'str()',
      m: 1,
      next: 9,
      id:8
    },
    {
      'Question': 'Name given to the class that is being inherited from',
      'Answer': 'superclass',
      m: 1,
      next: 0,
      id:9
    }
  ]};
  return User.findByIdAndUpdate(userId, freshArray, {new: true, $set: 1})
  .then((response)=>{
    return res.json(response.serialNoAnswer());
  })
  .catch(err=>next(err));
});
module.exports =  questionRouter;