/** user.js file contains logic for  */

const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const router = express.Router();
const User = require('../models/user');
const { validateNewUser, validateUpdatedUser } = require('../middleware/schema-validation');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');
const workspaces = require('./workspaces');
const questions = require('./questions');
const components = require('./components');
router.use(questions);
router.use(workspaces);
router.use(components);

/**
 * GET /users
 * access: admin only
 */
router.get('/', authorizeAdmin, async function(request, response, next) {
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
router.get('/:email', authorizeCertainUser, async function(request, response, next) {
    try {
        //get userEmail from request params object
        const { email } = request.params;
        const decodedEmail = decodeURIComponent(email);
        const user = await User.getUserByEmail(decodedEmail, isFiltered=true, allData=true);
        return response.json(user);
    } catch(err) {
        return next(err);
    }
});

/** 
 * POST /users
 * access: anyone
*/
router.post('/', validateNewUser, async function(request, response, next) {
    try {
        //get user object from request.body
        const { name, email, password } = request.body;

        //validate schema

        //create new user
        const successMsg = await User.createNewUser({ name, email, password });

        //return response with success msg
        return response.json(successMsg).status(201);
    } catch(err) {
        return next(err);
    }
});


/**
 * PATCH /users/:email
 * access: ceratin user only
 * 
 * This endpoint takes a `email` as a parameter, and an `updates` array outlining the 
 * fields and values to be updated.
 * 
 * `request.body.updates = [ 
 *      { key: "accounts.isVerified", value: true },
 *      { key: "metadata.lastModified", value: "2020-11-25T00:34:44.847Z"}
 * ]`
 * 
 * 
*/
router.patch('/:email', authorizeCertainUser, validateUpdatedUser, async function(request, response, next) {
    try {
        //get target email from params object, this email could be encoded or not
        const { email } = request.params;

        //retrieve updates array from request body
        const { updates } = request.body;

        //decode email
        const decodedEmail = decodeURIComponent(email);
        
        //pass decoded email and updates array to the update method
        await User.update(decodedEmail, updates);

        return response.json({message: "User updated"});
    } catch(err) {
        return next(err);
    }
});

router.delete('/:email', authorizeCertainUser, async function(request, response, next) {
    try {
        //get email from url params
        const { email } = request.params;

        //decode email
        const decodedEmail = decodeURIComponent(email);

        //get password from request body
        const { password } = request.body;

        //if no password throw error
        if (!password) {
            throw new ExpressError('Must include valid password credential in the request body to delete resource', 401);
        }

        //response from database method, will throw error if failure has occurred
        await User.delete(decodedEmail, password);

        //return response
        return response.json({message: 'Resource deleted'});

    } catch(err) {
        return next(err);
    }
});




module.exports = router;