const express = require('express');
const AuthService = require('./auth-service');

const jsonBodyParser = express.json();
const authRouter = express.Router();

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        console.log(req.body);
        const { user_name, password } = req.body;
        const loginUser = { user_name, password };

        for(const [ key, value ] of Object.entries(loginUser)) {
            if(!value) {
                return res.status(400).json({error: `Missing ${key} in request body`});
            }
        }

        AuthService.getUserWithUserName(
            req.app.get('db'),
            loginUser.user_name
        )
            .then(dbUser => {
                if(!dbUser) {
                    return res.status(400).json({error: 'Invalid user name or password'});
                }

                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareResult => {
                        if(!compareResult) {
                            return res.statrus(400).json({error: 'invalid user name or password'});
                        }

                        const tokenSubject = dbUser.user_name;
                        const tokenPayload = { user_id: dbUser.user_id };
                        return res.send({ authToken: AuthService.createJwt(tokenSubject, tokenPayload) });
                    });
            })
            .catch(next);
    });

module.exports = authRouter;
