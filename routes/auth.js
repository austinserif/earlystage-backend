const express = require('express');
const User = require('../models/user');
const router = express.Router();

/** POST /login
 * authenticate a user and return JSON Web Token
 * w/ a payload including values for:
 * - email
 * - isVerified
 * - isAdmin
 * - name
 * 
 *      --> {token: token}
 */
router.post('/', async function(request, response, next) {
    try {
        const { email, password } = request.body;
        const { token } = await User.login({email, password});
        return response.json({token});
    } catch(err) {
        return next(err);
    }
});

/** POST /login/verify
 * Takes an email and verificationCode in the request body and returns
 * a success message if model verification method validates credentials.
 */
router.post('/verify', async function(request, response, next) {
    try {
        const { email, code } = request.body;
        await User.verifyAccount(email, code);
        return response.json({message: "You account has been verified!"}).statusCode(203);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;