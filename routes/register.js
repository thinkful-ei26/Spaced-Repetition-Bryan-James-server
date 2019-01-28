const express = require('express');
const regisRouter = express.Router();
const User = require('../models/users');
//const mongoose = require('mongoose');
const { checkUsernameAndPassword, trimName } = require('../utils/validate');
//homepage, no token needed here (pre-login.js might have been better..?)
// Router.get('/', (req, res, next)=>{
//     //landing welcome page no un/pw, register form here
//     res.send()
// });

regisRouter.post('/users', function(req, res, next){
  let { firstName, lastName, username, password } = req.body;
    //validate username and password
    const isLegit = checkUsernameAndPassword([username, password]);
    if(!isLegit.good){
        const err = new Error(`${isLegit.why} is not valid`);
        err.status = 401;
        return next(err);
    }
    
    firstName = trimName(firstName);
    lastName = trimName(lastName);
  
    return User.hashPassword(password)
        .then(digest=> {
            const newUser = {
                "firstName" : firstName,
                "lastName" : lastName,
                "username": username,
                "password": digest
            };
            //const optionalFields = ["firstName", "lastName", "email", "useEmailForApi"];
            //optionalFields.forEach((field, index)=> field? newUser[optionalFields[index]] = testArray[index]: null);
            
            return User.create(newUser);
        })
                .then(result=>{
            return res.status(201).location(`/users/${result.id}`).json(result);
        })
        .catch(err =>{
            if(err.code === 11000){
                err = new Error('The username already exists');
                err.status = 401;
                err.reason = 'The username already exists';
            }
            next(err);  
        });
});

module.exports =  regisRouter;