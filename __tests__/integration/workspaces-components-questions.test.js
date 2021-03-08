process.env.NODE_ENV = "test";
const app = require("../../app");
const supertest = require("supertest");
const request = supertest(app);
const mock = require("../../mockFunctions/users");
const getConnection = require('../../models/connect');
const firstUser = mock.createFakeUser();

describe('POST /users/:email/workspaces', function() {
    test('create and login fake user', async function() {
        // get mock credentials
        const { email, name, password } = firstUser;

        // create fake user on server
        const registrationResponse = await request.post('/users').send({ email, name, password });
        expect(registrationResponse.status).toBe(201); // check to make sure the registration went well

        // test login again and get token for workspace tests
        const loginResponse = await request.post('/login').send({ email, password });
        expect(Object.keys(loginResponse.body).includes('token')).toBe(true); // check that a token was returned
        firstUser.setToken(loginResponse.body.token); // set token to mock user for later tests
    });

    test('Creates a new workspace for mock user', async function() {
        // get token for first workspace request
        const token = firstUser.getToken();

        // make a fake request to create new workspace
        const response = await request.post(`/users/${firstUser.email}/workspaces?_token=${token}`)
            .send({
                name: 'testName',
                domain: 'www.testdomain.com'
            });

        // set wid for future test
        firstUser.setWid(response.body._id);

        // test correct status code
        expect(response.status).toBe(201);

        // test that the name, and domain strings returned from the server match the ones you passed in
        expect(response.body.entity.name).toStrictEqual('testName');
        expect(response.body.entity.domain).toStrictEqual('www.testdomain.com');

        // test response body for most important keys
        expect(Object.keys(response.body).includes('_id')).toBe(true);
        expect(Object.keys(response.body).includes('components')).toBe(true);

        // test that components property on response body is an array (should also be empty)
        expect(Array.isArray(response.body.components)).toBe(true);
    });
})

describe('POST /users/:email/questions', function() {
    test('create a new question', async function() {
        const token = firstUser.getToken();
        const response = await request.post(`/users/${firstUser.email}/questions?_token=${token}`).send({ question: `How big is the company's TAM?`, category: 'financials' });

        // set question id to mock user helper for later reference
        firstUser.setQid(response.body._id);

        // test successful resource creation status code returned
        expect(response.status).toBe(201);

        // test response body for most important keys
        expect(Object.keys(response.body).includes('_id')).toBe(true);
        expect(response.body.question).toStrictEqual(`How big is the company's TAM?`);
        expect(response.body.category).toStrictEqual(`financials`);
    })
});

describe('POST /users/:email/workspaces/:workspaceId/components', function() {
    test('Creates a new component resource in target workspace', async function() {
        // get id of created workspace
        const wids = firstUser.getWids();
        const workspaceId = wids[0];

        // get target question id
        const qids = firstUser.getQids();
        const questionId = qids[0];

        // get mock user token
        const token = firstUser.getToken();

        const answer = '$100,000,000'

        // make mock post request
        const response = await request.post(`/users/${firstUser.email}/workspaces/${workspaceId}/components?_token=${token}`).send({ questionId,  answer });
        expect(response.status).toBe(201);
    })
})

afterAll(async () => {
    const [ db, client ] = await getConnection();
    try {
        // delete data from all collections in test database
        await db.collection('users').deleteMany({});
        await db.collection('workspaces').deleteMany({});
        await db.collection('components').deleteMany({});
        await db.collection('questions').deleteMany({});
    } finally {
        await client.close();
    }
})