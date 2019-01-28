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

regisRouter.post('/register', function(req, res, next){
  let { name, username, password } = req.body;
    //validate username and password
    const isLegit = checkUsernameAndPassword([username, password]);
    if(!isLegit.good){
        const err = new Error(`${isLegit.why} is not valid`);
        err.status = 401;
        return next(err);
    }
    
    name = trimName(name);
    //let testArray = [username, name];
    return User.hashPassword(password)
        .then(digest=> {
            const newUser = {
               "name" : name,
                "username": username,
                "password": digest
            };
            //const optionalFields = ["firstName", "lastName", "email", "useEmailForApi"];
            //optionalFields.forEach((field, index)=> field? newUser[optionalFields[index]] = testArray[index]: null);
            
            return User.create(newUser);
        })
                .then(result=>{
            return res.status(201).location(`/register/${result.id}`).json(result);
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