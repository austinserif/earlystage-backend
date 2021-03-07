process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const bcrypt = require('bcrypt');
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../../config');
const jwt = require('jsonwebtken');
let testUserToken;
const mock = require("../mockFunctions/users");

describe("GET /users/:email", function() {
    test("", async function() {
        const response = await request(app)
            .post(`/users`)
            .send()
    });

});

describe("POST /users", function() {
    const { name, email, password } = mock.createFakeUser();

    // try creating a new user with an email that does not exist
    test("Create a new user", async function() {
        request(app)
            .post(`/users`)
            .send({
                name,
                email,
                password
            })
            .expect(201, {
                message: "Registration successful!" 
            })
            .end(function(err, res) {
              if (err) throw err;
            });
        }
    );

    // try creating that same user again 
    test("Refuses to create a user that already exists", async function() {
        request(app)
            .post(`/users`)
            .send({
                name,
                email,
                password
            })
            .expect(409, {
                message: "The email you chose is already in use" 
            })
            .end(function(err, res) {
              if (err) throw err;
            });
        }
    );

    // try creating a user when required fields are missing
    test("Returns message array and 400 status when required fields are left blank", async function() {
        request(app)
            .post(`/users`)
            .send({
                password
            })
            .expect(400, {
                message: [
                    "instance.email does not conform to the \"email\" format",
                    "instance.name does not meet minimum length of 2"
                ]
            })
            .end(function(err, res) {
              if (err) throw err;
            });
        }
    );
});

describe("PATCH /users/:email", function() {

});

describe("DELETE /users/:email", function() {
});

describe("POST /users", function() {
    test("register a new user and return a token", async function() {
        const response = await request(app)
            .post(`/register`)
            .send({
                username: "",
                first_name: "Alyssa",
                last_name: "Plese",
                password: "secret",
                email: "aplese1@yahoo.com"
            });

        expect(Object.keys(response.body)[0]).toBe("token");
    });


    test("throw error when user doesn'y comply with JSON schema", async function() {
        const response = await request(app)
            .post(`/register`)
            .send({
                username: "aplese",
                first_name: "Alyssa",
                password: "secret",
                email: "aplese1@yahoo.com"
            });

        expect(response.body.message).toBe(`null value in column "last_name" violates not-null constraint`);
    });
});