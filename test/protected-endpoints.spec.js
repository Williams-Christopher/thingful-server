const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Protected Endpoints', function () {
    let db

    const {
        testUsers,
        testThings,
        testReviews,
    } = helpers.makeThingsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    const protectedEndpoints = [
        {
            name: 'GET /api/things/:thing_id',
            path: '/api/things/1',
            method: supertest(app).get,
        },
        {
            name: 'GET /api/things/:thing_id/reviews',
            path: '/api/things/1/reviews',
            method: supertest(app).get,
        },
        {
            name: 'POST /api/things',
            path: '/api/reviews',
            method: supertest(app).post,
        },
    ];
    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            it(`responds with 401 'Missing bearer token' if bearer token not supplied`, () => {
                return endpoint.method(endpoint.path)
                    .expect(401, {error: `Missing bearer token`});
            });

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                //const userNoCreds = {user_name: '', password: ''};
                const validUser = testUsers[0];
                const invalidSecret = 'bad-secret';
                return endpoint.method(endpoint.path)
                    //.set('Authorization', helpers.makeAuthHeader(userNoCreds))
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, {error: `Unauthorized request`});
            });

            it(`responds 401 'Unauthorized request' when invalid subject (user) in payload`, () => {
                //const userInvalidCreds = {user_name: 'user-does', password: 'not-exist'};
                const invalidUser = { user_id: 1, user_name: 'does-not-exist' };
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, {error: `Unauthorized request`});
            });

            it(`responds 401 'Unauthorized request' when invalid password supplied`, () => {
                //const userBadPassword = {user_name: testUsers[0], password: 'bad-password'};
                const invalidUserPassword = testUsers[0];
                invalidUserPassword.password = 'not-a-valid-password';
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUserPassword))
                    .expect(401, {error: 'Unauthorized request'});
            });
        });
    });
});