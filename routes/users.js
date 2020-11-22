/** user.js file contains logic for  */

const express = require('express');
const ExpressError = require('../helpers/expressError');
const router = express.Router();
const User = require('../models/user');
const jsonschema = require('jsonschema');
const userSchema = require('../schema/user-schema.json');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');


/**
 * GET /users
 * access: admin only
 */
router.get('/', authorizeAdmin, async function(request, response, next) {
    try {
        const { users } = await User.readAll(); //pass params, will be read by user.get() as an options obj and destructured within function.
        return response.json({ users });
    } catch(err) {
        return next(err);
    }
});

/**
 * GET /users/:id
 * access: certain user only
*/
router.get('/', authorizeCertainUser, async function(request, response, next) {
    try {
        //get userId from request params object
        const { userId } = request.params;
        const user = await User.getUserById(userId);
        return response.json({ user });
    } catch(err) {
        return next(err);
    }
});

/** 
 * POST /users
 * access: anyone
*/

/**
 * UPDATE /users/:id
 * access: ceratin user only
*/