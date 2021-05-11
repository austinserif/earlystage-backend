const express = require('express');
const router = express.Router();
const User = require('../models/user');

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

module.exports = router;