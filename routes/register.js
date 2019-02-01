const express = require('express');
const regisRouter = express.Router();
const User = require('../models/users');
//const mongoose = require('mongoose');
const { checkUsernameAndPassword, trimName } = require('../utils/validate');


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
                "password": digest,
                   "questions" : [{
                    'Question': 'A Python data type that holds an ordered collection of values, which can be of any type. This is equivalant to an "array" in many other languages. Python <blank>s are "mutable," implying that they can be changed once created.',
                    'Answer': 'list',
                    m: 1,
                    next: 1,
                    id:0
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
                  }],
                  head: 0
            };
            return User.create(newUser);
        })
          .then(result=>{
            result.questions.forEach(item => item.Answer = null);
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