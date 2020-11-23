/** user.js file contains logic for  */

const express = require('express');
const ExpressError = require('../helpers/expressError');
const router = express.Router();
const User = require('../models/user');
const jsonschema = require('jsonschema');
// const userSchema = require('../schema/user-schema.json');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');


/**
 * GET /users
 * access: admin only
 */
router.get('/', async function(request, response, next) {
    try {
        const result = await User.getAllUsers(); //pass params, will be read by user.get() as an options obj and destructured within function.
        return response.json(result);
    } catch(err) {
        return next(err);
    }
});



/**
 * GET /users/:email
 * access: certain user only
*/
router.get('/:email', async function(request, response, next) {
    try {
        //get userEmail from request params object
        const { email } = request.params;
        const decodedEmail = decodeURIComponent(email);
        const user = await User.getUserByEmail(decodedEmail);
        return response.json(user);
    } catch(err) {
        return next(err);
    }
});

/** 
 * 
 * 
 * 
 * 
 * 
 * {
    "newUser": {
        "result": {
            "ok": 1,
            "n": 1
        },
        "ops": [
            {
                "name": "Austin",
                "email": "aserif@me.com",
                "password": {},
                "_id": "5fbb33dcfd52a72383f3285f"
            }
        ],
        "insertedCount": 1,
        "insertedIds": {
            "0": "5fbb33dcfd52a72383f3285f"
        }
    }
}


 * POST /users
 * access: anyone
*/
router.post('/', async function(request, response, next) {
    try {
        //get user object from request.body
        const { name, email, password } = request.body;

        //validate schema

        //create new user 
        const newUser = await User.createNewUser({ name, email, password });

        //return response
        return response.json(newUser);
    } catch(err) {
        return next(err);
    }
});

module.exports = router;

/**
 * UPDATE /users/:id
 * access: ceratin user only
*/