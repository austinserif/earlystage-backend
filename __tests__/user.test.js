process.env.NODE_ENV = 'test';
const getMockUsers = require('../mockSeed');
const getConnection = require('../models/connect');
const User = require('../models/user');

const MOCK_USER_ARRAY = getMockUsers();

/** testing setup procedures */
beforeAll(async function() {
    const [ db, client ] = await getConnection();
    await db.collection('users').insertMany(MOCK_USER_ARRAY);
    await client.close();
});

describe('getAllUsers unit tests', function() {
    test('successfully get both users in test database', async function () {
        const result = await User.getAllUsers();
        expect(result).toEqual(MOCK_USER_ARRAY);
    });
});

describe('createNewUser', function() {
    test('successfully create a new user', async function() {

        //define new test user
        const newTestUser = {
            name: 'Testy3',
            email: 'testy3@email.com',
            password: 'thisIsASecret'
        }

        //run createNewUser method
        const results = await User.createNewUser(newTestUser);

        //destructure metadata for tests
        const { lastModified, createdDate } = results.metadata;

        //destructure name, and email for tests
        const { name } = results.account;

        const { email } = results;

        //test to see if correct keys are returned
        expect(Object.keys(results)).toEqual(["email", "account", "workspaces", "questions", "metadata", "_id"]);
    
        //test to see if password field is NOT included (should be deleted from returning obj after results are retrieved)
        expect(results.account.password).toEqual(undefined);

        //test that lastModified and createdDate are the same
        expect(lastModified === createdDate).toEqual(true);

        //test that name and email fields are as expected
        expect(name).toEqual(newTestUser.name);
        expect(email).toEqual(newTestUser.email);
    });

})

afterAll(async function() {
    const [ db, client ] = await getConnection();
    await db.collection('users').remove({});
    await client.close();
});