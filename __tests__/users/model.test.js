process.env.NODE_ENV = 'test';
const getMockUsers = require('../mockSeed');
const getConnection = require('../../models/connect');
const User = require('../../models/user');
const app = require("../../app");

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

afterAll(async function() {
    const [ db, client ] = await getConnection();
    await db.collection('users').remove({});
    await client.close();
});