/** user.js file contains logic for  */

const express = require('express');
const ExpressError = require('../helpers/expressError');
const router = express.Router();
const User = require('../models/user');
const jsonschema = require('jsonschema');
const { validateNewUser, validateUpdatedUser } = require('../middleware/schema-validation');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const { authorizeCertainUser, authorizeAdmin } = require('../middleware/route-protection');

/**
 *  GET /users/workspaces/:email
*/
router.get('/:email', authorizeCertainUser, async function(request, response, next) {
    try {
        const { email } = request.params;
        const res = await User.getUserByEmail(email);
        const { workspaces } = res;
        return response.json(workspaces);
    } catch(err) {
        return next(err);
    }
});

/** 
 * POST /users/workspaces/:email
 * 
 * create a new workspace for a given user
 * 
 *  */
router.post('/:email', authorizeCertainUser, async function(request, response, next) {
    try {
        const { email } = request.params;
        const { workspace } = request.body;
        const res = await Workspaces.new(email, workspace);
    } catch(err) {
        return next(err);
    }
})

module.exports = router;