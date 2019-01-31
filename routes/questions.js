const express = require('express');
const questionRouter = express.Router();
const User = require('../models/users');
//const Question = require('../models/questionData');
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
  let replyMessage = {"feedback": "Correct"};
  return User.findOne({"_id": userId})
  .then((currentUser)=>{
    let qArray = [...currentUser.questions];
    let bananas = qArray[whichQuestion].next;// next is a primal number so bananas===copy of number not a mutation
    let updatePackage = {head: bananas, questions: qArray};
    //here we have the User question array,
    let theRight = qArray[whichQuestion].Answer;
    if(answer===theRight.toLowerCase()){
        //here the user has answered currentUser.questions[whichQuestion] correctly
        //currentUser.questions[whichQuestion].m set to double it's value or array's length
      let newMValue = qArray[whichQuestion].m *2;
      if(newMValue >= qArray.length){
        newMValue = qArray.length;
      }
      // update the m value =newMValue<-- check
      qArray[whichQuestion].m = newMValue;
      let mSpotsDownTheList = /*qArray[whichQuestion].id +*/ newMValue;
      //          [0, 1, 2, 3, 4, 5, 6,..., len]
      //          [1, 2, 0 , 3, 4,5, 6,7,  8, 9] m4 +2
      // problem is 8 is still .nexting to 0 instead of to 1 now,
      //skipping 1 and 2 on following loops
      //          [6, 0, 1, 2, 3, 4, 5, -,7, 8]
      // if > arraylength then - the length
      if(mSpotsDownTheList >= qArray.length){
        mSpotsDownTheList -= qArray.length;
      }
        //2: move the question into the new spot, <-- check
      //find where is new spot <-- found it
      let indexOfNewSpot = whichQuestion;
      let tempIndex = qArray[whichQuestion].id;
      for(let i = 0; i < newMValue; i++){//going to work?
        //start at current question node
        // loop M times (from 0 to 1,2,4,8,10) @20 20>length 10 ->> becomes = 10 (Line30)
        // tempIndex++;
        //console.log("M:", newMValue);
        tempIndex = tempIndex +1;
        //console.log("the incrementer: ", tempIndex);
        if(tempIndex >= qArray.length){
          tempIndex = tempIndex - qArray.length;
        }
        indexOfNewSpot = qArray[tempIndex].id;
        //console.log("inside loop:", indexOfNewSpot);
      }
      //console.log("outside loop:", indexOfNewSpot);
      
      let captureNewSpotQuestion = qArray[indexOfNewSpot];
      //3: head points to current next before the shifting spots re-organize<-- check (Line22)
      // 
      //4: current.next points to the M spots down's next <-- check
      qArray[whichQuestion].next = captureNewSpotQuestion.next;
      //5: change question at M spots down to next points to this question id <-- check
      captureNewSpotQuestion.next = currentUser.questions[whichQuestion].id;
      //qArray[whichQuestion].id = captureNewSpotQuestion.id + 1;

      //console.log("here spot what is what: ", captureNewSpotQuestion);
      //console.log("here spot what is what next: ", captureNewSpotQuestion.next);
      //changes done to array and head now update the user in mongo:<-- check
      for(let i = 0; i < qArray.length; i++){
        //going thru the whole array
        if((qArray[i].next === qArray[whichQuestion].id)&& (!Object.is(qArray[i], captureNewSpotQuestion))){
          //found it
          qArray[i].next = bananas;
          //          [- 1, 2,0, 3, 4, 5, ,..., 8] <-- found 8 which is .next 0
      // problem is 8 is still .nexting to 0 instead of to 1 now,
      // 0's old .next was 1, then 2 etc, now 8.next = 1 so questions dont get cut out of line
        }
      }
   
    } else {
      replyMessage = {"feedback": `Sorry the correct answer is: ${theRight}`};
      /* *** in-scope variables:    
      *
      *   qArray         an array of the current logged in user's questions (length of 10)
      *   updatePackage   an object for updating the MongoDB, has head already set to next question
      *   whichQuestion     the index number of the just-been-answered question
      *   bananas         current question next Number value copied not mutant
      */ 
      // here the user has answered incorrectly
      // to do list: 
      // 1. reset currentUser.questions[whichQuestion].m = 1;
      qArray[whichQuestion].m = 1;
      // 2. move the current question m spaces in the list,
      let helperIndexValue = qArray[whichQuestion].id;// copy of number not a mutant, i think
      let captureNewSpot = null;
      for(let i = qArray[whichQuestion].id; i < qArray[whichQuestion].id + 1; i++){
        captureNewSpot = qArray[helperIndexValue].next;
        helperIndexValue++;
        if(helperIndexValue >= qArray.length){
          // 2a. if end of list wrap around to begin of list, don't over-index the range of array
          helperIndexValue = 0;
        }
      }
      // 3. find the spot to move to and capture it for changing it's next to current question
      let newSpotToMoveTo = qArray[captureNewSpot];// mutant not value

      let helperNextSpot = newSpotToMoveTo.next;//value not mutant
      newSpotToMoveTo.next = qArray[whichQuestion].id;
      let OldCurrentNext = qArray[whichQuestion].next;
      qArray[whichQuestion].next = helperNextSpot;
      // 4. find the question that was previously nexting' the currentWrong and change it's next to 
      //      the old current next
      //   [0,1,2,3,4,5]   // 2 is going to move to after 3
      //   [0,1,-,3, 2, 4,5]  //need 1 to next to 3 not 2(that would skip over 3 forever)
      for(let i = 0; i < qArray.length; i++){
        if((qArray[i].next === qArray[whichQuestion].id)&& (!Object.is(qArray[i], newSpotToMoveTo))){
          //here is spot 1 and not spot 3, set to 2's old next which was 3
          qArray[i].next = OldCurrentNext;
        }
      }
      // 5. ???
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
    //console.log("here, first", results);
   // console.log("here, then 2nd", results.serialNoAnswer());
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