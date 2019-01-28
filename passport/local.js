const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/users');

const localStrategy = new LocalStrategy((username, password, done)=>{
    let user;
    return User.findOne({"username": username})
    .then(result => {
        user = result;
        if(!user){
            return Promise.reject({
                reason: 'LoginError',
                message: 'Wrong username',
                location : 'username',
                status : 444
            });
        }
        return user.validatePassword(password);
    })
    .then(isValid => {
        if(!isValid){
            return Promise.reject({
                reason: 'LoginError',
                message: 'Wrong password',
                location : 'password',
                status : 445
            });
        }
        return done(null, user);
    })
    .catch(err=> {
        if(err.reason === 'LoginError'){

            return done(null, false);
        }
        return done(err);
    });
});

module.exports = localStrategy;

