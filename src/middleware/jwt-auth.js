const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || '';

    let bearerToken;
    if(!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' });
    } else {
        bearerToken = authToken.slice(7, authToken.length);
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken);
        AuthService.getUserWithUserName(
            req.app.get('db'),
            payload.sub
        )
            .then(dbUser => {
                if(!dbUser) {
                    return res.status(401).json({ error: 'Unauthorized request' });
                }
                req.user = dbUser;
                next();
            })
            .catch(err => {
                console.error(err);
                next(err);
            });
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized request' });
    };
};

module.exports = {
    requireAuth,
};
