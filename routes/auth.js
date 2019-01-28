const express = require('express');
const passport = require('passport');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');
const jwt = require('jsonwebtoken');
const authRouter = express.Router();

function createAuthToken(user){
    return jwt.sign({ user }, JWT_SECRET, {
        subject: user.username,
        expiresIn: JWT_EXPIRY
    });
}

const options = {session: false, failWithError: true};
const localAuth = passport.authenticate('local', options);
const jwtAuth = passport.authenticate('jwt', options);

authRouter.post('/login', localAuth, function(req, res){
    const authToken = createAuthToken(req.user);
    return res.json({authToken});
});

authRouter.post('/refresh', jwtAuth, (req, res)=>{
    const authToken = createAuthToken(req.user);
    return res.json({authToken});
});

module.exports = authRouter;