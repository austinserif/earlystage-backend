process.env.NODE_ENV = "test";
const app = require("../../app");
const supertest = require("supertest");
const request = supertest(app);

const mock = require("../../mockFunctions/users");
const getConnection = require('../../models/connect');
const firstUser = mock.createFakeUser();

describe("POST /users", function() {
    // set up 
    const { name, email, password } = firstUser;   

    // try creating a new user with an email that does not exist
    test("Create a new user", async function() {
        const body = { name, email, password };
        const response = await request.post(`/users`).send(body)
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Registration successful!")
    });

    // try creating that same user again 
    test("Refuses to create a user that already exists", async function() {
        const body = { name, email, password };
        const response = await request.post(`/users`).send(body)
        expect(response.status).toBe(409);
        expect(response.body.message).toBe("The email you chose is already in use")
    });

    // try creating a user when required fields are missing
    test("Returns message array and 400 status when required fields are left blank", async function() {
        const response = await request.post(`/users`).send({ name: "", email: "", password });
        expect(response.status).toBe(400);
        expect(response.body.message.includes(`instance.email does not conform to the \"email\" format`)).toBe(true)
        expect(response.body.message.includes("instance.name does not meet minimum length of 2")).toBe(true);
    });
});

describe("POST /login", function() {
    test("login to get new data", async function() {
        const { email, setToken, setUid } = firstUser; 
        const response = await request.post(`/login`).send({ email, password: firstUser.password })
        expect(response.status).toBe(200); // check for successful response
        expect('token' in response.body).toBe(true); // check that token is retured
        expect('uid' in response.body).toBe(true);
        expect('isVerified' in response.body).toBe(true);
        expect('email' in response.body).toBe(true);

        expect(new String(response.body.email)).toStrictEqual(new String(email))
       

        // store token for other tests
        setToken(new String(response.body.token));
        setUid(new String(response.body.uid));
    })
});



describe("GET /users/:email", function() {
    
    test("get data about newly created user", async function() {
        const token = firstUser.getToken();
        const response = await request.get(`/users/${firstUser.email}?_token=${token}`);
        expect(response.status).toBe(200);
        expect(new String(response.body._id)).toStrictEqual(new String(mock.getUids()[0]))
    });
});

describe('DELETE /users/:email', function() {
    test('delete a user', async function () {
        const token = firstUser.getToken();
        const response = await request.delete(`/users/${firstUser.email}?_token=${token}`).send({ password: firstUser.password });
        expect(response.status).toBe(200);
        expect(response.body.message).toStrictEqual('Resource deleted')
    })
})

// describe("DELETE /users/:email", function() {
// });

afterAll(async () => {
    const [ db, client ] = await getConnection();
    try {
        await db.collection('users').deleteMany({});
    } finally {
        await client.close();
    }
})