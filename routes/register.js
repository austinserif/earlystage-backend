const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ExpressError = require('../helpers/ExpressError');

/** POST /register
 * 
 * Takes an email string as a query string parameter
 * and attempts to register a new user object. If one 
 * already exists, or an error will be thrown from the 
 * database model method called inside the controller, 
 * and this controller will pass that error on to the client.
 * If the email is not yet registered, or registered and 
 * verification is just incomplete, the endpoint send a link
 * to the new user's email where they can complete registration.
 */
router.post('/', async function(request, response, next) {
    try {
        // get email from query string params
        const { email } = request.query;

        if (!email) throw new ExpressError('An error occured trying to understand your email, please try again.', 500); 

        const result = await User.createNewAccount(email);

        return response.json(result);
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

/**
 * Checks whether or not a users "code" corresponds to an account that has been registered, but 
 * still remains unverified. The block returns a response containing a boolean property: `isUnverifiedUser`.
 */
router.get('/check-user', async function( request, response, next) {
    try {
        // get code from query string params
        const code = request.query.code;

        // check to see if code param is valid
        if (!code) throw new ExpressError('Please pass "code" param as a query string parameter', 404);

        // check id against database
        const result = await User.checkForUnverifiedUser(code);

        if (result.isUnverifiedUser) {
            // return result.isUnverifiedUser in response
            return response.json({
                isUnverifiedUser: result.isUnverifiedUser
            });            
        } else {
            throw new ExpressError('No unverified user associated with this code', 404);
        }
    } catch (err) {
        next(err);
    }
});

/** 
 * Handles post request containing fields with which to update the user document, and
 * mark them as verified.
 */
router.post('/finish', async function(request, response, next) {
    try {
        // get id from query string params
        const id = request.query.id;
        if (!id) throw new ExpressError('You must pass a valid "id" param as a query string', 400);
        
        //initialize updatesArray
        
        const updatesArray = [];

        // check password since passed seperately
        if (request.body.password === undefined) throw new ExpressError('Request body is missing password property', 400)

        const contentsArray = ['firstName', 'lastName', 'accountType'];

        contentsArray.forEach((v) => {
            // check that value is represented in request body
            const value = request.body[v];
            if (value === 'undefined') throw new ExpressError(`Request body is missing ${v} property`, 400);
            updatesArray.push({ field: `account.${v}`, value });
        });

        // add isVerified to updatesArray
        updatesArray.push({ field: 'account.isVerified', value: true });

        const result = await User.completeRegistration(id, request.body.password, updatesArray);

        return response.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;