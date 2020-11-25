const express = require('express');
const User = require('../models/user');
const router = express.Router();

/** POST /login
 * authenticate a user and return JSON Web Token
 * w/ a payload including values for:
 * - username
 * - is_admin
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

router.post('/verify', async function(request, response, next) {
    try {
        const { email, code } = request.body;
        const res = await User.verifyAccount(email, code);
        return response.json(res);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;