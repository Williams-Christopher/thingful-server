const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const AuthService = {
    comparePasswords(password, hash) {
        return bcrypt.compare(password, hash);
    },

    createJwt(subject, payload) {
        return jwt.sign(
            payload,
            config.JWT_SECRET,
            {
                subject,
                algorithm: 'HS256',
            }
        );
    },

    verifyJwt(token) {
        return jwt.verify(
            token,
            config.JWT_SECRET,
            {
                algorithms: ['HS256'],
            }
        );
    },

    getUserWithUserName(db, user_name) {
        return db('thingful_users')
            .where({ user_name })
            .first();
    },

    parseBasicAuthToken(token) {
        return Buffer.from(token, 'base64').toString().split(':');
    },
};

module.exports = AuthService;