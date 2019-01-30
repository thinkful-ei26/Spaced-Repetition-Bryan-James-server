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
      let mSpotsDownTheList = qArray[whichQuestion].id + newMValue;
      //          [0, 1, 2, 3, 4, 5, 6,..., len]
      //          [-, 1, 2, 0, 3, 4, 5, 6,..., 8] 
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
      for(let i = qArray[whichQuestion].id; i < qArray[whichQuestion].id + newMValue; i++){//going to work?
        //start at current question node
        // loop M times (from 0 to 1,2,4,8,10) @20 20>length 10 ->> becomes = 10 (Line30)
        // tempIndex++;
        tempIndex = tempIndex +1;
        //console.log("the incrementer: ", tempIndex);
        if(tempIndex >= qArray.length){
          tempIndex = tempIndex - qArray.length;
        }
        indexOfNewSpot = qArray[tempIndex].next;
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
      //console.log("here spot what is what: ", captureNewSpotQuestion);
      //console.log("here spot what is what next: ", captureNewSpotQuestion.next);
      //changes done to array and head now update the user in mongo:<-- check
      for(let i = 0; i < qArray.length; i++){
        //going thru the whole array
        if((qArray[i].next === qArray[whichQuestion].id)&& (!Object.is(qArray[i], captureNewSpotQuestion))){
          //found it
          qArray[i].next = bananas;
          //          [-, 1, 2, 0*, 3, 4, 5, 6,..., 8] <-- found 8 which is .next 0
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
        .catch(err=>console.log("sad face ", err));
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
  .catch((err)=>{
    return next(err);
  });
  
});
questionRouter.post('/all', (req,res, next)=>{
  const userId = req.user.id;
  // get current users' questions from questionPool
  return User.findOne({_id: userId})
  .then(results=> res.json(results.questions))
  .catch(err=>next(err));
});
module.exports =  questionRouter;