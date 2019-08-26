const AuthService = {
    parseBasicAuthToken(token) {
        return Buffer.from(token, 'base64').toString().split(':');
    },

    getUserWithUserName(db, user_name) {
        return db('thingful_users')
            .where({ user_name })
            .first();
    },
};

module.exports = AuthService;
